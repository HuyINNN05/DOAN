import { Buffer } from 'node:buffer'
import { z } from 'zod'
const optional = max => z.string().trim().max(max).optional().default('')
const common = { fullName: z.string().trim().min(2, 'Họ tên phải có ít nhất 2 ký tự').max(150), email: z.string().trim().toLowerCase().pipe(z.email('Email không hợp lệ').max(255)), phone: optional(30), faculty: optional(150) }
const code = z.string().trim().min(1, 'Mã không được để trống').max(50).regex(/^[\p{L}\p{N}._-]+$/u, 'Mã chỉ gồm chữ, số, dấu chấm, gạch dưới hoặc gạch ngang')
export const accountSchema = z.discriminatedUnion('role', [
  z.object({ ...common, role: z.literal('student'), studentCode: code, lecturerCode: z.literal('').optional(), major: optional(150), className: optional(100), course: optional(50), department: z.literal('').optional(), academicTitle: z.literal('').optional() }).strict(),
  z.object({ ...common, role: z.literal('lecturer'), lecturerCode: code, studentCode: z.literal('').optional(), department: optional(150), academicTitle: optional(100), major: z.literal('').optional(), className: z.literal('').optional(), course: z.literal('').optional() }).strict(),
])
export const activationSchema = z.object({ token: z.string().regex(/^[a-f0-9]{64}$/), password: z.string().min(8).max(128).refine(value => Buffer.byteLength(value, 'utf8') <= 72, 'Mật khẩu không được vượt quá 72 byte UTF-8') }).strict()
