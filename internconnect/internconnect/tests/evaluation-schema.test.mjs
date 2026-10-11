import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const schema = (await Promise.all(['01_school.sql', '02_company.sql'].map(file => readFile(new URL(`../database/${file}`, import.meta.url), 'utf8')))).join('\n')

test('mỗi hồ sơ chỉ có một đánh giá cho mỗi vai trò', () => {
  assert.match(schema, /UNIQUE KEY uq_evaluation_role \(internship_record_id, evaluator_role\)/)
})

test('database ràng buộc CV và internship record đúng chủ thể', () => {
  assert.match(schema, /FOREIGN KEY \(cv_id, student_id\) REFERENCES internconnect_school.cvs\(id, student_id\)/)
  assert.match(schema, /FOREIGN KEY \(application_id, student_id, job_id, internship_period_id\) REFERENCES internconnect_company.applications\(id, student_id, job_id, internship_period_id\)/)
  assert.match(schema, /FOREIGN KEY \(job_id, company_id\) REFERENCES internconnect_company.jobs\(id, company_id\)/)
})
