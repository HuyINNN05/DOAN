import { Router } from 'express'
import fs from 'node:fs/promises'
import path from 'node:path'
import { db } from '../config/database.js'
import { env } from '../config/env.js'
import { authenticate } from '../middleware/authMiddleware.js'
import { validateIdParam } from '../middleware/validateIdParam.js'
import { AppError } from '../utils/AppError.js'

const router = Router()
router.param('id', validateIdParam)
router.use(authenticate)
router.get('/:kind/:id/download', async (req, res, next) => {
  try {
    const { kind, id } = req.params, actor = req.user
    let rows
    if (kind === 'cvs') {
      ;[rows] = await db.execute(`SELECT cv.file_path,cv.file_name,cv.mime_type FROM cvs cv JOIN students s ON s.id=cv.student_id
        WHERE cv.id=? AND (?='admin' OR s.user_id=? OR
        (?='company' AND EXISTS(SELECT 1 FROM applications a JOIN jobs j ON j.id=a.job_id JOIN company_accounts ca ON ca.company_id=j.company_id WHERE a.cv_id=cv.id AND ca.user_id=?)) OR
        (?='lecturer' AND EXISTS(SELECT 1 FROM applications a JOIN lecturer_assignments la ON la.student_id=a.student_id AND la.internship_period_id=a.internship_period_id JOIN lecturers l ON l.id=la.lecturer_id WHERE a.cv_id=cv.id AND l.user_id=?)))`,
      [id,actor.role,actor.sub,actor.role,actor.sub,actor.role,actor.sub])
    } else if (kind === 'reports') {
      ;[rows] = await db.execute(`SELECT r.file_path,r.file_name,r.mime_type FROM reports r JOIN internship_records ir ON ir.id=r.internship_record_id JOIN students s ON s.id=ir.student_id
        LEFT JOIN lecturers l ON l.id=ir.lecturer_id WHERE r.id=? AND (?='admin' OR s.user_id=? OR (?='lecturer' AND l.user_id=?))`,
      [id,actor.role,actor.sub,actor.role,actor.sub])
    } else throw new AppError(404, 'DOCUMENT_NOT_FOUND', 'Không tìm thấy tài liệu')
    if (!rows.length) throw new AppError(404, 'DOCUMENT_NOT_FOUND', 'Không tìm thấy tài liệu')
    let root, file
    try { root = await fs.realpath(path.resolve(env.UPLOAD_DIR)); file = await fs.realpath(path.resolve(rows[0].file_path)) }
    catch (error) { if (error.code === 'ENOENT') throw new AppError(404, 'DOCUMENT_FILE_MISSING', 'Tệp tài liệu không còn trên máy chủ'); throw error }
    if (!file.startsWith(`${root}${path.sep}`)) throw new AppError(403, 'INVALID_FILE_PATH', 'Đường dẫn tài liệu không hợp lệ')
    res.type(rows[0].mime_type)
    res.download(file, path.basename(rows[0].file_name), error => { if (error) next(error) })
  } catch (error) { next(error) }
})
export default router
