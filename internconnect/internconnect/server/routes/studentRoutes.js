import { Router } from 'express'
import { z } from 'zod'
import * as controller from '../controllers/studentController.js'
import { authenticate,authorizeRoles } from '../middleware/authMiddleware.js'
import { documentUpload, verifyDocumentUpload } from '../middleware/uploadMiddleware.js'
import { validate } from '../middleware/validate.js'
import { AppError } from '../utils/AppError.js'
import * as interview from '../services/interviewService.js'
import * as internship from '../services/internshipService.js'
import { relativeUploadPath } from '../middleware/uploadMiddleware.js'
import { validateIdParam } from '../middleware/validateIdParam.js'
const router=Router(); const asyncRoute=(fn)=>(req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next)
router.param('id', validateIdParam)
router.use(authenticate,authorizeRoles('student'))
router.get('/me',asyncRoute(controller.getProfile))
router.patch('/me',validate(z.object({fullName:z.string().min(2).max(150),phone:z.string().max(30).optional(),faculty:z.string().max(150).optional(),major:z.string().max(150).optional(),className:z.string().max(100).optional(),course:z.string().max(50).optional(),gpa:z.number().min(0).max(4).nullable().optional(),dateOfBirth:z.iso.date().nullable().optional(),gender:z.enum(['male','female','other']).nullable().optional(),address:z.string().max(255).optional(),bio:z.string().max(5000).optional(),skills:z.array(z.string().max(100)).max(50).optional()})),asyncRoute(controller.updateProfile))
router.get('/me/cvs',asyncRoute(controller.listCvs))
router.post('/me/cvs',documentUpload.single('file'),verifyDocumentUpload,(req,_res,next)=>req.file?next():next(new AppError(422,'FILE_REQUIRED','Vui lòng chọn tệp')),asyncRoute(controller.createCv))
router.delete('/me/cvs/:id',asyncRoute(controller.deleteCv)); router.patch('/me/cvs/:id/default',asyncRoute(controller.setDefaultCv))
router.get('/me/saved-jobs',asyncRoute(controller.savedJobs)); router.get('/me/applications',asyncRoute(controller.applications))
router.get('/me/periods',asyncRoute(controller.periods))
router.get('/me/interviews',asyncRoute(async(req,res)=>res.json({success:true,data:await interview.studentInterviews(req.user.sub)})))
router.get('/me/internship',asyncRoute(async(req,res)=>res.json({success:true,data:await internship.getRecord(req.user.sub)})))
router.get('/me/diaries',asyncRoute(async(req,res)=>res.json({success:true,data:await internship.logs(req.user.sub)})))
const diary=z.object({logDate:z.iso.date(),title:z.string().min(2).max(200),content:z.string().min(2).max(20000),workHours:z.number().min(0).max(24).optional()})
router.post('/me/diaries',validate(diary),asyncRoute(async(req,res)=>res.status(201).json({success:true,data:await internship.createLog(req.user.sub,req.body)})))
router.patch('/me/diaries/:id',validate(diary),asyncRoute(async(req,res)=>res.json({success:true,data:await internship.updateLog(req.user.sub,req.params.id,req.body)})))
router.get('/me/reports',asyncRoute(async(req,res)=>res.json({success:true,data:await internship.reports(req.user.sub)})))
router.post('/me/reports',documentUpload.single('file'),verifyDocumentUpload,asyncRoute(async(req,res)=>{if(!req.file)throw new AppError(422,'FILE_REQUIRED','Vui lòng chọn tệp');try{return res.status(201).json({success:true,data:await internship.submitReport(req.user.sub,{reportType:req.body.reportType,path:relativeUploadPath(req.file),originalName:req.file.originalname,mimeType:req.file.mimetype,size:req.file.size})})}catch(e){await internship.removeUploaded(req.file.path);throw e}}))
export default router
