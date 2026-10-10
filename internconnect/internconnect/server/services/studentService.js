import { applicationOutcomeColumns } from '../domain/applicationOutcome.js'
import { db, transaction } from '../config/database.js'
import { AppError } from '../utils/AppError.js'
import * as fileStorage from './fileStorageService.js'

async function studentFor(userId, executor = db) {
  const [rows] = await executor.execute(`SELECT s.*,u.email,u.full_name,u.phone FROM students s JOIN users u ON u.id=s.user_id WHERE s.user_id=?`, [userId])
  if (!rows[0]) throw new AppError(404, 'STUDENT_PROFILE_NOT_FOUND', 'Không tìm thấy hồ sơ sinh viên')
  return rows[0]
}
export const getProfile = studentFor
export async function updateProfile(userId, input) {
  return transaction(async (connection) => {
    const student = await studentFor(userId, connection)
    input = {phone:student.phone,faculty:student.faculty,major:student.major,className:student.class_name,course:student.course,gpa:student.gpa,dateOfBirth:student.date_of_birth,gender:student.gender,address:student.address,bio:student.bio,skills:typeof student.skills==='string'?JSON.parse(student.skills):student.skills,...input}
    await connection.execute('UPDATE users SET full_name=?,phone=? WHERE id=?', [input.fullName, input.phone || null, userId])
    await connection.execute(`UPDATE students SET faculty=?,major=?,class_name=?,course=?,gpa=?,date_of_birth=?,gender=?,address=?,bio=?,skills=? WHERE id=?`,
      [input.faculty || null,input.major || null,input.className || null,input.course || null,input.gpa ?? null,input.dateOfBirth || null,input.gender || null,input.address || null,input.bio || null,JSON.stringify(input.skills || []),student.id])
    return studentFor(userId, connection)
  })
}
export async function listCvs(userId) { const student=await studentFor(userId); const [rows]=await db.execute('SELECT * FROM cvs WHERE student_id=? ORDER BY is_default DESC,created_at DESC',[student.id]); return rows }
export async function createCv(userId, input) {
  const student=await studentFor(userId)
  return transaction(async (connection) => {
    await connection.execute('SELECT id FROM students WHERE id=? FOR UPDATE',[student.id]);const [countRows]=await connection.execute('SELECT COUNT(*) total FROM cvs WHERE student_id=?',[student.id]); const isDefault=countRows[0].total===0
    const [result]=await connection.execute('INSERT INTO cvs(student_id,name,file_path,file_name,file_size,mime_type,is_default) VALUES(?,?,?,?,?,?,?)',[student.id,input.name,input.path,input.originalName,input.size,input.mimeType,isDefault])
    const [rows]=await connection.execute('SELECT * FROM cvs WHERE id=?',[result.insertId]); return rows[0]
  })
}
export async function deleteCv(userId, cvId) {
  const storedPath = await transaction(async connection => {
    const student = await studentFor(userId,connection)
    await connection.execute('SELECT id FROM students WHERE id=? FOR UPDATE',[student.id])
    const [rows] = await connection.execute('SELECT * FROM cvs WHERE id=? AND student_id=? FOR UPDATE',[cvId,student.id])
    if (!rows[0]) throw new AppError(404,'CV_NOT_FOUND','Không tìm thấy CV')
    const [uses] = await connection.execute('SELECT 1 FROM applications WHERE cv_id=? LIMIT 1 FOR UPDATE',[cvId])
    if (uses.length) throw new AppError(409,'CV_IN_USE','CV đã được dùng để ứng tuyển')
    await connection.execute('DELETE FROM cvs WHERE id=?',[cvId])
    if (rows[0].is_default) {
      const [remaining] = await connection.execute('SELECT id FROM cvs WHERE student_id=? ORDER BY created_at DESC,id DESC LIMIT 1 FOR UPDATE',[student.id])
      if (remaining.length) await connection.execute('UPDATE cvs SET is_default=TRUE WHERE id=?',[remaining[0].id])
    }
    return rows[0].file_path
  })
  await fileStorage.remove(storedPath)
  return null
}
export async function setDefaultCv(userId, cvId) {
  const student=await studentFor(userId)
  return transaction(async(connection)=>{ await connection.execute('SELECT id FROM students WHERE id=? FOR UPDATE',[student.id]);const [rows]=await connection.execute('SELECT id FROM cvs WHERE id=? AND student_id=?',[cvId,student.id]); if(!rows.length) throw new AppError(404,'CV_NOT_FOUND','Không tìm thấy CV'); await connection.execute('UPDATE cvs SET is_default=FALSE WHERE student_id=?',[student.id]); await connection.execute('UPDATE cvs SET is_default=TRUE WHERE id=?',[cvId]); return {id:Number(cvId),isDefault:true} })
}
export async function saveJob(userId, jobId) {
  return transaction(async connection => {
    const student = await studentFor(userId,connection)
    const [jobs] = await connection.execute("SELECT j.id FROM jobs j JOIN companies c ON c.id=j.company_id WHERE j.id=? AND j.status='published' AND c.status='approved' AND j.deadline>=CURRENT_DATE FOR UPDATE",[jobId])
    if (!jobs.length) throw new AppError(404,'JOB_NOT_AVAILABLE','Tin tuyển dụng không tồn tại hoặc đã ngừng nhận hồ sơ')
    await connection.execute('INSERT INTO saved_jobs(student_id,job_id) VALUES(?,?) ON DUPLICATE KEY UPDATE job_id=VALUES(job_id)',[student.id,jobId])
    return {saved:true}
  })
}
export async function unsaveJob(userId, jobId) { const student=await studentFor(userId); await db.execute('DELETE FROM saved_jobs WHERE student_id=? AND job_id=?',[student.id,jobId]); return {saved:false} }
export async function savedJobs(userId) { const student=await studentFor(userId); const [rows]=await db.execute(`SELECT j.*,c.name company_name FROM saved_jobs s JOIN jobs j ON j.id=s.job_id JOIN companies c ON c.id=j.company_id WHERE s.student_id=? ORDER BY s.created_at DESC`,[student.id]); return rows }
export async function apply(userId, jobId, input) {
  return transaction(async(connection)=>{ const student=await studentFor(userId,connection)
    await connection.execute('SELECT id FROM students WHERE id=? FOR UPDATE',[student.id])
    const [jobs]=await connection.execute(`SELECT j.id FROM jobs j JOIN companies c ON c.id=j.company_id WHERE j.id=? AND j.status='published' AND c.status='approved' AND j.deadline>=CURRENT_DATE FOR UPDATE`,[jobId]); if(!jobs.length) throw new AppError(409,'JOB_NOT_AVAILABLE','Tin tuyển dụng không còn nhận hồ sơ')
    const [cvs]=await connection.execute('SELECT id FROM cvs WHERE id=? AND student_id=? FOR UPDATE',[input.cvId,student.id]); if(!cvs.length) throw new AppError(403,'CV_NOT_OWNED','CV không thuộc sinh viên này')
    const [periods]=await connection.execute(`SELECT id FROM internship_periods WHERE id=? AND status='open' AND end_date>=CURRENT_DATE AND (registration_start IS NULL OR registration_start<=NOW()) AND (registration_end IS NULL OR registration_end>=NOW()) FOR UPDATE`,[input.internshipPeriodId]); if(!periods.length) throw new AppError(409,'PERIOD_NOT_OPEN','Kỳ thực tập không mở đăng ký')
    const [existing] = await connection.execute('SELECT id FROM applications WHERE student_id=? AND job_id=? AND internship_period_id=? FOR UPDATE',[student.id,jobId,input.internshipPeriodId])
    if (existing.length) throw new AppError(409,'APPLICATION_ALREADY_EXISTS','Bạn đã ứng tuyển vị trí này trong kỳ thực tập đã chọn. Hãy xem hồ sơ tại mục Ứng tuyển',{applicationId:existing[0].id})
    const [confirmed] = await connection.execute("SELECT id FROM internship_records WHERE student_id=? AND internship_period_id=? AND status<>'cancelled' LIMIT 1 FOR UPDATE",[student.id,input.internshipPeriodId])
    if (confirmed.length) throw new AppError(409,'INTERNSHIP_ALREADY_CONFIRMED','Bạn đã có nơi thực tập được xác nhận trong kỳ này')
    const [result]=await connection.execute('INSERT INTO applications(student_id,job_id,cv_id,internship_period_id,status,cover_letter) VALUES(?,?,?,?,\'02\',?)',[student.id,jobId,input.cvId,input.internshipPeriodId,input.coverLetter||null])
    await connection.execute(`INSERT INTO application_events(application_id,from_status,to_status,actor_user_id,actor_role,action) VALUES(?,'01','02',?,'student','APPLY')`,[result.insertId,userId])
    return {id:result.insertId,status:'02'}
  })
}
export async function applications(userId) { const student=await studentFor(userId); const [rows]=await db.execute(`SELECT a.*,${applicationOutcomeColumns},j.title,c.name company_name FROM applications a JOIN jobs j ON j.id=a.job_id JOIN companies c ON c.id=j.company_id WHERE a.student_id=? ORDER BY a.applied_at DESC`,[student.id]); return rows }
export async function openPeriods(){const[rows]=await db.execute(`SELECT id,name,academic_year,semester,registration_end FROM internship_periods WHERE status='open' AND end_date>=CURRENT_DATE AND (registration_start IS NULL OR registration_start<=NOW()) AND (registration_end IS NULL OR registration_end>=NOW()) ORDER BY start_date DESC`);return rows}
