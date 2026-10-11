import test, { after } from 'node:test'
import assert from 'node:assert/strict'
import process from 'node:process'
import bcrypt from 'bcryptjs'
import { db } from '../server/config/database.js'
import { app } from '../server/app.js'
import { createAccessToken, hashToken } from '../server/services/tokenService.js'
import * as service from '../server/services/accountProvisioningService.js'
import * as admin from '../server/services/adminService.js'
import * as auth from '../server/services/authService.js'
import { parseAccountCsv } from '../shared/accountCsv.js'

after(async () => { await db.end() })
test('school provisioning, isolated bulk errors, activation security and Admin-only APIs', { skip: process.env.RUN_DB_TESTS !== '1' }, async t => {
  const suffix = String(Date.now()), ids = [], tokens = new Map()
  const [admins] = await db.query("SELECT * FROM users WHERE role='admin' AND status='active' LIMIT 1")
  const [students] = await db.query("SELECT * FROM users WHERE role='student' AND status='active' LIMIT 1")
  const actor = { sub: admins[0].id, role: 'admin' }
  const input = index => ({ role: 'student', fullName: 'Provisioning Student', email: `provision-${index}-${suffix}@example.test`, studentCode: `PS${index}${suffix}`, faculty: 'CNTT', major: 'Software', className: 'D26', course: '2026' })
  const mailer = async mail => { tokens.set(mail.email, mail.token); return { status: 'sent', code: null, message: 'Test transport accepted email' } }
  let student, lecturer, server
  try {
    await t.test('student and lecturer profiles commit before email; API responses have no secrets', async () => {
      student = await service.createAccount(actor, input(1), async mail => {
        const [rows] = await db.execute('SELECT s.student_code FROM students s JOIN users u ON u.id=s.user_id WHERE u.email=?', [mail.email])
        assert.equal(rows[0].student_code, input(1).studentCode)
        return mailer(mail)
      }); ids.push(student.id)
      lecturer = await service.createAccount(actor, { role: 'lecturer', fullName: 'Provisioning Lecturer', email: `lecturer-${suffix}@example.test`, lecturerCode: `PL${suffix}`, department: 'Software', academicTitle: 'Master' }, mailer); ids.push(lecturer.id)
      const [rows] = await db.execute('SELECT id,password_hash,status FROM users WHERE id IN (?,?)', [student.id, lecturer.id])
      assert.equal(rows[0].status, 'pending'); assert.equal(rows[1].status, 'pending')
      assert.notEqual(rows[0].password_hash, rows[1].password_hash)
      assert.equal(await bcrypt.compare('Student@123', rows[0].password_hash), false)
      assert.ok(!JSON.stringify([student, lecturer]).includes(tokens.get(student.email)))
      assert.doesNotMatch(JSON.stringify([student, lecturer]), /password_hash|token_hash/)
      const [stored] = await db.execute('SELECT token_hash FROM account_invitations WHERE user_id=?', [student.id])
      assert.equal(stored[0].token_hash, hashToken(tokens.get(student.email)))
    })
    await t.test('duplicate email/code and invalid role/input are rejected without overwrites', async () => {
      await assert.rejects(service.createAccount(actor, { ...input(2), email: student.email }, mailer), { code: 'EMAIL_EXISTS' })
      await assert.rejects(service.createAccount(actor, { ...input(2), studentCode: input(1).studentCode }, mailer), { code: 'CODE_EXISTS' })
      await assert.rejects(service.createAccount(actor, { ...input(2), role: 'admin' }, mailer), { code: 'INVALID_ACCOUNT' })
      await assert.rejects(service.createAccount(actor, { ...input(2), fullName: '' }, mailer), { code: 'INVALID_ACCOUNT' })
      await assert.rejects(admin.setUserStatus(actor, student.id, 'active'), { code: 'ACTIVATION_REQUIRED' })
    })
    await t.test('profile failure rolls back the inserted user and never sends email', async () => {
      const original = db.getConnection
      let sent = false
      db.getConnection = async function () {
        const connection = await original.call(db), execute = connection.execute.bind(connection)
        connection.execute = (sql, params) => sql.startsWith('INSERT INTO students') ? Promise.reject(new Error('profile failure')) : execute(sql, params)
        const release = connection.release.bind(connection)
        connection.release = () => { connection.execute = execute; connection.release = release; release() }
        return connection
      }
      try { await assert.rejects(service.createAccount(actor, input(3), async () => { sent = true }), { code: 'ACCOUNT_CREATE_FAILED' }) }
      finally { db.getConnection = original }
      const [rows] = await db.execute('SELECT id FROM users WHERE email=?', [input(3).email])
      assert.equal(rows.length, 0); assert.equal(sent, false)
    })
    await t.test('bulk mixed rows keep valid creations and report row errors and delivery failures', async () => {
      const csv = `role,fullName,email,studentCode\nstudent,Valid Student,${input(4).email},${input(4).studentCode}\nstudent,Duplicate Student,${input(4).email},${input(5).studentCode}\nadmin,Invalid Role,${input(6).email},${input(6).studentCode}\nstudent,Other Student,${input(7).email},${input(7).studentCode}`
      const result = await service.importAccounts(actor, parseAccountCsv(csv), async () => { throw new Error('secret transport error must not be exposed') })
      ids.push(...result.results.filter(row => row.account).map(row => row.account.id))
      assert.deepEqual(result.summary, { total: 4, created: 2, errors: 2, emailSent: 0, emailNotSent: 2 })
      assert.equal(result.results[1].line, 3); assert.equal(result.results[1].error.code, 'DUPLICATE_IN_FILE')
      assert.equal(result.results[3].account.delivery.status, 'failed')
      assert.ok(!JSON.stringify(result).includes('secret transport error'))
      const retried = await service.importAccounts(actor, parseAccountCsv(csv), mailer)
      assert.equal(retried.summary.created, 0)
    })
    await t.test('resend rotates tokens; expired, failed, locked and used invitations cannot activate', async () => {
      const oldToken = tokens.get(student.email)
      await service.resendActivation(actor, student.id, mailer)
      const currentToken = tokens.get(student.email)
      assert.notEqual(oldToken, currentToken)
      await assert.rejects(service.activateAccount(oldToken, 'NewPassword@123'), { code: 'ACTIVATION_INVALID' })
      await db.execute('UPDATE account_invitations SET expires_at=DATE_SUB(NOW(),INTERVAL 1 MINUTE) WHERE user_id=?', [student.id])
      await assert.rejects(service.activateAccount(currentToken, 'NewPassword@123'), { code: 'ACTIVATION_INVALID' })
      await service.resendActivation(actor, student.id, mailer)
      await admin.setUserStatus(actor, student.id, 'locked')
      await assert.rejects(service.activateAccount(tokens.get(student.email), 'NewPassword@123'), { code: 'ACTIVATION_INVALID' })
      await admin.setUserStatus(actor, student.id, 'pending')
      await db.execute("INSERT INTO refresh_tokens(user_id,token_hash,family_id,expires_at) VALUES(?,?,'activation-test',DATE_ADD(NOW(),INTERVAL 1 DAY))", [student.id, 'b'.repeat(64)])
      await service.activateAccount(tokens.get(student.email), 'NewPassword@123')
      await assert.rejects(service.activateAccount(tokens.get(student.email), 'OtherPassword@123'), { code: 'ACTIVATION_INVALID' })
      await assert.rejects(service.resendActivation(actor, student.id, mailer), { code: 'ACCOUNT_NOT_AWAITING_ACTIVATION' })
      const [rows] = await db.execute('SELECT status,password_hash FROM users WHERE id=?', [student.id])
      assert.equal(rows[0].status, 'active'); assert.equal(await bcrypt.compare('NewPassword@123', rows[0].password_hash), true)
      const [sessions] = await db.execute('SELECT revoked_at FROM refresh_tokens WHERE user_id=?', [student.id])
      assert.ok(sessions[0].revoked_at)
    })
    await t.test('failed-email invitation cannot be used; search includes student and lecturer codes; audit has no secrets', async () => {
      const failed = await service.createAccount(actor, input(8), async mail => { tokens.set(mail.email, mail.token); return { status: 'not_configured', code: 'SMTP_NOT_CONFIGURED', message: 'Not configured' } }); ids.push(failed.id)
      await assert.rejects(service.activateAccount(tokens.get(failed.email), 'NewPassword@123'), { code: 'ACTIVATION_INVALID' })
      assert.equal((await admin.users({ search: input(8).studentCode, role: 'student', status: 'pending' })).items[0].id, failed.id)
      assert.equal((await admin.users({ search: `PL${suffix}`, role: 'lecturer' })).items[0].id, lecturer.id)
      const [logs] = await db.execute("SELECT new_values FROM audit_logs WHERE entity_type='user' AND entity_id IN (?,?)", [student.id, lecturer.id])
      for (const token of tokens.values()) assert.ok(!JSON.stringify(logs).includes(token))
      assert.doesNotMatch(JSON.stringify(logs), /password_hash|token_hash|NewPassword/)
    })
    await t.test('HTTP APIs reject anonymous/non-admin requests, validate uploads, preview without writes, and report missing SMTP', async () => {
      server = await new Promise(resolve => { const instance = app.listen(0, '127.0.0.1', () => resolve(instance)) })
      const url = `http://127.0.0.1:${server.address().port}/api`
      const headers = user => ({ authorization: `Bearer ${createAccessToken(user)}` })
      for (const path of ['/admin/users','/admin/users/import','/admin/users/import/preview',`/admin/users/${lecturer.id}/resend-activation`]) {
        assert.equal((await fetch(url + path, { method: 'POST' })).status, 401)
        assert.equal((await fetch(url + path, { method: 'POST', headers: headers(students[0]) })).status, 403)
      }
      const post = async (path, body) => fetch(url + path, { method: 'POST', headers: { ...headers(admins[0]), 'content-type': 'application/json' }, body: JSON.stringify(body) })
      assert.equal((await post('/admin/users', { ...input(9), role: 'company' })).status, 422)
      const csv = `role,fullName,email,studentCode\nstudent,HTTP Student,${input(9).email},${input(9).studentCode}`
      const upload = async (path, name = 'accounts.csv') => { const form = new FormData(); form.set('file', new Blob([csv], { type: 'text/csv' }), name); return fetch(url + path, { method: 'POST', headers: headers(admins[0]), body: form }) }
      assert.equal((await upload('/admin/users/import/preview', 'accounts.xlsx')).status, 422)
      const preview = await upload('/admin/users/import/preview'); assert.equal(preview.status, 200)
      assert.equal((await preview.json()).data.summary.valid, 1)
      assert.equal((await db.execute('SELECT id FROM users WHERE email=?', [input(9).email]))[0].length, 0)
      const created = await post('/admin/users', input(9)); assert.equal(created.status, 201)
      const body = (await created.json()).data; ids.push(body.id)
      assert.equal(body.delivery.status, 'not_configured')
      assert.doesNotMatch(JSON.stringify(body), /token_hash|password_hash/)
      const response = await fetch(url + '/auth/activate-account', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token: tokens.get(lecturer.email), password: 'LecturerNew@123' }) })
      assert.equal(response.status, 200)
      const known = await fetch(url + '/auth/forgot-password', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: lecturer.email }) })
      const unknown = await fetch(url + '/auth/forgot-password', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: `unknown-${suffix}@example.test` }) })
      assert.equal(known.status, 503); assert.deepEqual(await known.json(), await unknown.json())
      const resetToken = 'c'.repeat(64)
      await db.execute('INSERT INTO password_reset_tokens(user_id,token_hash,expires_at) VALUES(?,?,DATE_ADD(NOW(),INTERVAL 30 MINUTE))', [lecturer.id, hashToken(resetToken)])
      await auth.resetPassword(resetToken, 'ResetStillWorks@123')
      await assert.rejects(auth.resetPassword(resetToken, 'ResetStillWorks@123'), { code: 'RESET_TOKEN_INVALID' })
    })
  } finally {
    if (server) { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)) }
    for (const id of ids) {
      await db.execute("DELETE FROM audit_logs WHERE (entity_type='user' AND entity_id=?) OR actor_user_id=?", [id, id])
      for (const table of ['account_invitations','refresh_tokens','password_reset_tokens','students','lecturers']) await db.execute(`DELETE FROM ${table} WHERE user_id=?`, [id])
      await db.execute('DELETE FROM users WHERE id=?', [id])
    }
  }
})
