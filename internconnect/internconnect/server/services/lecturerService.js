import { calculateEvaluation } from '../domain/evaluation.js'
import { transitionApplication } from './applicationStateService.js'
import{db,transaction}from'../config/database.js';import{AppError}from'../utils/AppError.js';import{pageResult,pagination,sortClause}from'../utils/pagination.js';
async function lecturer(userId,e=db){const[rows]=await e.execute('SELECT id FROM lecturers WHERE user_id=?',[userId]);if(!rows[0])throw new AppError(403,'LECTURER_PROFILE_NOT_FOUND','Không tìm thấy hồ sơ giảng viên');return rows[0]}
export async function students(userId){const l=await lecturer(userId);const[rows]=await db.execute(`SELECT s.id,s.student_code,u.full_name,u.email,la.internship_period_id,ip.name period_name FROM lecturer_assignments la JOIN students s ON s.id=la.student_id JOIN users u ON u.id=s.user_id JOIN internship_periods ip ON ip.id=la.internship_period_id WHERE la.lecturer_id=? ORDER BY u.full_name`,[l.id]);return rows}
export async function internships(userId){const l=await lecturer(userId);const[rows]=await db.execute(`SELECT ir.*,(SELECT COUNT(*) FROM evaluations e WHERE e.internship_record_id=ir.id AND e.evaluator_role='lecturer') evaluation_submitted,u.full_name student_name,c.name company_name,j.title job_title FROM internship_records ir JOIN students s ON s.id=ir.student_id JOIN users u ON u.id=s.user_id JOIN companies c ON c.id=ir.company_id JOIN jobs j ON j.id=ir.job_id WHERE ir.lecturer_id=?`,[l.id]);return rows}
export async function diaries(userId){const l=await lecturer(userId);const[rows]=await db.execute(`SELECT il.*,u.full_name student_name FROM internship_logs il JOIN internship_records ir ON ir.id=il.internship_record_id JOIN students s ON s.id=ir.student_id JOIN users u ON u.id=s.user_id WHERE ir.lecturer_id=? ORDER BY il.log_date DESC`,[l.id]);return rows}
export async function feedback(userId,id,text){const l=await lecturer(userId);const[result]=await db.execute(`UPDATE internship_logs il JOIN internship_records ir ON ir.id=il.internship_record_id SET il.lecturer_feedback=?,il.reviewed_by=?,il.reviewed_at=NOW(),il.status='reviewed' WHERE il.id=? AND ir.lecturer_id=?`,[text,userId,id,l.id]);if(!result.affectedRows)throw new AppError(404,'DIARY_NOT_ASSIGNED','Không tìm thấy nhật ký thuộc sinh viên được phân công');return{id:Number(id),status:'reviewed'}}
export async function reports(userId){const l=await lecturer(userId);const[rows]=await db.execute(`SELECT r.*,(SELECT rr.score FROM report_reviews rr WHERE rr.report_id=r.id AND rr.decision='approved' ORDER BY rr.id DESC LIMIT 1) report_score,u.full_name student_name FROM reports r JOIN internship_records ir ON ir.id=r.internship_record_id JOIN students s ON s.id=ir.student_id JOIN users u ON u.id=s.user_id WHERE ir.lecturer_id=? ORDER BY r.created_at DESC`,[l.id]);return rows}
export async function criteria(){const[rows]=await db.execute(`SELECT id,name,description,max_score,weight FROM evaluation_criteria WHERE evaluator_type='lecturer' AND active=TRUE ORDER BY id`);return rows}
export async function evaluations(userId){const l=await lecturer(userId);const[rows]=await db.execute(`SELECT e.*,u.full_name student_name FROM evaluations e JOIN internship_records ir ON ir.id=e.internship_record_id JOIN students s ON s.id=ir.student_id JOIN users u ON u.id=s.user_id WHERE ir.lecturer_id=? ORDER BY e.submitted_at DESC`,[l.id]);return rows}
export async function reviewReport(userId,id,input){return transaction(async c=>{const l=await lecturer(userId,c);const[rows]=await c.execute(`SELECT r.*,s.user_id student_user_id FROM reports r JOIN internship_records ir ON ir.id=r.internship_record_id JOIN students s ON s.id=ir.student_id WHERE r.id=? AND ir.lecturer_id=? FOR UPDATE`,[id,l.id]);const report=rows[0];if(!report)throw new AppError(404,'REPORT_NOT_ASSIGNED','Không tìm thấy báo cáo được phân công');if(report.status!=='submitted')throw new AppError(409,'REPORT_ALREADY_REVIEWED','Báo cáo không ở trạng thái chờ duyệt');if(report.report_type==='final'&&input.decision==='approved'&&(input.score==null||!Number.isFinite(input.score)||input.score<0||input.score>10))throw new AppError(422,'REPORT_SCORE_REQUIRED','Final report approval requires a score from 0 to 10');if(input.decision==='revision_required'&&!input.feedback?.trim())throw new AppError(422,'REVIEW_FEEDBACK_REQUIRED','Revision feedback is required');await c.execute('INSERT INTO report_reviews(report_id,lecturer_id,decision,feedback,score) VALUES(?,?,?,?,?)',[id,l.id,input.decision,input.feedback||null,input.decision==='approved'?input.score??null:null]);await c.execute('UPDATE reports SET status=? WHERE id=?',[input.decision,id]);await c.execute(`INSERT INTO notifications(recipient_user_id,type,title,message,entity_type,entity_id) VALUES(?,'report_review','Kết quả duyệt báo cáo',?,'report',?)`,[report.student_user_id,input.decision==='approved'?'Báo cáo đã được duyệt.':'Báo cáo cần chỉnh sửa.',id]);return{id:Number(id),status:input.decision}})}
export async function evaluate(userId,recordId,input){return transaction(async c=>{const l=await lecturer(userId,c);const[records]=await c.execute(`SELECT id FROM internship_records WHERE id=? AND lecturer_id=? AND status='evaluating' FOR UPDATE`,[recordId,l.id]);if(!records.length)throw new AppError(404,'INTERNSHIP_NOT_ASSIGNED','Không tìm thấy kỳ thực tập được phân công');const[existing]=await c.execute(`SELECT id FROM evaluations WHERE internship_record_id=? AND evaluator_role='lecturer'`,[recordId]);if(existing.length)throw new AppError(409,'EVALUATION_LOCKED','Đánh giá đã gửi và không thể sửa');const[criteria]=await c.query("SELECT id,max_score,weight FROM evaluation_criteria WHERE evaluator_type='lecturer' AND active=TRUE");const total=calculateEvaluation(criteria,input.details);const[result]=await c.execute(`INSERT INTO evaluations(internship_record_id,evaluator_user_id,evaluator_role,total_score,comment) VALUES(?,?,'lecturer',?,?)`,[recordId,userId,total,input.comment||null]);for(const d of input.details)await c.execute('INSERT INTO evaluation_details(evaluation_id,criteria_id,score,comment) VALUES(?,?,?,?)',[result.insertId,d.criteriaId,d.score,d.comment||null]);return{id:result.insertId,totalScore:total}})}

