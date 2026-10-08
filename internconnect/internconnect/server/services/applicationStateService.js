import { transaction } from '../config/database.js'
import { assertTransition, resolveTransitionTarget } from '../domain/applicationWorkflow.js'
import { AppError } from '../utils/AppError.js'

async function assertOwnership(connection, application, actor) {
  if (actor.role === 'admin') return
  if (actor.role === 'student') {
    const [rows] = await connection.execute('SELECT 1 FROM students WHERE id = ? AND user_id = ?', [application.student_id, actor.sub])
    if (!rows.length) throw new AppError(403, 'APPLICATION_NOT_OWNED', 'Hồ sơ không thuộc sinh viên này')
  } else if (actor.role === 'company') {
    const [rows] = await connection.execute(`SELECT 1 FROM jobs j JOIN company_accounts ca ON ca.company_id=j.company_id WHERE j.id=? AND ca.user_id=?`, [application.job_id, actor.sub])
    if (!rows.length) throw new AppError(403, 'APPLICATION_NOT_OWNED', 'Hồ sơ không thuộc doanh nghiệp này')
  } else if (actor.role === 'lecturer') {
    const [rows] = await connection.execute(`SELECT 1 FROM lecturer_assignments la JOIN lecturers l ON l.id=la.lecturer_id WHERE la.student_id=? AND la.internship_period_id=? AND l.user_id=?`, [application.student_id, application.internship_period_id, actor.sub])
    if (!rows.length) throw new AppError(403, 'STUDENT_NOT_ASSIGNED', 'Sinh viên chưa được phân công cho giảng viên này')
  }
}

export async function transitionApplication(applicationId, targetStatus, actor, note = '') {
  return transaction(async (connection) => {
    const [rows] = await connection.execute('SELECT * FROM applications WHERE id = ? FOR UPDATE', [applicationId])
    const application = rows[0]
    if (!application) throw new AppError(404, 'APPLICATION_NOT_FOUND', 'Không tìm thấy hồ sơ ứng tuyển')
    targetStatus = resolveTransitionTarget(application.status, targetStatus, actor.role)
    assertTransition(application.status, targetStatus, actor.role)
    await assertOwnership(connection, application, actor)
    await connection.execute('UPDATE applications SET status = ? WHERE id = ?', [targetStatus, applicationId])
    await connection.execute(`INSERT INTO application_events(application_id,from_status,to_status,actor_user_id,actor_role,action,note) VALUES(?,?,?,?,?,?,?)`, [applicationId, application.status, targetStatus, actor.sub, actor.role, 'STATUS_TRANSITION', note || null])
    const [students] = await connection.execute('SELECT user_id FROM students WHERE id = ?', [application.student_id])
    if (students[0]?.user_id && String(students[0].user_id) !== String(actor.sub)) {
      await connection.execute(`INSERT INTO notifications(recipient_user_id,type,title,message,entity_type,entity_id) VALUES(?,'application','Cập nhật hồ sơ',?,'application',?)`, [students[0].user_id, `Hồ sơ đã chuyển sang bước ${targetStatus}.`, applicationId])
    }
    await connection.execute(`INSERT INTO audit_logs(actor_user_id,action,entity_type,entity_id,old_values,new_values) VALUES(?,'APPLICATION_STATUS_CHANGED','application',?,JSON_OBJECT('status',?),JSON_OBJECT('status',?))`, [actor.sub, applicationId, application.status, targetStatus])
    if (targetStatus === '12') {
      const [details] = await connection.execute(`SELECT j.company_id,ip.start_date,ip.end_date,la.lecturer_id FROM jobs j JOIN internship_periods ip ON ip.id=? LEFT JOIN lecturer_assignments la ON la.student_id=? AND la.internship_period_id=ip.id WHERE j.id=?`, [application.internship_period_id,application.student_id,application.job_id])
      if (!details[0]?.lecturer_id) throw new AppError(409,'LECTURER_ASSIGNMENT_REQUIRED','Phải phân công giảng viên trước khi xác nhận nơi thực tập')
      await connection.execute(`INSERT INTO internship_records(application_id,student_id,company_id,job_id,internship_period_id,lecturer_id,start_date,end_date,status) VALUES(?,?,?,?,?,?,?,?,'pending')`,[applicationId,application.student_id,details[0].company_id,application.job_id,application.internship_period_id,details[0].lecturer_id,details[0].start_date,details[0].end_date])
    }
    if (targetStatus === '13') await connection.execute(`UPDATE internship_records SET status='active' WHERE application_id=?`,[applicationId])
    if (targetStatus === '14') await connection.execute(`UPDATE internship_records SET status='evaluating' WHERE application_id=?`,[applicationId])
    if (targetStatus === '15') {
      const[records]=await connection.execute('SELECT id FROM internship_records WHERE application_id=? FOR UPDATE',[applicationId]);const record=records[0];if(!record)throw new AppError(409,'INTERNSHIP_RECORD_REQUIRED','Không tìm thấy hồ sơ thực tập')
      const[evaluations]=await connection.execute('SELECT evaluator_role,total_score FROM evaluations WHERE internship_record_id=?',[record.id]);const company=evaluations.find(x=>x.evaluator_role==='company'),lecturer=evaluations.find(x=>x.evaluator_role==='lecturer');if(!company||!lecturer)throw new AppError(409,'EVALUATIONS_REQUIRED','Cần đủ đánh giá doanh nghiệp và giảng viên trước khi hoàn thành')
      const[reports]=await connection.execute(`SELECT 1 FROM reports WHERE internship_record_id=? AND report_type='final' AND status='approved' LIMIT 1`,[record.id]);if(!reports.length)throw new AppError(409,'FINAL_REPORT_REQUIRED','Báo cáo cuối kỳ phải được duyệt trước khi hoàn thành')
      const reportScore=10,finalScore=Number(company.total_score)*0.4+Number(lecturer.total_score)*0.3+reportScore*0.3;const classification=finalScore>=8.5?'Giỏi':finalScore>=7?'Khá':finalScore>=5?'Đạt':'Không đạt'
      await connection.execute(`INSERT INTO internship_scores(internship_record_id,company_score,lecturer_score,report_score,final_score,classification,calculated_at,confirmed_by) VALUES(?,?,?,?,?,?,NOW(),?) ON DUPLICATE KEY UPDATE company_score=VALUES(company_score),lecturer_score=VALUES(lecturer_score),report_score=VALUES(report_score),final_score=VALUES(final_score),classification=VALUES(classification),calculated_at=NOW(),confirmed_by=VALUES(confirmed_by)`,[record.id,company.total_score,lecturer.total_score,reportScore,finalScore,classification,actor.sub])
      await connection.execute(`UPDATE internship_records SET status='completed' WHERE id=?`,[record.id])
    }
    return { ...application, status: targetStatus }
  })
}
