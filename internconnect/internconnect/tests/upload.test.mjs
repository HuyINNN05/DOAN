import test from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { relativePath, validateDocument } from '../server/services/fileStorageService.js'

test('chấp nhận đúng cặp MIME và extension tài liệu', () => {
  assert.equal(validateDocument({ mimetype: 'application/pdf', originalname: 'cv.PDF' }), '.pdf')
  assert.equal(validateDocument({ mimetype: 'application/msword', originalname: 'cv.doc' }), '.doc')
  assert.equal(validateDocument({ mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', originalname: 'report.docx' }), '.docx')
})

test('từ chối executable, ảnh và MIME giả mạo', () => {
  for (const file of [
    { mimetype: 'application/octet-stream', originalname: 'malware.exe' },
    { mimetype: 'image/png', originalname: 'image.png' },
    { mimetype: 'application/pdf', originalname: 'malware.exe' },
  ]) assert.throws(() => validateDocument(file), (error) => error.code === 'UNSUPPORTED_FILE' && error.status === 422)
})

test('đường dẫn lưu trả về dạng tương đối và không chứa tên client', () => {
  const stored = path.join(process.cwd(), 'uploads', 'uuid.pdf')
  assert.equal(relativePath({ path: stored }), 'uploads/uuid.pdf')
})
