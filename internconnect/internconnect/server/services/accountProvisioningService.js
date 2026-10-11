import { randomBytes } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { db, transaction } from '../config/database.js'
import { env } from '../config/env.js'
import { AppError } from '../utils/AppError.js'
import { hashToken } from './tokenService.js'
import { sendAccountEmail } from './accountMailService.js'
import { accountSchema } from '../validation/accountProvisioning.js'

function validateAccount(input) {
  const result = accountSchema.safeParse(input)
  if (!result.success) throw new AppError(422, 'INVALID_ACCOUNT', 'Thông tin tài khoản không hợp lệ', result.error.flatten())
  const domains = env.SCHOOL_EMAIL_DOMAINS.split(',').map(value => value.trim().toLowerCase()).filter(Boolean)
  if (domains.length && !domains.includes(result.data.email.split('@')[1])) throw new AppError(422, 'INVALID_SCHOOL_EMAIL', 'Email không thuộc tên miền nhà trường cho phép')
  return result.data
}
async function checkDuplicates(input, executor = db) {
  const [emails] = await executor.execute('SELECT id FROM users WHERE email=?', [input.email])
  if (emails.length) throw new AppError(409, 'EMAIL_EXISTS', 'Email đã có tài khoản')
  const table = input.role === 'student' ? 'students' : 'lecturers', column = input.role === 'student' ? 'student_code' : 'lecturer_code'
  const [codes] = await executor.execute(`SELECT id FROM ${table} WHERE ${column}=?`, [input.studentCode || input.lecturerCode])
  if (codes.length) throw new AppError(409, 'CODE_EXISTS', 'Mã sinh viên/giảng viên đã tồn tại')
}
const errorResult = error => ({ code: error.code || 'ACCOUNT_CREATE_FAILED', message: error.status ? error.message : 'Không thể xử lý dòng này; vui lòng thử lại.', ...(error.details ? { details: error.details } : {}) })
async function audit(connection, actor, userId, action, values) {
  await connection.execute('INSERT INTO audit_logs(actor_user_id,action,entity_type,entity_id,new_values) VALUES(?,?,\'user\',?,?)', [actor.sub, action, userId, JSON.stringify(values)])
}
async function deliver(actor, user, token, mailer, resend = false) {
  let delivery
  try { delivery = await mailer({ email: user.email, fullName: user.fullName, token }) }
  catch { delivery = { status: 'failed', code: 'SMTP_SEND_FAILED', message: 'Gửi email thất bại. Có thể gửi lại từ danh sách tài khoản.' } }
  try {
    await transaction(async connection => {
      const [result] = await connection.execute("UPDATE account_invitations SET delivery_status=?,delivery_code=?,sent_at=IF(?='sent',NOW(),NULL) WHERE user_id=? AND token_hash=? AND used_at IS NULL", [delivery.status, delivery.code || null, delivery.status, user.id, hashToken(token)])
      if (!result.affectedRows) throw new AppError(409, 'INVITATION_SUPERSEDED', 'Lần gửi này đã được thay thế; kiểm tra trạng thái mới trong danh sách tài khoản')
      await audit(connection, actor, user.id, resend ? 'ACCOUNT_ACTIVATION_RESENT' : 'ACCOUNT_ACTIVATION_EMAIL', { deliveryStatus: delivery.status, deliveryCode: delivery.code || null })
    })
  } catch {
    return { status: 'unknown', code: 'DELIVERY_STATUS_UNAVAILABLE', message: 'Tài khoản đã tạo nhưng chưa xác nhận được trạng thái email trong hệ thống. Kiểm tra lại hoặc gửi lại.' }
  }
  return delivery
}
export async function createAccount(actor, raw, mailer = sendAccountEmail) {
  const input = validateAccount(raw)
  await checkDuplicates(input)
  const token = randomBytes(32).toString('hex'), passwordHash = await bcrypt.hash(randomBytes(32).toString('hex'), 12)
  let user
  try {
    user = await transaction(async connection => {
      await checkDuplicates(input, connection)
      const [result] = await connection.execute("INSERT INTO users(email,password_hash,full_name,phone,role,status) VALUES(?,?,?,?,?,'pending')", [input.email, passwordHash, input.fullName, input.phone || null, input.role])
      const id = result.insertId
      if (input.role === 'student') await connection.execute('INSERT INTO students(user_id,student_code,faculty,major,class_name,course) VALUES(?,?,?,?,?,?)', [id, input.studentCode, input.faculty || null, input.major || null, input.className || null, input.course || null])
      else await connection.execute('INSERT INTO lecturers(user_id,lecturer_code,faculty,department,academic_title) VALUES(?,?,?,?,?)', [id, input.lecturerCode, input.faculty || null, input.department || null, input.academicTitle || null])
      await connection.execute('INSERT INTO account_invitations(user_id,token_hash,expires_at,created_by) VALUES(?,?,DATE_ADD(NOW(),INTERVAL ? HOUR),?)', [id, hashToken(token), env.ACCOUNT_ACTIVATION_HOURS, actor.sub])
      await audit(connection, actor, id, 'ACCOUNT_PROVISIONED', { email: input.email, role: input.role, code: input.studentCode || input.lecturerCode, status: 'pending' })
      return { id, role: input.role, email: input.email, fullName: input.fullName, status: 'pending' }
    })
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') throw new AppError(409, 'ACCOUNT_EXISTS', 'Email hoặc mã đã được tạo; không ghi đè dữ liệu hiện có')
    if (error instanceof AppError) throw error
    throw new AppError(503, 'ACCOUNT_CREATE_FAILED', 'Không thể tạo tài khoản và hồ sơ; không lưu dữ liệu dở dang. Kiểm tra database rồi thử lại.')
  }
  return { ...user, delivery: await deliver(actor, user, token, mailer) }
}
export async function previewAccounts(records) {
  const seenEmails = new Set(), seenCodes = new Set(), results = []
  for (const record of records) {
    try {
      if (record.error) throw new AppError(422, 'INVALID_CSV_ROW', record.error)
      const data = validateAccount(record.data), code = `${data.role}:${(data.studentCode || data.lecturerCode).toLowerCase()}`
      if (seenEmails.has(data.email) || seenCodes.has(code)) throw new AppError(409, 'DUPLICATE_IN_FILE', 'Email hoặc mã bị trùng trong file')
      seenEmails.add(data.email); seenCodes.add(code)
      await checkDuplicates(data)
      results.push({ line: record.line, status: 'valid', data })
    } catch (error) { results.push({ line: record.line, status: 'error', data: record.data, error: errorResult(error) }) }
  }
  return results
}
export async function importAccounts(actor, records, mailer = sendAccountEmail) {
  const results = await previewAccounts(records)
  let next = 0
  await Promise.all(Array.from({ length: Math.min(4, results.length) }, async () => {
    while (next < results.length) {
      const index = next++, row = results[index]
      if (row.status !== 'valid') continue
      try { results[index] = { line: row.line, status: 'created', data: row.data, account: await createAccount(actor, row.data, mailer) } }
      catch (error) { results[index] = { ...row, status: 'error', error: errorResult(error) } }
    }
  }))
  return { results, summary: { total: results.length, created: results.filter(row => row.status === 'created').length, errors: results.filter(row => row.status === 'error').length,
    emailSent: results.filter(row => row.account?.delivery.status === 'sent').length, emailNotSent: results.filter(row => row.account && row.account.delivery.status !== 'sent').length } }
}
export async function resendActivation(actor, id, mailer = sendAccountEmail) {
  const token = randomBytes(32).toString('hex')
  const user = await transaction(async connection => {
    const [rows] = await connection.execute('SELECT u.id,u.email,u.full_name,u.role,u.status,i.used_at,i.delivery_status,i.attempted_at FROM users u JOIN account_invitations i ON i.user_id=u.id WHERE u.id=? FOR UPDATE', [id])
    const row = rows[0]
    if (!row || !['student','lecturer'].includes(row.role) || row.used_at || row.status !== 'pending') throw new AppError(409, 'ACCOUNT_NOT_AWAITING_ACTIVATION', 'Chỉ gửi lại cho tài khoản được cấp và đang chờ kích hoạt')
    if (row.delivery_status === 'pending' && new Date(row.attempted_at).getTime() > Date.now() - 60000) throw new AppError(409, 'EMAIL_IN_PROGRESS', 'Email đang được xử lý. Vui lòng thử lại sau một phút.')
    await connection.execute("UPDATE account_invitations SET token_hash=?,expires_at=DATE_ADD(NOW(),INTERVAL ? HOUR),delivery_status='pending',delivery_code=NULL,sent_at=NULL,attempted_at=NOW() WHERE user_id=?", [hashToken(token), env.ACCOUNT_ACTIVATION_HOURS, id])
    await audit(connection, actor, id, 'ACCOUNT_ACTIVATION_RESEND_REQUESTED', { role: row.role })
    return { id: Number(id), email: row.email, fullName: row.full_name }
  }).catch(error => { if (error instanceof AppError) throw error; throw new AppError(503, 'ACTIVATION_UNAVAILABLE', 'Không thể cấp lại liên kết. Kiểm tra database rồi thử lại.') })
  return { id: user.id, delivery: await deliver(actor, user, token, mailer, true) }
}
export async function activateAccount(token, password) {
  const passwordHash = await bcrypt.hash(password, 12)
  return transaction(async connection => {
    const [invitations] = await connection.execute('SELECT user_id FROM account_invitations WHERE token_hash=?', [hashToken(token)])
    const invitation = invitations[0]
    if (!invitation) throw new AppError(422, 'ACTIVATION_INVALID', 'Liên kết không hợp lệ, đã dùng hoặc đã hết hạn')
    const [users] = await connection.execute('SELECT role,status FROM users WHERE id=? FOR UPDATE', [invitation.user_id])
    const [rows] = await connection.execute("SELECT id FROM account_invitations WHERE user_id=? AND token_hash=? AND used_at IS NULL AND expires_at>NOW() AND delivery_status='sent' FOR UPDATE", [invitation.user_id, hashToken(token)])
    if (!rows.length || users[0]?.status !== 'pending' || !['student','lecturer'].includes(users[0]?.role)) throw new AppError(422, 'ACTIVATION_INVALID', 'Liên kết không hợp lệ, đã dùng hoặc đã hết hạn')
    await connection.execute("UPDATE users SET password_hash=?,status='active' WHERE id=?", [passwordHash, invitation.user_id])
    await connection.execute('UPDATE account_invitations SET used_at=NOW() WHERE id=?', [rows[0].id])
    await connection.execute('UPDATE refresh_tokens SET revoked_at=COALESCE(revoked_at,NOW()) WHERE user_id=?', [invitation.user_id])
    await connection.execute('UPDATE password_reset_tokens SET used_at=COALESCE(used_at,NOW()) WHERE user_id=?', [invitation.user_id])
    await audit(connection, { sub: invitation.user_id }, invitation.user_id, 'ACCOUNT_ACTIVATED', { status: 'active' })
    return { activated: true }
  }).catch(error => { if (error instanceof AppError) throw error; throw new AppError(503, 'ACTIVATION_UNAVAILABLE', 'Không thể kích hoạt lúc này. Vui lòng thử lại.') })
}
