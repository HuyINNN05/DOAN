import test from'node:test';import assert from'node:assert/strict';import{readFile}from'node:fs/promises';
const [school,company]=await Promise.all(['01_school.sql','02_company.sql'].map(file=>readFile(new URL(`../database/${file}`,import.meta.url),'utf8')));
const sql=school+'\n'+company;
const tables=['users','students','lecturers','companies','company_accounts','internship_periods','jobs','saved_jobs','cvs','applications','application_events','interviews','internship_records','lecturer_assignments','internship_logs','reports','report_reviews','evaluation_criteria','evaluations','evaluation_details','internship_scores','notifications','audit_logs','refresh_tokens'];
test('school and company schemas are separate and use utf8mb4',()=>{
  assert.match(school,/CREATE DATABASE IF NOT EXISTS internconnect_school\s/i)
  assert.match(company,/CREATE DATABASE IF NOT EXISTS internconnect_company\s/i)
  assert.match(school,/utf8mb4_unicode_ci/i)
  assert.match(company,/utf8mb4_unicode_ci/i)
  assert.equal((school.match(/^CREATE TABLE /gm)||[]).length,21)
  assert.equal((company.match(/^CREATE TABLE /gm)||[]).length,6)
  for(const table of ['companies','company_accounts','jobs','applications','application_events','interviews']){
    assert.doesNotMatch(school,new RegExp(`CREATE TABLE ${table} \\(`))
    assert.match(company,new RegExp(`CREATE TABLE ${table} \\(`))
  }
})
test('schema có đầy đủ bảng bắt buộc',()=>{for(const table of tables)assert.match(sql,new RegExp(`CREATE TABLE ${table} \\(`,'i'),`Thiếu bảng ${table}`)})
test('application có FK thật và unique chống apply trùng',()=>{assert.match(sql,/uq_application_period \(student_id, job_id, internship_period_id\)/i);for(const target of['students','jobs','cvs','internship_periods'])assert.match(sql,new RegExp(`REFERENCES (?:internconnect_(?:school|company)\\.)?${target}\\(id\\)`,'i'))})
test('có index cho truy vấn trọng yếu',()=>{for(const index of['idx_jobs_company','idx_jobs_status','idx_jobs_deadline','idx_applications_student','idx_applications_job','idx_applications_status','idx_application_events_application','idx_notifications_recipient','idx_audit_created'])assert.match(sql,new RegExp(index,'i'))})

test('fresh import keeps foreign keys enabled and includes recruitment review fields',()=>{
  assert.equal((sql.match(/^CREATE TABLE /gm)||[]).length,27)
  assert.doesNotMatch(sql,/SET\s+FOREIGN_KEY_CHECKS\s*=\s*0/i)
  assert.doesNotMatch(sql,/DROP\s+(DATABASE|TABLE)\s/i)
  for(const column of ['review_status','pending_revision','review_note','reviewed_by','reviewed_at'])assert.match(sql,new RegExp(`\\b${column}\\b`))
  assert.match(sql,/chk_job_quantity CHECK \(quantity > 0\)/)
  assert.match(sql,/chk_record_dates CHECK \(end_date >= start_date\)/)
})
