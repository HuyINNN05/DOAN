import { companyTables } from '../config/companyTables.js'
import { editableJob } from './jobReviewService.js'
import { applicationOutcomeColumns } from '../domain/applicationOutcome.js'
import { calculateEvaluation } from '../domain/evaluation.js'
import { db, transaction } from '../config/database.js'
import { AppError } from '../utils/AppError.js'
import { pageResult, pagination, sortClause } from '../utils/pagination.js'
async function context(userId,executor=db){const [rows]=await executor.execute(`SELECT ca.company_id,c.status FROM ${companyTables.company_accounts} ca JOIN ${companyTables.companies} c ON c.id=ca.company_id WHERE ca.user_id=?`,[userId]);if(!rows[0])throw new AppError(403,'COMPANY_ACCOUNT_NOT_FOUND','Tài khoản chưa gắn với doanh nghiệp');return rows[0]}
export async function profile(userId){const c=await context(userId);const [rows]=await db.execute(`SELECT * FROM ${companyTables.companies} WHERE id=?`,[c.company_id]);return rows[0]}
export async function updateProfile(userId,input){const c=await context(userId);const current=await profile(userId);input={phone:current.phone,website:current.website,address:current.address,description:current.description,logoUrl:current.logo_url,industry:current.industry,companySize:current.company_size,...input};await db.execute(`UPDATE ${companyTables.companies} SET name=?,phone=?,website=?,address=?,description=?,logo_url=?,industry=?,company_size=? WHERE id=?`,[input.name,input.phone||null,input.website||null,input.address||null,input.description||null,input.logoUrl||null,input.industry||null,input.companySize||null,c.company_id]);return profile(userId)}
export async function listJobs(userId){const c=await context(userId);const [rows]=await db.execute(`SELECT * FROM ${companyTables.jobs} WHERE company_id=? ORDER BY created_at DESC`,[c.company_id]);return rows.map(editableJob)}
export async function getJob(userId,id){const c=await context(userId);const[rows]=await db.execute(`SELECT * FROM ${companyTables.jobs} WHERE id=? AND company_id=?`,[id,c.company_id]);if(!rows[0])throw new AppError(404,'JOB_NOT_FOUND','Không tìm thấy tin tuyển dụng');return editableJob(rows[0])}
export async function createJob(userId,input){const c=await context(userId);if(c.status!=='approved')throw new AppError(403,'COMPANY_NOT_APPROVED','Doanh nghiệp chưa được duyệt');const [result]=await db.execute(`INSERT INTO ${companyTables.jobs}(company_id,title,description,requirements,benefits,location,work_mode,salary_min,salary_max,quantity,skills,deadline,status,created_by) VALUES(?,?,?,?,?,?,?,?,?,?,?,?, 'draft',?)`,[c.company_id,input.title,input.description,input.requirements||null,input.benefits||null,input.location||null,input.workMode,input.salaryMin??null,input.salaryMax??null,input.quantity,JSON.stringify(input.skills||[]),input.deadline,userId]);return{id:result.insertId,status:'draft'}}
export { updateJob, setJobStatus } from './jobReviewService.js'
export async function applications(userId){const c=await context(userId);const [rows]=await db.execute(`SELECT a.*,${applicationOutcomeColumns},j.title,u.full_name student_name,s.student_code FROM ${companyTables.applications} a JOIN ${companyTables.jobs} j ON j.id=a.job_id JOIN students s ON s.id=a.student_id JOIN users u ON u.id=s.user_id WHERE j.company_id=? ORDER BY a.applied_at DESC`,[c.company_id]);return rows}
export async function interns(userId){const c=await context(userId);const[rows]=await db.execute(`SELECT ir.*,(SELECT COUNT(*) FROM evaluations e WHERE e.internship_record_id=ir.id AND e.evaluator_role='company') evaluation_submitted,u.full_name student_name,s.student_code,j.title job_title FROM internship_records ir JOIN students s ON s.id=ir.student_id JOIN users u ON u.id=s.user_id JOIN ${companyTables.jobs} j ON j.id=ir.job_id WHERE ir.company_id=? ORDER BY ir.created_at DESC`,[c.company_id]);return rows}
export async function interviews(userId){const c=await context(userId);const[rows]=await db.execute(`SELECT i.*,a.student_id,u.full_name student_name,j.title job_title FROM ${companyTables.interviews} i JOIN ${companyTables.applications} a ON a.id=i.application_id JOIN students s ON s.id=a.student_id JOIN users u ON u.id=s.user_id JOIN ${companyTables.jobs} j ON j.id=a.job_id WHERE j.company_id=? ORDER BY i.scheduled_at DESC`,[c.company_id]);return rows}
export async function criteria(){const[rows]=await db.execute(`SELECT id,name,description,max_score,weight FROM evaluation_criteria WHERE evaluator_type='company' AND active=TRUE ORDER BY id`);return rows}
export async function evaluate(userId,recordId,input){return transaction(async e=>{const c=await context(userId,e);const[records]=await e.execute(`SELECT id FROM internship_records WHERE id=? AND company_id=? AND status='evaluating' FOR UPDATE`,[recordId,c.company_id]);if(!records.length)throw new AppError(404,'INTERN_NOT_OWNED','Không tìm thấy sinh viên thực tập thuộc doanh nghiệp');const[existing]=await e.execute(`SELECT id FROM evaluations WHERE internship_record_id=? AND evaluator_role='company'`,[recordId]);if(existing.length)throw new AppError(409,'EVALUATION_LOCKED','Đánh giá đã gửi và không thể sửa');const[criteria]=await e.query("SELECT id,max_score,weight FROM evaluation_criteria WHERE evaluator_type='company' AND active=TRUE");const total=calculateEvaluation(criteria,input.details);const[result]=await e.execute(`INSERT INTO evaluations(internship_record_id,evaluator_user_id,evaluator_role,total_score,comment) VALUES(?,?,'company',?,?)`,[recordId,userId,total,input.comment||null]);for(const d of input.details)await e.execute('INSERT INTO evaluation_details(evaluation_id,criteria_id,score,comment) VALUES(?,?,?,?)',[result.insertId,d.criteriaId,d.score,d.comment||null]);return{id:result.insertId,totalScore:total}})}

