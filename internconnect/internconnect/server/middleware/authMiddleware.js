import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { AppError } from '../utils/AppError.js'
import { findUserById } from '../repositories/userRepository.js'
import { credentialVersion } from '../services/tokenService.js'
export const createAuthenticate = (lookup = findUserById) => async (req, _res, next) => {
  const token = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1]
  if (!token) return next(new AppError(401, 'AUTH_REQUIRED', 'Vui lòng đăng nhập'))
  let claims
  try { claims = jwt.verify(token, env.JWT_ACCESS_SECRET, { algorithms: ['HS256'], issuer: 'internconnect', audience: 'internconnect-web' }) }
  catch (error) { next(new AppError(401, error.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID', 'Phiên đăng nhập không hợp lệ')) }
  if (!claims) return
  try {
    const user = await lookup(claims.sub)
    if (!user || user.status !== 'active') return next(new AppError(403, 'USER_NOT_ACTIVE', 'Tài khoản không hoạt động'))
    const expected=req.headers['x-expected-user']
    if(expected&&String(user.id)!==String(expected))return next(new AppError(401,'SESSION_ACCOUNT_MISMATCH','Phiên đăng nhập đã khác tài khoản trong tab. Vui lòng đăng nhập lại'))
    if (user.role !== claims.role || claims.credentialVersion !== credentialVersion(user)) return next(new AppError(401, 'TOKEN_INVALID', 'Tài khoản đã thay đổi, vui lòng đăng nhập lại'))
    req.user = claims
    next()
  } catch (error) { next(error) }
}
export const authenticate = createAuthenticate()
export const authorizeRoles = (...roles) => (req, _res, next) => roles.includes(req.user?.role) ? next() : next(new AppError(403, 'FORBIDDEN', 'Bạn không có quyền thực hiện thao tác này'))
