import fs from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import multer from 'multer'
import { env } from '../config/env.js'
import { relativePath, validateDocument } from '../services/fileStorageService.js'

const root = path.resolve(env.UPLOAD_DIR)
fs.mkdirSync(root, { recursive: true })
const storage = multer.diskStorage({
  destination: (_req, _file, done) => done(null, root),
  filename: (_req, file, done) => {
    try { done(null, `${randomUUID()}${validateDocument(file)}`) } catch (error) { done(error) }
  },
})
export const documentUpload = multer({
  storage,
  limits: { fileSize: env.MAX_UPLOAD_BYTES, files: 1 },
  fileFilter: (_req, file, done) => {
    try { validateDocument(file); done(null, true) } catch (error) { done(error) }
  },
})
export const relativeUploadPath = relativePath
