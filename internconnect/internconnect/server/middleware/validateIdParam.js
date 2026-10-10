import { AppError } from '../utils/AppError.js'

export function validateIdParam(_req, _res, next, value) {
  if (!/^[1-9]\d*$/.test(String(value))) return next(new AppError(422, 'INVALID_ID', 'ID phải là số nguyên dương'))
  next()
}
