import { Router } from 'express'
import { db } from '../config/database.js'
import { z } from 'zod'
import { authenticate,authorizeRoles } from '../middleware/authMiddleware.js'
import { validate } from '../middleware/validate.js'
import * as controller from '../controllers/jobController.js'
import { AppError } from '../utils/AppError.js'
import { validateIdParam } from '../middleware/validateIdParam.js'
const router = Router()
router.param('id', validateIdParam)
router.get('/', async (req, res, next) => { try {
  const limit=Math.min(Math.max(Number(req.query.limit)||20,1),100),page=Math.max(Number(req.query.page)||1,1),search=`%${req.query.search||''}%`
  const [rows] = await db.execute(`SELECT j.id,j.title,j.description,j.location,j.work_mode,j.salary_min,j.salary_max,j.quantity,j.skills,j.deadline,c.id company_id,c.name company_name,c.logo_url FROM jobs j JOIN companies c ON c.id=j.company_id WHERE j.status='published' AND c.status='approved' AND j.deadline>=CURRENT_DATE AND (j.title LIKE ? OR j.skills LIKE ? OR c.name LIKE ?) ORDER BY j.created_at DESC LIMIT ? OFFSET ?`,[search,search,search,limit,(page-1)*limit])
  res.json({ success: true, data: {items:rows,page,limit} })
} catch (error) { next(error) } })
const asyncRoute=(fn)=>(req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next)
router.get('/:id',asyncRoute(async(req,res)=>{const[rows]=await db.execute(`SELECT j.*,c.name company_name,c.logo_url,c.description company_description FROM jobs j JOIN companies c ON c.id=j.company_id WHERE j.id=? AND j.status='published' AND c.status='approved'`,[req.params.id]);if(!rows[0])throw new AppError(404,'JOB_NOT_FOUND','Không tìm thấy cơ hội thực tập');res.json({success:true,data:rows[0]})}))
router.post('/:id/save',authenticate,authorizeRoles('student'),asyncRoute(controller.save))
router.delete('/:id/save',authenticate,authorizeRoles('student'),asyncRoute(controller.unsave))
router.post('/:id/apply',authenticate,authorizeRoles('student'),validate(z.object({cvId:z.coerce.number().int().positive(),internshipPeriodId:z.coerce.number().int().positive(),coverLetter:z.string().max(5000).optional()})),asyncRoute(controller.apply))
export default router