export async function paginatedReports(userId, query = {}) {
  const assigned = await lecturer(userId), page = pagination(query), search = `%${query.search || ''}%`, params = [assigned.id,search]
  let where = 'WHERE ir.lecturer_id=? AND u.full_name LIKE ?'
  if (query.status) { where += ' AND r.status=?'; params.push(query.status) }
  const joins = 'FROM reports r JOIN internship_records ir ON ir.id=r.internship_record_id JOIN students s ON s.id=ir.student_id JOIN users u ON u.id=s.user_id'
  const [[items],[counts]] = await Promise.all([
    db.execute(`SELECT r.*,(SELECT rr.score FROM report_reviews rr WHERE rr.report_id=r.id AND rr.decision='approved' ORDER BY rr.id DESC LIMIT 1) report_score,u.full_name student_name ${joins} ${where} ORDER BY ${sortClause(query.sort,{submitted:'r.submitted_at',student:'u.full_name',status:'r.status'},'submitted')} LIMIT ? OFFSET ?`,[...params,page.limit,page.offset]),
    db.execute(`SELECT COUNT(*) total ${joins} ${where}`,params),
  ])
  return pageResult(items,counts[0].total,page)
}

export async function scoreReport(userId,id,input) {
  return transaction(async connection => {
    const assigned = await lecturer(userId,connection)
    const [rows] = await connection.execute(`SELECT r.id,r.status,r.report_type,ir.status internship_status FROM reports r JOIN internship_records ir ON ir.id=r.internship_record_id WHERE r.id=? AND ir.lecturer_id=? FOR UPDATE`,[id,assigned.id])
    if (!rows.length) throw new AppError(404,'REPORT_NOT_ASSIGNED','Không tìm thấy báo cáo được phân công')
    const report = rows[0]
    if (report.status!=='approved' || report.report_type!=='final' || report.internship_status==='completed') throw new AppError(409,'REPORT_SCORE_LOCKED','Chỉ bổ sung điểm cho báo cáo cuối kỳ đã duyệt trước khi hoàn thành thực tập')
    const [reviews] = await connection.execute("SELECT score FROM report_reviews WHERE report_id=? AND decision='approved' ORDER BY id DESC LIMIT 1",[id])
    if (reviews[0]?.score != null) throw new AppError(409,'REPORT_SCORE_LOCKED','Báo cáo đã có điểm và không thể chấm lại')
    await connection.execute("INSERT INTO report_reviews(report_id,lecturer_id,decision,feedback,score) VALUES(?,?,'approved',?,?)",[id,assigned.id,input.feedback||null,input.score])
    return {id:Number(id),score:input.score,status:'approved'}
  })
}

export async function startEvaluation(actor,recordId) {
  const [records]=await db.execute('SELECT ir.application_id FROM internship_records ir JOIN lecturers l ON l.id=ir.lecturer_id WHERE ir.id=? AND l.user_id=?',[recordId,actor.sub])
  if (!records.length) throw new AppError(404,'INTERNSHIP_NOT_ASSIGNED','Không tìm thấy hồ sơ thực tập được phân công')
  return transitionApplication(records[0].application_id,'14',actor,'Giảng viên mở đánh giá cuối kỳ')
}
