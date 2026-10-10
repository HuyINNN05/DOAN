import { Router } from 'express'
import { db } from '../config/database.js'
import { authenticate } from '../middleware/authMiddleware.js'
import { AppError } from '../utils/AppError.js'
import { validateIdParam } from '../middleware/validateIdParam.js'
const router=Router();router.param('id',validateIdParam);router.use(authenticate)
router.get('/',async(req,res,next)=>{try{const limit=Math.min(Number(req.query.limit)||20,100),page=Math.max(Number(req.query.page)||1,1);const[rows]=await db.execute('SELECT * FROM notifications WHERE recipient_user_id=? ORDER BY created_at DESC LIMIT ? OFFSET ?',[req.user.sub,limit,(page-1)*limit]);res.json({success:true,data:{items:rows,page,limit}})}catch(e){next(e)}})
router.patch('/read-all',async(req,res,next)=>{try{await db.execute('UPDATE notifications SET is_read=TRUE,read_at=COALESCE(read_at,NOW()) WHERE recipient_user_id=? AND is_read=FALSE',[req.user.sub]);res.json({success:true,data:{updated:true}})}catch(e){next(e)}})
router.patch('/:id/read',async(req,res,next)=>{try{const[result]=await db.execute('UPDATE notifications SET is_read=TRUE,read_at=COALESCE(read_at,NOW()) WHERE id=? AND recipient_user_id=?',[req.params.id,req.user.sub]);if(!result.affectedRows)throw new AppError(404,'NOTIFICATION_NOT_FOUND','Không tìm thấy thông báo');res.json({success:true,data:{id:Number(req.params.id),isRead:true}})}catch(e){next(e)}})
export default router
