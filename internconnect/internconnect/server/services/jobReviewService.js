import { companyTables } from '../config/companyTables.js'
import { db, transaction } from '../config/database.js'
import { AppError } from '../utils/AppError.js'
import { pagination, pageResult } from '../utils/pagination.js'

export const fields = ['title', 'description', 'requirements', 'benefits', 'location', 'work_mode', 'salary_min', 'salary_max', 'quantity', 'skills', 'deadline']
export function jobContent(input) {
  return { title: input.title, description: input.description, requirements: input.requirements || null, benefits: input.benefits || null, location: input.location || null, work_mode: input.workMode, salary_min: input.salaryMin ?? null, salary_max: input.salaryMax ?? null, quantity: input.quantity, skills: input.skills || [], deadline: input.deadline }
}
export function revision(job) {
  return typeof job.pending_revision === 'string' ? JSON.parse(job.pending_revision) : job.pending_revision
}
export function editableJob(job) {
  return { ...job, ...revision(job), status: job.status, review_status: job.review_status }
}
export function publicJob(job) {
  const result = { ...job }
  for (const key of ['pending_revision', 'review_status', 'review_note', 'reviewed_by', 'reviewed_at']) delete result[key]
  return result
}
export async function ownedJob(connection, userId, id) {
  const [accounts] = await connection.execute(`SELECT ca.company_id,c.status FROM ${companyTables.company_accounts} ca JOIN ${companyTables.companies} c ON c.id=ca.company_id WHERE ca.user_id=?`, [userId])
  if (!accounts[0] || accounts[0].status !== 'approved') throw new AppError(403, 'COMPANY_NOT_APPROVED', 'Doanh nghiệp chưa được duyệt')
  const [jobs] = await connection.execute(`SELECT * FROM ${companyTables.jobs} WHERE id=? AND company_id=? FOR UPDATE`, [id, accounts[0].company_id])
  if (!jobs[0]) throw new AppError(404, 'JOB_NOT_FOUND', 'Không tìm thấy tin tuyển dụng')
  return jobs[0]
}
export async function updateJob(userId, id, input) {
  return transaction(async connection => {
    const job = await ownedJob(connection, userId, id)
    if (!['draft', 'published'].includes(job.status) || job.review_status === 'pending') throw new AppError(409, 'JOB_NOT_EDITABLE', 'Tin đang chờ duyệt hoặc đã đóng')
    const content = jobContent(input)
    if (job.status === 'published') {
      await connection.execute(`UPDATE ${companyTables.jobs} SET pending_revision=?,review_status='pending',review_note=NULL,reviewed_by=NULL,reviewed_at=NULL WHERE id=?`, [JSON.stringify(content), id])
    } else {
      await connection.execute(`UPDATE ${companyTables.jobs} SET ${fields.map(f => `${f}=?`).join(',')},review_status='draft',review_note=NULL WHERE id=?`, [...fields.map(f => f === 'skills' ? JSON.stringify(content[f]) : content[f]), id])
    }
    return { id: Number(id), status: job.status, review_status: job.status === 'published' ? 'pending' : 'draft' }
  })
}
export async function setJobStatus(userId, id, status) {
  return transaction(async connection => {
    const job = await ownedJob(connection, userId, id)
    if (status === 'closed') {
      if (!['draft', 'published'].includes(job.status)) throw new AppError(409, 'JOB_NOT_EDITABLE', 'Tin đã đóng')
      await connection.execute(`UPDATE ${companyTables.jobs} SET status='closed',pending_revision=NULL,review_status='draft' WHERE id=?`, [id])
      return { id: Number(id), status: 'closed' }
    }
    if (job.status !== 'draft' || !['draft', 'rejected', 'changes_requested'].includes(job.review_status)) throw new AppError(409, 'INVALID_JOB_TRANSITION', 'Tin không thể gửi duyệt ở trạng thái hiện tại')
    const [result] = await connection.execute(`UPDATE ${companyTables.jobs} SET review_status='pending',review_note=NULL,reviewed_by=NULL,reviewed_at=NULL WHERE id=? AND deadline>=CURRENT_DATE`, [id])
    if (!result.affectedRows) throw new AppError(409, 'JOB_EXPIRED', 'Hạn ứng tuyển đã qua')
    return { id: Number(id), status: 'draft', review_status: 'pending' }
  })
}
export async function listJobs(query = {}) {
  const page = pagination(query), params = []
  let where = "WHERE j.status IN ('draft','published') AND j.review_status<>'draft'"
  if (query.status) { where += ' AND j.review_status=?'; params.push(query.status) }
  const [items] = await db.execute(`SELECT j.*,c.name company_name FROM ${companyTables.jobs} j JOIN ${companyTables.companies} c ON c.id=j.company_id ${where} ORDER BY j.updated_at DESC LIMIT ? OFFSET ?`, [...params, page.limit, page.offset])
  const [counts] = await db.execute(`SELECT COUNT(*) total FROM ${companyTables.jobs} j ${where}`, params)
  return pageResult(items.map(editableJob), counts[0].total, page)
}
export async function reviewJob(actor, id, input) {
  return transaction(async connection => {
    const [rows] = await connection.execute(`SELECT j.*,c.status company_status FROM ${companyTables.jobs} j JOIN ${companyTables.companies} c ON c.id=j.company_id WHERE j.id=? FOR UPDATE`, [id])
    const job = rows[0]
    if (!job) throw new AppError(404, 'JOB_NOT_FOUND', 'Không tìm thấy tin tuyển dụng')
    if (job.review_status !== 'pending' || !['draft','published'].includes(job.status)) throw new AppError(409, 'JOB_ALREADY_REVIEWED', 'Tin không còn chờ duyệt')
    if (!['approved','rejected','changes_requested'].includes(input.decision)) throw new AppError(400, 'INVALID_REVIEW', 'Kết quả duyệt không hợp lệ')
    const note = input.note?.trim() || null
    if (input.decision !== 'approved' && !note) throw new AppError(400, 'REVIEW_NOTE_REQUIRED', 'Vui lòng nhập lý do hoặc yêu cầu chỉnh sửa')
    if (input.decision === 'approved') {
      if (job.company_status !== 'approved') throw new AppError(409, 'COMPANY_NOT_APPROVED', 'Doanh nghiệp chưa được duyệt')
      const content = revision(job)
      if (content) await connection.execute(`UPDATE ${companyTables.jobs} SET ${fields.map(f => `${f}=?`).join(',')} WHERE id=?`, [...fields.map(f => f === 'skills' ? JSON.stringify(content[f]) : content[f]), id])
      const [result] = await connection.execute(`UPDATE ${companyTables.jobs} SET status='published',pending_revision=NULL WHERE id=? AND deadline>=CURRENT_DATE`, [id])
      if (!result.affectedRows) throw new AppError(409, 'JOB_EXPIRED', 'Hạn ứng tuyển đã qua')
    }
    await connection.execute(`UPDATE ${companyTables.jobs} SET review_status=?,review_note=?,reviewed_by=?,reviewed_at=NOW() WHERE id=?`, [input.decision, note, actor.sub, id])
    await connection.execute("INSERT INTO audit_logs(actor_user_id,action,entity_type,entity_id,old_values,new_values) VALUES(?,'JOB_REVIEWED','job',?,JSON_OBJECT('review_status','pending'),JSON_OBJECT('review_status',?,'note',?))", [actor.sub, id, input.decision, note])
    await connection.execute(`INSERT INTO notifications(recipient_user_id,type,title,message,entity_type,entity_id) SELECT user_id,'job_review','Kết quả duyệt tin tuyển dụng',?,'job',? FROM ${companyTables.company_accounts} WHERE company_id=?`, [note || 'Tin tuyển dụng đã được duyệt và đăng.', id, job.company_id])
    return { id: Number(id), status: input.decision === 'approved' ? 'published' : job.status, review_status: input.decision, review_note: note }
  })
}
