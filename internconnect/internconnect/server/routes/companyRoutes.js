import { Router } from 'express'
import { z } from 'zod'
import { authenticate,authorizeRoles } from '../middleware/authMiddleware.js'
import { validate } from '../middleware/validate.js'
import * as c from '../controllers/companyController.js'
import * as interview from '../services/interviewService.js'
import * as companyService from '../services/companyService.js'
import { transitionApplication } from '../services/applicationStateService.js'
import * as applicationController from '../controllers/applicationController.js'
import { validateIdParam } from '../middleware/validateIdParam.js'
const router=Router();const asyncRoute=(fn)=>(req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next)
router.param('id', validateIdParam)
const job=z.object({title:z.string().min(3).max(200),description:z.string().min(10).max(20000),requirements:z.string().max(20000).optional(),benefits:z.string().max(10000).optional(),location:z.string().max(255).optional(),workMode:z.enum(['onsite','remote','hybrid']),salaryMin:z.number().nonnegative().nullable().optional(),salaryMax:z.number().nonnegative().nullable().optional(),quantity:z.number().int().positive().max(1000),skills:z.array(z.string().max(100)).max(50),deadline:z.iso.date()}).refine(x=>x.salaryMin==null||x.salaryMax==null||x.salaryMax>=x.salaryMin,{message:'Lương tối đa phải lớn hơn lương tối thiểu'})
router.use(authenticate,authorizeRoles('company'))
router.get('/profile',asyncRoute(c.profile));router.patch('/profile',validate(z.object({name:z.string().min(2).max(200),phone:z.string().max(30).optional(),website:z.url().optional().or(z.literal('')),address:z.string().max(255).optional(),description:z.string().max(5000).optional(),logoUrl:z.url().optional().or(z.literal('')),industry:z.string().max(150).optional(),companySize:z.string().max(50).optional()})),asyncRoute(c.updateProfile))
router.get('/jobs',asyncRoute(c.jobs));router.post('/jobs',validate(job),asyncRoute(c.createJob));router.get('/jobs/:id',asyncRoute(c.job));router.patch('/jobs/:id',validate(job),asyncRoute(c.updateJob));router.delete('/jobs/:id',asyncRoute(c.closeJob));router.post('/jobs/:id/publish',asyncRoute(c.publishJob));router.post('/jobs/:id/close',asyncRoute(c.closeJob));router.get('/applications',asyncRoute(c.applications))
router.get('/applications/:id',asyncRoute(applicationController.detail))
router.post('/applications/:id/interviews',validate(z.object({scheduledAt:z.iso.datetime(),durationMinutes:z.number().int().min(15).max(480).default(60),type:z.enum(['online','offline']),location:z.string().max(255).optional(),meetingUrl:z.url().optional().or(z.literal('')),note:z.string().max(2000).optional()})),asyncRoute(async(req,res)=>res.status(201).json({success:true,data:await interview.schedule(req.user.sub,req.params.id,req.body)})))
router.get('/interviews',asyncRoute(c.interviews));router.get('/evaluation-criteria',asyncRoute(c.criteria))
router.patch('/interviews/:id',validate(z.object({scheduledAt:z.iso.datetime(),durationMinutes:z.number().int().min(15).max(480),type:z.enum(['online','offline']),location:z.string().max(255).optional(),meetingUrl:z.url().optional().or(z.literal('')),note:z.string().max(2000).optional()})),asyncRoute(async(req,res)=>res.json({success:true,data:await interview.update(req.user.sub,req.params.id,req.body)})))
router.post('/applications/:id/review',asyncRoute(async(req,res)=>res.json({success:true,data:await transitionApplication(req.params.id,'05',req.user,req.body.note)})))
router.post('/interviews/:id/result',validate(z.object({result:z.enum(['passed','failed']),note:z.string().min(2).max(5000)})),asyncRoute(async(req,res)=>res.json({success:true,data:await interview.result(req.user.sub,req.params.id,req.body)})))
router.post('/applications/:id/offer',validate(z.object({note:z.string().max(2000).optional()})),asyncRoute(async(req,res)=>res.json({success:true,data:await interview.offer(req.user.sub,req.params.id,req.body.note)})))
router.get('/interns',asyncRoute(async(req,res)=>res.json({success:true,data:await companyService.interns(req.user.sub)})))
router.post('/interns/:id/evaluations',validate(z.object({comment:z.string().max(5000).optional(),details:z.array(z.object({criteriaId:z.number().int().positive(),score:z.number().min(0).max(100),comment:z.string().max(2000).optional()})).min(1)})),asyncRoute(async(req,res)=>res.status(201).json({success:true,data:await companyService.evaluate(req.user.sub,req.params.id,req.body)})))
export default router
