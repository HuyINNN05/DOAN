import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import { env } from './config/env.js'
import { db } from './config/database.js'
import authRoutes from './routes/authRoutes.js'
import jobRoutes from './routes/jobRoutes.js'
import applicationRoutes from './routes/applicationRoutes.js'
import studentRoutes from './routes/studentRoutes.js'
import companyRoutes from './routes/companyRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'
import lecturerRoutes from './routes/lecturerRoutes.js'
import interviewRoutes from './routes/interviewRoutes.js'
import publicRoutes from './routes/publicRoutes.js'
import contentRoutes from './routes/contentRoutes.js'
import { errorHandler, notFound } from './middleware/errorMiddleware.js'
export const app = express()
app.disable('x-powered-by'); app.use(helmet()); app.use(cors({ origin: env.CORS_ORIGIN.split(',').map((x) => x.trim()), credentials: true })); app.use(express.json({ limit: '1mb' })); app.use(cookieParser())
app.get('/api/health', async (_req, res, next) => { try { await db.query('SELECT 1'); res.json({ success: true, data: { status: 'ok' } }) } catch (error) { next(error) } })
app.use('/api/auth', authRoutes); app.use('/api/jobs', jobRoutes); app.use('/api/public', publicRoutes); app.use('/api/content', contentRoutes); app.use('/api/students', studentRoutes); app.use('/api/company', companyRoutes); app.use('/api/admin', adminRoutes); app.use('/api/lecturer', lecturerRoutes); app.use('/api/applications', applicationRoutes); app.use('/api/interviews', interviewRoutes); app.use('/api/notifications', notificationRoutes); app.use(notFound); app.use(errorHandler)
