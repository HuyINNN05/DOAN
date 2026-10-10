import test from 'node:test'
import assert from 'node:assert/strict'
import process from 'node:process'
import { db } from '../server/config/database.js'
import { transitionApplication } from '../server/services/applicationStateService.js'
import * as interview from '../server/services/interviewService.js'
import * as lecturer from '../server/services/lecturerService.js'
import * as company from '../server/services/companyService.js'
import * as student from '../server/services/studentService.js'

test('real MySQL workflow blocks bypasses and calculates the actual final report score', { skip: process.env.RUN_DB_TESTS !== '1' }, async () => {
  let periodId, applicationId, recordId, reportId, assignmentId, interviewId,declinedApplicationId
  try {
    const [users] = await db.query("SELECT id,role,email FROM users WHERE email IN ('admin@internconnect.vn','sv001@internconnect.vn','gv001@internconnect.vn','company1@internconnect.vn')")
    const actor = role => ({ role, sub: String(users.find(user => user.role === role).id) })
    const [source] = await db.query("SELECT a.*,la.lecturer_id FROM applications a JOIN students s ON s.id=a.student_id JOIN lecturer_assignments la ON la.student_id=a.student_id AND la.internship_period_id=a.internship_period_id WHERE s.student_code='SV001' LIMIT 1")
    const template = source[0]
    const [period] = await db.execute("INSERT INTO internship_periods(name,academic_year,semester,start_date,end_date,status,created_by) VALUES('Backend regression fixture','2026','test','2026-01-01','2027-12-31','open',?)",[actor('admin').sub])
    periodId = period.insertId
    const [assignment] = await db.execute('INSERT INTO lecturer_assignments(lecturer_id,student_id,internship_period_id,assigned_by) VALUES(?,?,?,?)',[template.lecturer_id,template.student_id,periodId,actor('admin').sub])
    assignmentId = assignment.insertId
    const [application] = await db.execute("INSERT INTO applications(student_id,job_id,cv_id,internship_period_id,status) VALUES(?,?,?,?,'05')",[template.student_id,template.job_id,template.cv_id,periodId])
    applicationId = application.insertId
    await assert.rejects(transitionApplication(applicationId,'06',actor('company')), { code: 'WORKFLOW_ACTION_REQUIRED' })
    const scheduled = await interview.schedule(actor('company').sub,applicationId,{scheduledAt:new Date(Date.now()+86400000).toISOString(),durationMinutes:60,type:'online',meetingUrl:'https://example.com/interview'})
    interviewId = scheduled.id
    await interview.respond(actor('student').sub,interviewId,{response:'accepted'})
    await assert.rejects(interview.result(actor('company').sub,interviewId,{result:'passed',note:'Too early'}),{code:'INTERVIEW_NOT_STARTED'})
    await interview.update(actor('company').sub,interviewId,{scheduledAt:new Date(Date.now()+172800000).toISOString(),durationMinutes:60,type:'online',meetingUrl:'https://example.com/rescheduled'})
    const [rescheduled]=await db.execute('SELECT i.status,i.student_response,a.status application_status FROM interviews i JOIN applications a ON a.id=i.application_id WHERE i.id=?',[interviewId])
    assert.equal(rescheduled[0].status,'scheduled')
    assert.equal(rescheduled[0].student_response,'pending')
    assert.equal(rescheduled[0].application_status,'06')
    await interview.respond(actor('student').sub,interviewId,{response:'accepted'})
    await db.execute('UPDATE interviews SET scheduled_at=DATE_SUB(NOW(),INTERVAL 1 DAY) WHERE id=?',[interviewId])
    await interview.result(actor('company').sub,interviewId,{result:'passed',note:'Regression interview result'})
    await interview.offer(actor('company').sub,applicationId,'Regression offer')
    const [otherJobs]=await db.execute('SELECT id FROM jobs WHERE id<>? LIMIT 1',[template.job_id])
    const [declinedApplication]=await db.execute("INSERT INTO applications(student_id,job_id,cv_id,internship_period_id,status) VALUES(?,?,?,?,'10')",[template.student_id,otherJobs[0].id,template.cv_id,periodId]);declinedApplicationId=declinedApplication.insertId
    await interview.offerResponse(actor('student').sub,declinedApplicationId,{accepted:false,note:'Declined regression offer'})
    assert.equal((await student.applications(actor('student').sub)).find(item=>item.id===declinedApplicationId).offer_decision,'declined')
    await assert.rejects(interview.offerResponse(actor('student').sub,declinedApplicationId,{accepted:true}),{code:'OFFER_ALREADY_RESPONDED'})
    await interview.offerResponse(actor('student').sub,applicationId,{accepted:true})
    await transitionApplication(applicationId,'12',actor('admin'))
    await transitionApplication(applicationId,'13',actor('admin'))
    const [records] = await db.execute('SELECT id FROM internship_records WHERE application_id=?',[applicationId]); recordId = records[0].id
    await lecturer.startEvaluation(actor('lecturer'),recordId)
    const [report] = await db.execute("INSERT INTO reports(internship_record_id,report_type,version,file_path,file_name,mime_type,file_size,status) VALUES(?,'final',1,'uploads/regression.pdf','regression.pdf','application/pdf',100,'submitted')",[recordId]); reportId = report.insertId
    await assert.rejects(lecturer.reviewReport(actor('lecturer').sub,reportId,{decision:'approved'}),{code:'REPORT_SCORE_REQUIRED'})
    await lecturer.reviewReport(actor('lecturer').sub,reportId,{decision:'approved',score:4,feedback:'Actual report score'})
    for (const [role,service] of [['company',company],['lecturer',lecturer]]) {
      const criteria = await service.criteria()
      if (criteria.length > 1) await assert.rejects(service.evaluate(actor(role).sub,recordId,{details:[{criteriaId:criteria[0].id,score:criteria[0].max_score}]}),{code:'INVALID_EVALUATION_CRITERIA'})
      await service.evaluate(actor(role).sub,recordId,{details:criteria.map(rule=>({criteriaId:rule.id,score:rule.max_score}))})
    }
    await transitionApplication(applicationId,'15',actor('admin'))
    const [scores] = await db.execute('SELECT report_score,final_score FROM internship_scores WHERE internship_record_id=?',[recordId])
    assert.equal(scores[0].report_score,4)
    assert.equal(scores[0].final_score,8.2)
  } finally {
    if (recordId) {
      await db.execute('DELETE d FROM evaluation_details d JOIN evaluations e ON e.id=d.evaluation_id WHERE e.internship_record_id=?',[recordId])
      await db.execute('DELETE FROM evaluations WHERE internship_record_id=?',[recordId])
      await db.execute('DELETE FROM internship_scores WHERE internship_record_id=?',[recordId])
      await db.execute('DELETE FROM report_reviews WHERE report_id IN (SELECT id FROM reports WHERE internship_record_id=?)',[recordId])
      await db.execute('DELETE FROM reports WHERE internship_record_id=?',[recordId])
    }
    if (applicationId) {
      for (const [type,id] of [['application',applicationId],['interview',interviewId],['report',reportId],['assignment',assignmentId]]) if (id) await db.execute('DELETE FROM notifications WHERE entity_type=? AND entity_id=?',[type,id])
      await db.execute("DELETE FROM audit_logs WHERE entity_type='application' AND entity_id=?",[applicationId])
      await db.execute('DELETE FROM internship_records WHERE application_id=?',[applicationId])
      await db.execute('DELETE FROM interviews WHERE application_id=?',[applicationId])
      await db.execute('DELETE FROM application_events WHERE application_id=?',[applicationId])
      await db.execute('DELETE FROM applications WHERE id=?',[applicationId])
    }
    if(declinedApplicationId){await db.execute('DELETE FROM application_events WHERE application_id=?',[declinedApplicationId]);await db.execute('DELETE FROM applications WHERE id=?',[declinedApplicationId])}
    if (periodId) { await db.execute('DELETE FROM lecturer_assignments WHERE internship_period_id=?',[periodId]); await db.execute('DELETE FROM internship_periods WHERE id=?',[periodId]) }
    await db.end()
  }
})
