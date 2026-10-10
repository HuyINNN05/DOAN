import test from 'node:test'
import assert from 'node:assert/strict'
import process from 'node:process'
import { app } from '../server/app.js'
import { db } from '../server/config/database.js'

test('three tabs retain their roles and school approval reaches company interviews', {skip:process.env.RUN_API_TESTS!=='1'},async()=>{
  let server,periodId,applicationId,interviewId
  const jar=new Map(),tabs={student:'11111111-1111-4111-8111-111111111111',admin:'22222222-2222-4222-8222-222222222222',company:'33333333-3333-4333-8333-333333333333'},tokens={},users={}
  try {
    server=await new Promise(resolve=>{const instance=app.listen(0,'127.0.0.1',()=>resolve(instance))})
    const request=async(role,url,body,extra={})=>{
      const response=await fetch(`http://127.0.0.1:${server.address().port}/api${url}`,{method:body===undefined?'GET':'POST',headers:{'content-type':'application/json','X-Session-Id':tabs[role],...(users[role]?{'X-Expected-User':String(users[role].id)}:{}),...(tokens[role]?{authorization:`Bearer ${tokens[role]}`}:{ }),cookie:[...jar].map(([key,value])=>`${key}=${value}`).join('; '),...extra},...(body!==undefined?{body:JSON.stringify(body)}:{})})
      const cookie=response.headers.get('set-cookie')
      if(cookie){const [pair]=cookie.split(';'),index=pair.indexOf('=');jar.set(pair.slice(0,index),pair.slice(index+1))}
      return {status:response.status,body:response.status===204?null:await response.json()}
    }
    for(const [role,email,password]of [['student','sv001@internconnect.vn','Student@123'],['admin','admin@internconnect.vn','Admin@123'],['company','company1@internconnect.vn','Company@123']]){
      const login=await request(role,'/auth/login',{email,password});assert.equal(login.status,200);users[role]=login.body.data.user;tokens[role]=login.body.data.accessToken
    }
    assert.equal(jar.size,3)
    assert.equal((await request('admin','/admin/audit-logs')).status,200)
    for(const role of Object.keys(tabs)){
      const refreshed=await request(role,'/auth/refresh',{});assert.equal(refreshed.status,200);assert.equal(refreshed.body.data.user.role,role);tokens[role]=refreshed.body.data.accessToken
    }
    assert.equal((await request('student','/students/me/applications')).status,200)
    const mismatch=await request('student','/auth/refresh',{}, {'X-Expected-User':String(users.company.id)})
    assert.equal(mismatch.status,401);assert.equal(mismatch.body.error.code,'SESSION_ACCOUNT_MISMATCH')
    assert.equal((await request('student','/auth/refresh',{})).status,200)
    const [source]=await db.execute('SELECT s.id student_id,cv.id cv_id,j.id job_id FROM students s JOIN cvs cv ON cv.student_id=s.id JOIN jobs j JOIN company_accounts ca ON ca.company_id=j.company_id WHERE s.user_id=? AND ca.user_id=? LIMIT 1',[users.student.id,users.company.id])
    const fixture=source[0]
    const [period]=await db.execute("INSERT INTO internship_periods(name,academic_year,semester,start_date,end_date,status,created_by) VALUES('Multi-tab workflow fixture','test','test',CURRENT_DATE,DATE_ADD(CURRENT_DATE,INTERVAL 90 DAY),'open',?)",[users.admin.id]);periodId=period.insertId
    const applied=await request('student',`/jobs/${fixture.job_id}/apply`,{cvId:fixture.cv_id,internshipPeriodId:periodId})
    assert.equal(applied.status,201);applicationId=applied.body.data.id
    const approved=await request('admin',`/admin/applications/${applicationId}/approve`,{})
    assert.equal(approved.status,200);assert.equal(approved.body.data.status,'04')
    assert.equal((await request('admin',`/admin/applications/${applicationId}/approve`,{})).status,200)
    const [notifications]=await db.execute("SELECT COUNT(*) total FROM notifications WHERE recipient_user_id=? AND entity_type='application' AND entity_id=?",[users.company.id,applicationId]);assert.equal(notifications[0].total,1)
    const candidates=await request('company','/company/applications?limit=100')
    assert.equal(candidates.status,200);assert.equal(candidates.body.data.items.find(item=>item.id===applicationId).status,'04')
    assert.equal((await request('company',`/company/applications/${applicationId}/review`,{})).status,200)
    const incomplete=await request('company',`/company/applications/${applicationId}/interviews`,{scheduledAt:new Date(Date.now()+86400000).toISOString(),durationMinutes:60,type:'online'})
    assert.equal(incomplete.status,422);assert.equal(incomplete.body.error.code,'INTERVIEW_LOCATION_REQUIRED')
    const [unchanged]=await db.execute('SELECT status FROM applications WHERE id=?',[applicationId]);assert.equal(unchanged[0].status,'05')
    const scheduled=await request('company',`/company/applications/${applicationId}/interviews`,{scheduledAt:new Date(Date.now()+86400000).toISOString(),durationMinutes:60,type:'online',meetingUrl:'https://example.com/test-interview'})
    assert.equal(scheduled.status,201);interviewId=scheduled.body.data.id
    // Simulate the student tab reloading after the company sends the invitation.
    delete tokens.student
    const recovered=await request('student','/auth/refresh',{})
    assert.equal(recovered.status,200);assert.equal(recovered.body.data.user.role,'student')
    tokens.student=recovered.body.data.accessToken
    const invitations=await request('student','/students/me/interviews');assert.equal(invitations.status,200);assert.ok(invitations.body.data.some(item=>item.id===interviewId))
    const accepted=await request('student',`/interviews/${interviewId}/respond`,{response:'accepted'})
    assert.equal(accepted.status,200);assert.equal(accepted.body.data.response,'accepted')
    assert.equal((await request('admin','/auth/logout',{})).status,204)
    assert.equal((await request('student','/auth/refresh',{})).status,200)
    assert.equal((await request('company','/auth/refresh',{})).status,200)
    for(const role of ['student','company'])await request(role,'/auth/logout',{})
  } finally {
    if(server)await new Promise(resolve=>server.close(resolve))
    if(applicationId){
      await db.execute("DELETE FROM notifications WHERE (entity_type='application' AND entity_id=?) OR (entity_type='interview' AND entity_id=?)",[applicationId,interviewId||0])
      await db.execute("DELETE FROM audit_logs WHERE entity_type='application' AND entity_id=?",[applicationId])
      await db.execute('DELETE FROM interviews WHERE application_id=?',[applicationId])
      await db.execute('DELETE FROM application_events WHERE application_id=?',[applicationId])
      await db.execute('DELETE FROM applications WHERE id=?',[applicationId])
    }
    if(periodId)await db.execute('DELETE FROM internship_periods WHERE id=?',[periodId])
    await db.end()
  }
})
