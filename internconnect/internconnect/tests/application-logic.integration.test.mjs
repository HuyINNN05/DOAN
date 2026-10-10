import test from 'node:test'
import assert from 'node:assert/strict'
import process from 'node:process'
import { db } from '../server/config/database.js'
import * as student from '../server/services/studentService.js'
import * as admin from '../server/services/adminService.js'
import { app } from '../server/app.js'
import { createAccessToken } from '../server/services/tokenService.js'

test('new application, duplicates, invalid saved jobs and default CV deletion', {skip:process.env.RUN_DB_TESTS!=='1'}, async()=>{
  const suffix=String(Date.now())
  let userId,studentId,periodId,jobId,cvId,otherCvId,applicationId,server
  try {
    const [seed]=await db.query("SELECT password_hash FROM users WHERE role='student' LIMIT 1")
    const [users]=await db.query("SELECT id FROM users WHERE email='admin@internconnect.vn'")
    const [companies]=await db.query("SELECT ca.company_id,ca.user_id FROM company_accounts ca JOIN companies c ON c.id=ca.company_id WHERE c.status='approved' LIMIT 1")
    const [user]=await db.execute("INSERT INTO users(email,password_hash,full_name,role,status) VALUES(?,?,'Application regression','student','active')",[`application-${suffix}@example.com`,seed[0].password_hash]);userId=user.insertId
    const [profile]=await db.execute('INSERT INTO students(user_id,student_code) VALUES(?,?)',[userId,`TEST-${suffix}`]);studentId=profile.insertId
    const [period]=await db.execute("INSERT INTO internship_periods(name,academic_year,semester,start_date,end_date,status,created_by) VALUES('Application fixture','test','test',CURRENT_DATE,DATE_ADD(CURRENT_DATE,INTERVAL 90 DAY),'open',?)",[users[0].id]);periodId=period.insertId
    const [job]=await db.execute("INSERT INTO jobs(company_id,title,description,work_mode,quantity,deadline,status,created_by) VALUES(?,'Application fixture','Regression job description','remote',1,DATE_ADD(CURRENT_DATE,INTERVAL 30 DAY),'published',?)",[companies[0].company_id,companies[0].user_id]);jobId=job.insertId
    const cv=await student.createCv(userId,{name:'First CV',path:'uploads/missing-regression-cv.pdf',originalName:'cv.pdf',size:100,mimeType:'application/pdf'});cvId=cv.id
    const other=await student.createCv(userId,{name:'Second CV',path:'uploads/missing-regression-other.pdf',originalName:'cv.pdf',size:100,mimeType:'application/pdf'});otherCvId=other.id
    await assert.rejects(student.saveJob(userId,999999999),{code:'JOB_NOT_AVAILABLE'})
    server=await new Promise(resolve=>{const instance=app.listen(0,'127.0.0.1',()=>resolve(instance))})
    const [accounts]=await db.execute('SELECT * FROM users WHERE id=?',[userId])
    const token=createAccessToken(accounts[0])
    const send=async input=>{
      const response=await fetch(`http://127.0.0.1:${server.address().port}/api/jobs/${jobId}/apply`,{method:'POST',headers:{'content-type':'application/json',authorization:`Bearer ${token}`},body:JSON.stringify(input)})
      return {status:response.status,body:await response.json()}
    }
    assert.equal((await send({internshipPeriodId:periodId})).status,422)
    const [foreign]=await db.query('SELECT id FROM cvs WHERE student_id<>? LIMIT 1',[studentId])
    assert.equal((await send({cvId:foreign[0].id,internshipPeriodId:periodId})).status,403)
    const requests=await Promise.all([send({cvId:otherCvId,internshipPeriodId:periodId,coverLetter:'Regression application'}),send({cvId:otherCvId,internshipPeriodId:periodId})])
    assert.deepEqual(requests.map(x=>x.status).sort(),[201,409])
    const applied=requests.find(x=>x.status===201).body.data;applicationId=applied.id
    assert.equal(requests.find(x=>x.status===409).body.error.code,'APPLICATION_ALREADY_EXISTS')
    assert.equal(applied.status,'02')
    await assert.rejects(student.apply(userId,jobId,{cvId:otherCvId,internshipPeriodId:periodId}),{code:'APPLICATION_ALREADY_EXISTS'})
    const [events]=await db.execute('SELECT COUNT(*) total FROM application_events WHERE application_id=?',[applicationId]);assert.equal(events[0].total,1)
    await student.deleteCv(userId,cvId);cvId=null
    const cvs=await student.listCvs(userId);assert.equal(cvs.length,1);assert.equal(cvs[0].is_default,1)
    await admin.setPeriodStatus({sub:String(users[0].id)},periodId,'closed')
    await assert.rejects(student.apply(userId,jobId,{cvId:otherCvId,internshipPeriodId:periodId}),{code:'PERIOD_NOT_OPEN'})
  } finally {
    if(server)await new Promise(resolve=>server.close(resolve))
    if(applicationId){await db.execute('DELETE FROM application_events WHERE application_id=?',[applicationId]);await db.execute('DELETE FROM applications WHERE id=?',[applicationId])}
    if(studentId){await db.execute('DELETE FROM saved_jobs WHERE student_id=?',[studentId]);await db.execute('DELETE FROM cvs WHERE student_id=?',[studentId]);await db.execute('DELETE FROM students WHERE id=?',[studentId])}
    if(jobId)await db.execute('DELETE FROM jobs WHERE id=?',[jobId])
    if(periodId){await db.execute("DELETE FROM audit_logs WHERE entity_type='internship_period' AND entity_id=?",[periodId]);await db.execute('DELETE FROM internship_periods WHERE id=?',[periodId])}
    if(userId)await db.execute('DELETE FROM users WHERE id=?',[userId])
    await db.end()
  }
})
