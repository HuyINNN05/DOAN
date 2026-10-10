import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { Buffer } from 'node:buffer'
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

export function validateDocumentContent(bytes, extension) {
  const invalid = () => { throw new AppError(422, 'INVALID_FILE_CONTENT', 'Nội dung tệp không đúng định dạng tài liệu') }
  if (bytes.length < 8) invalid()
  if (extension === '.pdf') {
    if (!/^%PDF-\d\.\d/.test(bytes.subarray(0, 16).toString('ascii')) || !bytes.subarray(-1024).includes(Buffer.from('%%EOF'))) invalid()
  } else if (extension === '.doc') {
    if (bytes.length < 512 || !bytes.subarray(0, 8).equals(Buffer.from('d0cf11e0a1b11ae1', 'hex'))) invalid()
  } else if (extension === '.docx') {
    // Read central-directory names, rather than trusting a renamed generic ZIP.
    if (bytes.readUInt32LE(0) !== 0x04034b50) invalid()
    let end = -1
    for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) {
      if (bytes.readUInt32LE(i) === 0x06054b50) { end = i; break }
    }
    if (end < 0) invalid()
    let offset = bytes.readUInt32LE(end + 16)
    const count = bytes.readUInt16LE(end + 10), names = new Set()
    for (let i = 0; i < count; i++) {
      if (offset + 46 > end || bytes.readUInt32LE(offset) !== 0x02014b50) invalid()
      const length = bytes.readUInt16LE(offset + 28)
      const next = offset + 46 + length + bytes.readUInt16LE(offset + 30) + bytes.readUInt16LE(offset + 32)
      if (next > end || bytes.readUInt16LE(offset + 8) & 1) invalid()
      names.add(bytes.subarray(offset + 46, offset + 46 + length).toString('utf8'))
      offset = next
    }
    if (!names.has('[Content_Types].xml') || !names.has('word/document.xml')) invalid()
  } else invalid()
}

export async function verifyUploadedDocument(file) {
  try {
    const bytes = await fs.readFile(file.path)
    if (bytes.length < 8) throw new AppError(422, 'INVALID_FILE_CONTENT', 'Tệp tài liệu trống hoặc hỏng')
    validateDocumentContent(bytes, validateDocument(file))
  } catch (error) {
    await remove(file.path)
    throw error
  }
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
