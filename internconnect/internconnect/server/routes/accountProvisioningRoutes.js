import { Router } from 'express'
import multer from 'multer'
import { TextDecoder } from 'node:util'
import { authenticate, authorizeRoles } from '../middleware/authMiddleware.js'
import { validate } from '../middleware/validate.js'
import { validateIdParam } from '../middleware/validateIdParam.js'
import { accountSchema } from '../validation/accountProvisioning.js'
import { AppError } from '../utils/AppError.js'
import { parseAccountCsv } from '../../shared/accountCsv.js'
import * as service from '../services/accountProvisioningService.js'
const router = Router(), asyncRoute = handler => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 1024 * 1024, files: 1, fields: 0 }, fileFilter: (_req, file, callback) => {
  if (!/\.csv$/i.test(file.originalname) || !['text/csv','text/plain','application/csv','application/vnd.ms-excel','application/octet-stream'].includes(file.mimetype)) return callback(new AppError(422, 'CSV_REQUIRED', 'Chỉ nhận file CSV UTF-8. Excel: lưu thành CSV UTF-8 trước khi tải lên.'))
  callback(null, true)
} })
function records(req) {
  if (!req.file) throw new AppError(422, 'CSV_REQUIRED', 'Vui lòng chọn file CSV')
  try { return parseAccountCsv(new TextDecoder('utf-8', { fatal: true }).decode(req.file.buffer)) }
  catch (error) { throw new AppError(422, 'INVALID_CSV', error.message.startsWith('The encoded') ? 'File phải dùng mã hóa UTF-8.' : error.message) }
}
router.use(authenticate, authorizeRoles('admin'))
router.param('id', validateIdParam)
router.post('/', validate(accountSchema), asyncRoute(async (req, res) => res.status(201).json({ success: true, data: await service.createAccount(req.user, req.body) })))
router.post('/import/preview', upload.single('file'), asyncRoute(async (req, res) => {
  const results = await service.previewAccounts(records(req))
  res.json({ success: true, data: { results, summary: { total: results.length, valid: results.filter(row => row.status === 'valid').length, errors: results.filter(row => row.status === 'error').length } } })
}))
router.post('/import', upload.single('file'), asyncRoute(async (req, res) => res.json({ success: true, data: await service.importAccounts(req.user, records(req)) })))
router.post('/:id/resend-activation', asyncRoute(async (req, res) => res.json({ success: true, data: await service.resendActivation(req.user, req.params.id) })))
export default router