export async function paginatedJobs(userId, query = {}) {
  const company = await context(userId), page = pagination(query), search = `%${query.search || ''}%`, params = [company.company_id, search]
  let where = 'WHERE company_id=? AND title LIKE ?'
  if (query.status) { where += ' AND status=?'; params.push(query.status) }
  const [[items], [counts]] = await Promise.all([
    db.execute(`SELECT * FROM ${companyTables.jobs} ${where} ORDER BY ${sortClause(query.sort,{created:'created_at',deadline:'deadline',title:'title'},'created')} LIMIT ? OFFSET ?`, [...params,page.limit,page.offset]),
    db.execute(`SELECT COUNT(*) total FROM ${companyTables.jobs} ${where}`, params),
  ])
  return pageResult(items.map(editableJob), counts[0].total, page)
}

export async function paginatedApplications(userId, query = {}) {
  const company = await context(userId), page = pagination(query), search = `%${query.search || ''}%`, params = [company.company_id, search, search]
  let where = 'WHERE j.company_id=? AND (u.full_name LIKE ? OR j.title LIKE ?)'
  if (query.status) { where += ' AND a.status=?'; params.push(query.status) }
  const joins = `FROM ${companyTables.applications} a JOIN ${companyTables.jobs} j ON j.id=a.job_id JOIN students s ON s.id=a.student_id JOIN users u ON u.id=s.user_id`
  const [[items], [counts]] = await Promise.all([
    db.execute(`SELECT a.*,${applicationOutcomeColumns},j.title,u.full_name student_name,s.student_code ${joins} ${where} ORDER BY ${sortClause(query.sort,{applied:'a.applied_at',student:'u.full_name',status:'a.status'},'applied')} LIMIT ? OFFSET ?`, [...params,page.limit,page.offset]),
    db.execute(`SELECT COUNT(*) total ${joins} ${where}`, params),
  ])
  return pageResult(items, counts[0].total, page)
}
