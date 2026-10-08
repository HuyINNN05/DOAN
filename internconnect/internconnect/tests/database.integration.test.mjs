import test, { after } from 'node:test'
import assert from 'node:assert/strict'
import process from 'node:process'
import { db, transaction } from '../server/config/database.js'

const enabled = process.env.RUN_DB_TESTS === '1'
const missingFk = (error) => error.code === 'ER_NO_REFERENCED_ROW_2'
after(async () => { if (enabled) await db.end() })

test('database từ chối application tham chiếu entity không tồn tại', { skip: !enabled }, async () => {
  await assert.rejects(db.execute(`INSERT INTO applications(student_id,job_id,cv_id,internship_period_id,status) VALUES(999999999,999999999,999999999,999999999,'02')`), missingFk)
})

test('database từ chối interview có application không tồn tại', { skip: !enabled }, async () => {
  await assert.rejects(db.execute(`INSERT INTO interviews(application_id,scheduled_at,type,status,created_by) VALUES(999999999,NOW(),'online','scheduled',999999999)`), missingFk)
})

test('database từ chối internship record có application không tồn tại', { skip: !enabled }, async () => {
  await assert.rejects(db.execute(`INSERT INTO internship_records(application_id,student_id,company_id,job_id,internship_period_id,status) VALUES(999999999,999999999,999999999,999999999,999999999,'pending')`), missingFk)
})

test('database từ chối evaluation có internship record không tồn tại', { skip: !enabled }, async () => {
  await assert.rejects(db.execute(`INSERT INTO evaluations(internship_record_id,evaluator_user_id,evaluator_role,total_score) VALUES(999999999,999999999,'lecturer',8)`), missingFk)
})

test('transaction rollback toàn bộ khi bước sau lỗi', { skip: !enabled }, async () => {
  const marker = `rollback-${Date.now()}@example.com`
  await assert.rejects(transaction(async (connection) => {
    await connection.execute(`INSERT INTO users(email,password_hash,full_name,role,status) VALUES(?,'x','Rollback Test','student','active')`, [marker])
    throw new Error('forced')
  }))
  const [rows] = await db.execute('SELECT id FROM users WHERE email=?', [marker])
  assert.equal(rows.length, 0)
})
