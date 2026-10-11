import process from 'node:process'
import { z } from 'zod'

const result = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  DB_HOST: z.string().default('127.0.0.1'), DB_PORT: z.coerce.number().int().min(1).max(65535).default(3306),
  DB_USER: z.string().default('root'), DB_PASSWORD: z.string().default(''),
  DB_NAME: z.string().regex(/^[A-Za-z0-9_]{1,64}$/).optional(), // Legacy alias for the school database.
  DB_SCHOOL_NAME: z.string().regex(/^[A-Za-z0-9_]{1,64}$/).optional(),
  DB_COMPANY_NAME: z.string().regex(/^[A-Za-z0-9_]{1,64}$/).default('internconnect_company'),
  JWT_ACCESS_SECRET: z.string().min(32).default('development-access-secret-change-me'),
  JWT_REFRESH_SECRET: z.string().min(32).default('development-refresh-secret-change-me'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'), JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'), UPLOAD_DIR: z.string().default('uploads'),
  MAX_UPLOAD_BYTES: z.coerce.number().positive().default(5242880),
  SMTP_HOST: z.string().default(''), SMTP_PORT: z.coerce.number().int().min(1).max(65535).default(587),
  SMTP_SECURE: z.enum(['true','false']).default('false').transform(value => value === 'true'),
  SMTP_REQUIRE_TLS: z.enum(['true','false']).default('true').transform(value => value === 'true'),
  SMTP_USER: z.string().default(''), SMTP_PASSWORD: z.string().default(''), SMTP_FROM: z.string().default(''),
  APP_PUBLIC_URL: z.union([z.url().refine(value => /^https?:\/\//i.test(value), 'Frontend URL must use HTTP(S)'), z.literal('')]).default(''),
  ACCOUNT_ACTIVATION_HOURS: z.coerce.number().int().min(1).max(168).default(24),
  SCHOOL_EMAIL_DOMAINS: z.string().default(''),
}).safeParse(process.env)
if (!result.success) throw new Error(`Invalid environment: ${result.error.message}`)
if (result.data.JWT_ACCESS_SECRET === result.data.JWT_REFRESH_SECRET) throw new Error('Access and refresh secrets must be different')
if (result.data.NODE_ENV === 'production' && [result.data.JWT_ACCESS_SECRET, result.data.JWT_REFRESH_SECRET].some(secret => secret.startsWith('development-'))) throw new Error('Production requires custom JWT secrets')
const schoolDatabase = result.data.DB_SCHOOL_NAME || result.data.DB_NAME || 'internconnect_school'
if (schoolDatabase === result.data.DB_COMPANY_NAME) throw new Error('School and company databases must have different names')
export const env = Object.freeze({ ...result.data, DB_NAME: schoolDatabase, DB_SCHOOL_NAME: schoolDatabase })
