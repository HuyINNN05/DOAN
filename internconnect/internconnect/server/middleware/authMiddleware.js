import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { AppError } from '../utils/AppError.js'
export function authenticate(req, _res, next) {
  const token = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1]
  if (!token) return next(new AppError(401, 'AUTH_REQUIRED', 'Vui lòng đăng nhập'))
  try { req.user = jwt.verify(token, env.JWT_ACCESS_SECRET, { algorithms: ['HS256'], issuer: 'internconnect', audience: 'internconnect-web' }); next() }
  catch (error) { next(new AppError(401, error.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID', 'Phiên đăng nhập không hợp lệ')) }
}
export const authorizeRoles = (...roles) => (req, _res, next) => roles.includes(req.user?.role) ? next() : next(new AppError(403, 'FORBIDDEN', 'Bạn không có quyền thực hiện thao tác này'))
