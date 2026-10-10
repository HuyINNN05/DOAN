import { applicationOutcomeColumns } from '../domain/applicationOutcome.js'
import { transitionApplication } from '../services/applicationStateService.js'
import { db } from '../config/database.js'
import { AppError } from '../utils/AppError.js'
export async function transition(req, res) {
  const data = await transitionApplication(req.params.id, req.body.status, req.user, req.body.note)
  res.json({ success: true, data })
}
export async function detail(req,res){const params=[req.params.id],user=req.user;let ownership='';if(user.role==='student'){ownership=' AND s.user_id=?';params.push(user.sub)}else if(user.role==='company'){ownership=' AND ca.user_id=?';params.push(user.sub)}else if(user.role==='lecturer'){ownership=' AND la.lecturer_id=(SELECT id FROM lecturers WHERE user_id=?)';params.push(user.sub)}const[rows]=await db.execute(`SELECT a.*,${applicationOutcomeColumns},j.title job_title,c.name company_name,u.full_name student_name FROM applications a JOIN students s ON s.id=a.student_id JOIN users u ON u.id=s.user_id JOIN jobs j ON j.id=a.job_id JOIN companies c ON c.id=j.company_id LEFT JOIN company_accounts ca ON ca.company_id=c.id LEFT JOIN lecturer_assignments la ON la.student_id=s.id AND la.internship_period_id=a.internship_period_id WHERE a.id=?${ownership} LIMIT 1`,params);if(!rows[0])throw new AppError(404,'APPLICATION_NOT_FOUND','Không tìm thấy hồ sơ ứng tuyển');const[events]=await db.execute('SELECT * FROM application_events WHERE application_id=? ORDER BY created_at',[req.params.id]);res.json({success:true,data:{...rows[0],events}})}
