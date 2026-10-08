import { Router } from 'express'
import { z } from 'zod'
import { authenticate, authorizeRoles } from '../middleware/authMiddleware.js'
import { validate } from '../middleware/validate.js'
import * as s from '../services/contentService.js'
import { validateIdParam } from '../middleware/validateIdParam.js'
const r=Router(),a=f=>(q,p,n)=>Promise.resolve(f(q,p,n)).catch(n),schema=z.object({title:z.string().min(3).max(255),slug:z.string().regex(/^[a-z0-9-]+$/).max(255),body:z.string().min(10),status:z.enum(['draft','published','archived'])});r.param('id',validateIdParam);r.get('/public',a(async(_q,p)=>p.json({success:true,data:await s.publicArticles()})));r.use(authenticate,authorizeRoles('admin'));r.get('/',a(async(_q,p)=>p.json({success:true,data:await s.list()})));r.post('/',validate(schema),a(async(q,p)=>p.status(201).json({success:true,data:await s.create(q.user.sub,q.body)})));r.patch('/:id',validate(schema),a(async(q,p)=>p.json({success:true,data:await s.update(q.params.id,q.body)})));r.delete('/:id',a(async(q,p)=>{await s.archive(q.params.id);p.status(204).end()}));export default r
