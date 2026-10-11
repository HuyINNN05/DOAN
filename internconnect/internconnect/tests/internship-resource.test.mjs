import test, { after } from 'node:test'
import assert from 'node:assert/strict'
import process from 'node:process'
import { db } from '../server/config/database.js'
import { companyTables } from '../server/config/companyTables.js'
import { app } from '../server/app.js'
import { createAccessToken } from '../server/services/tokenService.js'
import * as internship from '../server/services/internshipService.js'

after(async () => { await db.end() })

test('empty internship reads are normal data; writes still require a record', async () => {
  const execute = db.execute
  db.execute = async () => [[]]
  try {
    assert.equal(await internship.getRecord(1), null)
    assert.deepEqual(await internship.logs(1), [])
    assert.deepEqual(await internship.reports(1), [])
    await assert.rejects(internship.createLog(1, {}), { code: 'INTERNSHIP_NOT_FOUND' })
    await assert.rejects(internship.updateLog(1, 1, {}), { code: 'INTERNSHIP_NOT_FOUND' })
    await assert.rejects(internship.submitReport(1, { reportType: 'final' }), { code: 'INTERNSHIP_NOT_FOUND' })
  } finally { db.execute = execute }
})

test('optional internship reads preserve records and propagate database errors', async () => {
  const execute = db.execute
  const record = { id: 42, status: 'active', company_name: 'Example' }
  const entries = [{ id: 9, internship_record_id: 42 }]
  db.execute = async sql => [sql.startsWith('SELECT ir.') ? [record] : entries]
  try {
    assert.deepEqual(await internship.getRecord(1), record)
    assert.deepEqual(await internship.logs(1), entries)
    assert.deepEqual(await internship.reports(1), entries)
    const failure = new Error('Database unavailable')
    db.execute = async () => { throw failure }
    for (const read of [internship.getRecord, internship.logs, internship.reports]) {
      await assert.rejects(read(1), error => error === failure)
    }
  } finally { db.execute = execute }
})

test('HTTP internship empty responses keep student/company permissions separate', { skip: process.env.RUN_API_TESTS !== '1' }, async () => {
  let userId, server
  try {
    const suffix = `${Date.now()}-${process.pid}`
    const [result] = await db.execute("INSERT INTO users(email,password_hash,full_name,role,status) VALUES(?,?,?,'student','active')", [`internship-resource-${suffix}@example.com`, 'test-only-unusable-password', 'Resource test'])
    userId = result.insertId
    await db.execute('INSERT INTO students(user_id,student_code) VALUES(?,?)', [userId, `IR-${suffix}`])
    const [users] = await db.execute('SELECT * FROM users WHERE id=?', [userId])
    const studentToken = createAccessToken(users[0])
    const [companies] = await db.query(`SELECT u.*,ca.company_id FROM users u JOIN ${companyTables.company_accounts} ca ON ca.user_id=u.id JOIN ${companyTables.companies} c ON c.id=ca.company_id WHERE u.status='active' AND c.status='approved' AND u.role='company' LIMIT 1`)
    assert.ok(companies[0], 'Requires an approved company fixture')
    const companyToken = createAccessToken(companies[0])
    server = await new Promise(resolve => { const s = app.listen(0, '127.0.0.1', () => resolve(s)) })
    const request = async (path, token, body) => {
      const response = await fetch(`http://127.0.0.1:${server.address().port}/api${path}`, {
        method: body ? 'POST' : 'GET', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        ...(body ? { body: JSON.stringify(body) } : {}),
      })
      return { status: response.status, body: await response.json() }
    }
    for (const [path, data] of [['/students/me/internship', null], ['/students/me/diaries', []], ['/students/me/reports', []]]) {
      const response = await request(path, studentToken)
      assert.equal(response.status, 200)
      assert.deepEqual(response.body, { success: true, data })
      assert.equal((await request(path, companyToken)).status, 403)
    }
    const write = await request('/students/me/diaries', studentToken, { logDate: '2026-10-11', title: 'Test diary', content: 'No internship record' })
    assert.equal(write.status, 404)
    assert.equal(write.body.error.code, 'INTERNSHIP_NOT_FOUND')
    assert.equal((await request('/company/interns', studentToken)).status, 403)
    const interns = await request('/company/interns', companyToken)
    assert.equal(interns.status, 200)
    assert.ok(Array.isArray(interns.body.data))
    assert.ok(interns.body.data.every(row => row.company_id === companies[0].company_id))
  } finally {
    if (server) await new Promise(resolve => server.close(resolve))
    if (userId) {
      await db.execute('DELETE FROM students WHERE user_id=?', [userId])
      await db.execute('DELETE FROM users WHERE id=?', [userId])
    }
  }
})
