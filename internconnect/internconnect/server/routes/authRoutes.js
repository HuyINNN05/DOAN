import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { z } from 'zod'
import * as controller from '../controllers/authController.js'
import { authenticate } from '../middleware/authMiddleware.js'
import { validate } from '../middleware/validate.js'
const router = Router()
const asyncRoute = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next)
const loginLimiter = rateLimit({ windowMs: 900000, limit: 10 })
router.post('/login', loginLimiter, validate(z.object({ email: z.email().max(255), password: z.string().min(8).max(128) })), asyncRoute(controller.login))
router.post('/company-register',validate(z.object({fullName:z.string().min(2).max(150),email:z.email(),password:z.string().min(8).max(128),phone:z.string().max(30).optional(),companyName:z.string().min(2).max(200),taxCode:z.string().min(8).max(50),companyEmail:z.email(),companyPhone:z.string().max(30).optional(),website:z.url().optional().or(z.literal('')),address:z.string().max(255).optional(),description:z.string().max(5000).optional(),industry:z.string().max(150).optional(),companySize:z.string().max(50).optional(),position:z.string().max(100).optional()})),asyncRoute(controller.registerCompany))
router.post('/forgot-password',loginLimiter,validate(z.object({email:z.email()})),asyncRoute(controller.forgotPassword))
router.post('/reset-password',loginLimiter,validate(z.object({token:z.string().length(64),password:z.string().min(8).max(128)})),asyncRoute(controller.resetPassword))
router.post('/refresh', asyncRoute(controller.refresh))
router.post('/logout', asyncRoute(controller.logout))
router.get('/me', authenticate, controller.me)
export default router
