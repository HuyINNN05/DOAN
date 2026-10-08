import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { AppError } from '../utils/AppError.js'

const documentTypes = new Map([
  ['application/pdf', new Set(['.pdf'])],
  ['application/msword', new Set(['.doc'])],
  ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', new Set(['.docx'])],
])

export function validateDocument(file) {
  const extension = path.extname(file.originalname || '').toLowerCase()
  const allowedExtensions = documentTypes.get(file.mimetype)
  if (!allowedExtensions?.has(extension)) {
    throw new AppError(422, 'UNSUPPORTED_FILE', 'Chỉ hỗ trợ tệp PDF, DOC và DOCX đúng định dạng')
  }
  return extension
}

export function relativePath(file) {
  return path.relative(process.cwd(), file.path).replaceAll('\\', '/')
}

export async function remove(storedPath) {
  if (!storedPath) return
  const resolved = path.resolve(storedPath)
  const uploadRoot = path.resolve(process.env.UPLOAD_DIR || 'uploads')
  if (resolved !== uploadRoot && !resolved.startsWith(`${uploadRoot}${path.sep}`)) {
    throw new AppError(400, 'INVALID_FILE_PATH', 'Đường dẫn tệp không hợp lệ')
  }
  await fs.unlink(resolved).catch((error) => {
    if (error.code !== 'ENOENT') throw error
  })
}
