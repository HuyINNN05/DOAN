import process from 'node:process'
import { z } from 'zod'

const result = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  DB_HOST: z.string().default('127.0.0.1'), DB_PORT: z.coerce.number().default(3306),
  DB_USER: z.string().default('root'), DB_PASSWORD: z.string().default(''), DB_NAME: z.string().default('internconnect'),
  JWT_ACCESS_SECRET: z.string().min(32).default('development-access-secret-change-me'),
  JWT_REFRESH_SECRET: z.string().min(32).default('development-refresh-secret-change-me'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'), JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'), UPLOAD_DIR: z.string().default('uploads'),
  MAX_UPLOAD_BYTES: z.coerce.number().positive().default(5242880),
}).safeParse(process.env)
if (!result.success) throw new Error(`Invalid environment: ${result.error.message}`)
export const env = Object.freeze(result.data)
