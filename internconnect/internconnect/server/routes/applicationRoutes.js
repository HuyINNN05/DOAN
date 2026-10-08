import { Router } from 'express'
import { z } from 'zod'
import { authenticate, authorizeRoles } from '../middleware/authMiddleware.js'
import { validate } from '../middleware/validate.js'
import * as controller from '../controllers/applicationController.js'
import * as interview from '../services/interviewService.js'
import { validateIdParam } from '../middleware/validateIdParam.js'
const router = Router()
router.param('id', validateIdParam)
const asyncRoute = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next)
router.get('/:id',authenticate,asyncRoute(controller.detail))
router.post('/:id/transition', authenticate, validate(z.object({ status: z.enum(['02','03','04','05','06','07','08','09','10','11','12','13','14','15']), note: z.string().max(2000).optional() })), asyncRoute(controller.transition))
router.post('/:id/offer-response',authenticate,authorizeRoles('student'),validate(z.object({accepted:z.boolean(),note:z.string().max(2000).optional()})),asyncRoute(async(req,res)=>res.json({success:true,data:await interview.offerResponse(req.user.sub,req.params.id,req.body)})))
export default router
