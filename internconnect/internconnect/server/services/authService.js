import { Buffer } from 'node:buffer'
import { randomBytes } from 'node:crypto'
import process from 'node:process'
import bcrypt from 'bcryptjs'
import { db, transaction } from '../config/database.js'
import { AppError } from '../utils/AppError.js'
import { findUserByEmail, findUserById, publicUser } from '../repositories/userRepository.js'
import { createAccessToken, createRefreshToken, hashToken, verifyRefreshToken } from './tokenService.js'

const expiry = (token) => new Date(JSON.parse(Buffer.from(token.split('.')[1], 'base64url')).exp * 1000)

async function auditLoginFailure(user, email, metadata = {}) {
  try {
    await db.execute(`INSERT INTO audit_logs(actor_user_id,action,entity_type,entity_id,new_values,ip_address,user_agent)
      VALUES(?,'LOGIN_FAILED','user',?,JSON_OBJECT('email',?),?,?)`,
    [user?.id || null, user?.id || null, email.toLowerCase(), metadata.ip || null, metadata.userAgent?.slice(0, 500) || null])
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') console.error('Không thể ghi audit đăng nhập thất bại', error.message)
  }
}

export async function login(email, password, metadata) {
  const user = await findUserByEmail(email.toLowerCase())
  if (!user || !await bcrypt.compare(password, user.password_hash)) {
    await auditLoginFailure(user, email, metadata)
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Email hoặc mật khẩu không đúng')
  }
  if (user.status !== 'active') {
    await auditLoginFailure(user, email, metadata)
    throw new AppError(403, `USER_${user.status.toUpperCase()}`, 'Tài khoản chưa được phép đăng nhập')
  }
  const refresh = createRefreshToken(user)
  await transaction(async (connection) => {
    await connection.execute('UPDATE users SET last_login_at=NOW() WHERE id=?', [user.id])
    await connection.execute('INSERT INTO refresh_tokens(user_id,token_hash,family_id,expires_at) VALUES(?,?,?,?)', [user.id, hashToken(refresh.token), refresh.familyId, expiry(refresh.token)])
  })
  return { accessToken: createAccessToken(user), refreshToken: refresh.token, user: publicUser(user) }
}

export async function refresh(rawToken) {
  let payload
  try { payload = verifyRefreshToken(rawToken) } catch { throw new AppError(401, 'REFRESH_TOKEN_INVALID', 'Refresh token không hợp lệ') }
  const result = await transaction(async (connection) => {
    const [rows] = await connection.execute('SELECT * FROM refresh_tokens WHERE token_hash=? FOR UPDATE', [hashToken(rawToken)])
    const stored = rows[0]
    if (!stored) return { rejected: true }
    if (stored.revoked_at) {
      await connection.execute('UPDATE refresh_tokens SET revoked_at=COALESCE(revoked_at,NOW()) WHERE family_id=?', [stored.family_id])
      await connection.execute(`INSERT INTO audit_logs(actor_user_id,action,entity_type,entity_id,new_values) VALUES(?,'REFRESH_TOKEN_REPLAY','user',?,JSON_OBJECT('family_id',?))`, [stored.user_id, stored.user_id, stored.family_id])
      return { replayed: true }
    }
    if (new Date(stored.expires_at) <= new Date()) return { rejected: true }
    const user = await findUserById(payload.sub, connection)
    if (!user || user.status !== 'active') throw new AppError(403, 'USER_NOT_ACTIVE', 'Tài khoản không hoạt động')
    const next = createRefreshToken(user, stored.family_id)
    await connection.execute('UPDATE refresh_tokens SET revoked_at=NOW(),replaced_by_hash=? WHERE id=?', [hashToken(next.token), stored.id])
    await connection.execute('INSERT INTO refresh_tokens(user_id,token_hash,family_id,expires_at) VALUES(?,?,?,?)', [user.id, hashToken(next.token), stored.family_id, expiry(next.token)])
    return { accessToken: createAccessToken(user), refreshToken: next.token, user: publicUser(user) }
  })
  if (result.replayed) throw new AppError(401, 'REFRESH_TOKEN_REPLAYED', 'Phát hiện phiên đăng nhập đã bị sử dụng lại')
  if (result.rejected) throw new AppError(401, 'REFRESH_TOKEN_REVOKED', 'Phiên đăng nhập đã hết hạn')
  return result
}

export async function logout(rawToken) { if (rawToken) await db.execute('UPDATE refresh_tokens SET revoked_at=COALESCE(revoked_at,NOW()) WHERE token_hash=?', [hashToken(rawToken)]) }

export async function registerCompany(input) {
  const passwordHash = await bcrypt.hash(input.password, 12)
  return transaction(async (connection) => {
    const [userResult] = await connection.execute(`INSERT INTO users(email,password_hash,full_name,phone,role,status) VALUES(?,?,?,?,'company','pending')`, [input.email.toLowerCase(), passwordHash, input.fullName, input.phone || null])
    const [companyResult] = await connection.execute(`INSERT INTO companies(name,tax_code,email,phone,website,address,description,industry,company_size,status) VALUES(?,?,?,?,?,?,?,?,?,'pending')`, [input.companyName, input.taxCode, input.companyEmail.toLowerCase(), input.companyPhone || null, input.website || null, input.address || null, input.description || null, input.industry || null, input.companySize || null])
    await connection.execute('INSERT INTO company_accounts(user_id,company_id,position,is_owner) VALUES(?,?,?,TRUE)', [userResult.insertId, companyResult.insertId, input.position || null])
    return { id: userResult.insertId, companyId: companyResult.insertId, status: 'pending' }
  })
}

export async function forgotPassword(email) {
  const user = await findUserByEmail(email.toLowerCase())
  if (!user) return { accepted: true }
  const token = randomBytes(32).toString('hex')
  await transaction(async (connection) => {
    await connection.execute('UPDATE password_reset_tokens SET used_at=COALESCE(used_at,NOW()) WHERE user_id=? AND used_at IS NULL', [user.id])
    await connection.execute('INSERT INTO password_reset_tokens(user_id,token_hash,expires_at) VALUES(?,?,DATE_ADD(NOW(),INTERVAL 30 MINUTE))', [user.id, hashToken(token)])
  })
  return { accepted: true, ...(process.env.NODE_ENV === 'development' && { resetToken: token }) }
}

export async function resetPassword(token, password) {
  const passwordHash = await bcrypt.hash(password, 12)
  return transaction(async (connection) => {
    const [rows] = await connection.execute('SELECT * FROM password_reset_tokens WHERE token_hash=? AND used_at IS NULL AND expires_at>NOW() FOR UPDATE', [hashToken(token)])
    if (!rows[0]) throw new AppError(422, 'RESET_TOKEN_INVALID', 'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn')
    await connection.execute('UPDATE users SET password_hash=? WHERE id=?', [passwordHash, rows[0].user_id])
    await connection.execute('UPDATE password_reset_tokens SET used_at=NOW() WHERE id=?', [rows[0].id])
    await connection.execute('UPDATE refresh_tokens SET revoked_at=COALESCE(revoked_at,NOW()) WHERE user_id=?', [rows[0].user_id])
    return { reset: true }
  })
}
