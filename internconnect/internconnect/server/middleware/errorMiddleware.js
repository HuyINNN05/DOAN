import process from 'node:process'
import multer from 'multer'
import { AppError } from '../utils/AppError.js'
export const notFound = (req, _res, next) => next(new AppError(404, 'ROUTE_NOT_FOUND', `Không tìm thấy ${req.method} ${req.path}`))
export function errorHandler(error, _req, res, next) {
  if (res.headersSent) return next(error)
  if (error instanceof SyntaxError && 'body' in error) error = new AppError(400, 'INVALID_JSON', 'Nội dung JSON không hợp lệ')
  if (error.code === 'ER_DUP_ENTRY') error = new AppError(409, 'DUPLICATE_DATA', 'Dữ liệu đã tồn tại')
  if (['ER_NO_REFERENCED_ROW_2', 'ER_ROW_IS_REFERENCED_2'].includes(error.code)) error = new AppError(409, 'RELATED_DATA_CONFLICT', 'Dữ liệu liên quan không tồn tại hoặc đang được sử dụng')
  if (['ECONNREFUSED', 'PROTOCOL_CONNECTION_LOST', 'ER_CON_COUNT_ERROR'].includes(error.code)) error = new AppError(503, 'DATABASE_UNAVAILABLE', 'Database tạm thời không sẵn sàng')
  if (error instanceof multer.MulterError) error = new AppError(422, 'UPLOAD_ERROR', error.code === 'LIMIT_FILE_SIZE' ? 'Tệp vượt quá dung lượng cho phép' : 'Tệp tải lên không hợp lệ')
  const status = error.status || 500
  if (status === 500 && process.env.NODE_ENV !== 'test') console.error(error)
  res.status(status).json({ success: false, error: { code: error.code || 'INTERNAL_ERROR', message: status === 500 ? 'Lỗi máy chủ' : error.message, ...(error.details && { details: error.details }) } })
}
