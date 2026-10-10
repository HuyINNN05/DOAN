import { companyRegistrationSchema } from '../validation/companyRegistration.js'
import { Buffer } from 'node:buffer'
import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { z } from 'zod'
import * as controller from '../controllers/authController.js'
import { authenticate } from '../middleware/authMiddleware.js'
import { validate } from '../middleware/validate.js'
const router = Router()
const asyncRoute = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next)
const loginLimiter = rateLimit({ windowMs: 900000, limit: 10, skipSuccessfulRequests:true,
  message:{success:false,error:{code:'AUTH_RATE_LIMITED',message:'Bạn đã thử quá nhiều lần không thành công. Vui lòng thử lại sau 15 phút.'}} })
router.post('/login', loginLimiter, validate(z.object({ email: z.email().max(255), password: z.string().min(8).max(128).refine(value=>Buffer.byteLength(value,'utf8')<=72,{message:'Password must not exceed 72 UTF-8 bytes'}) })), asyncRoute(controller.login))
router.post('/company-register',validate(companyRegistrationSchema),asyncRoute(controller.registerCompany))
router.post('/forgot-password',loginLimiter,validate(z.object({email:z.email()})),asyncRoute(controller.forgotPassword))
router.post('/reset-password',loginLimiter,validate(z.object({token:z.string().length(64),password:z.string().min(8).max(128).refine(value=>Buffer.byteLength(value,'utf8')<=72,{message:'Password must not exceed 72 UTF-8 bytes'})})),asyncRoute(controller.resetPassword))
router.post('/refresh', asyncRoute(controller.refresh))
router.post('/logout', asyncRoute(controller.logout))
router.get('/me', authenticate, controller.me)
export default router
