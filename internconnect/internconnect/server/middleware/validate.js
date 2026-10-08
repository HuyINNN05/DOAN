import { AppError } from '../utils/AppError.js'
export const validate = (schema, source = 'body') => (req, _res, next) => {
  const result = schema.safeParse(req[source])
  if (!result.success) return next(new AppError(422, 'VALIDATION_ERROR', 'Dữ liệu không hợp lệ', result.error.flatten()))
  req[source] = result.data; next()
}
