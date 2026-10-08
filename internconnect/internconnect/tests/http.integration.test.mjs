import test, { after, before } from 'node:test'
import assert from 'node:assert/strict'
import process from 'node:process'
import { app } from '../server/app.js'
import { db } from '../server/config/database.js'

const enabled = process.env.RUN_API_TESTS === '1'
let server, base, ids, tokens

async function request(path, options = {}) {
  const response = await fetch(`${base}${path}`, { ...options, headers: { 'content-type': 'application/json', ...(options.headers || {}) } })
  let body = null
  try { body = await response.json() } catch { /* 204 */ }
  return { status: response.status, body, cookie: response.headers.get('set-cookie') }
}

async function login(email, password) {
  const response = await request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
  assert.equal(response.status, 200)
  return response.body.data.accessToken
}

const auth = (token) => ({ authorization: `Bearer ${token}` })

before(async () => {
  if (!enabled) return
  server = await new Promise((resolve) => { const instance = app.listen(0, '127.0.0.1', () => resolve(instance)) })
  base = `http://127.0.0.1:${server.address().port}`
  const [applications] = await db.execute(`SELECT a.id,s.student_code,c.tax_code FROM applications a JOIN students s ON s.id=a.student_id JOIN jobs j ON j.id=a.job_id JOIN companies c ON c.id=j.company_id`)
  ids = {
    student1App: applications.find((item) => item.student_code === 'SV001').id,
    student2App: applications.find((item) => item.student_code === 'SV002').id,
  }
  tokens = {
    student1: await login('sv001@internconnect.vn', 'Student@123'),
    student2: await login('sv002@internconnect.vn', 'Student@123'),
    company1: await login('company1@internconnect.vn', 'Company@123'),
    company2: await login('company2@internconnect.vn', 'Company@123'),
    lecturer1: await login('gv001@internconnect.vn', 'Lecturer@123'),
  }
})

after(async () => {
  if (!enabled) return
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
  await db.end()
})

test('Student A không đọc application của Student B', { skip: !enabled }, async () => {
  assert.equal((await request(`/api/applications/${ids.student1App}`, { headers: auth(tokens.student1) })).status, 200)
  assert.equal((await request(`/api/applications/${ids.student2App}`, { headers: auth(tokens.student1) })).status, 404)
  assert.equal((await request(`/api/applications/${ids.student1App}`, { headers: auth(tokens.student2) })).status, 404)
})

test('Company A không đọc application của Company B', { skip: !enabled }, async () => {
  assert.equal((await request(`/api/company/applications/${ids.student1App}`, { headers: auth(tokens.company1) })).status, 200)
  assert.equal((await request(`/api/company/applications/${ids.student2App}`, { headers: auth(tokens.company1) })).status, 404)
  assert.equal((await request(`/api/company/applications/${ids.student1App}`, { headers: auth(tokens.company2) })).status, 404)
})

test('Lecturer chỉ đọc application của sinh viên được phân công', { skip: !enabled }, async () => {
  assert.equal((await request(`/api/applications/${ids.student1App}`, { headers: auth(tokens.lecturer1) })).status, 200)
  assert.equal((await request(`/api/applications/${ids.student2App}`, { headers: auth(tokens.lecturer1) })).status, 404)
})

test('API từ chối ID không hợp lệ trước khi truy vấn', { skip: !enabled }, async () => {
  const response = await request('/api/applications/1%20OR%201=1', { headers: auth(tokens.student1) })
  assert.equal(response.status, 422)
  assert.equal(response.body.error.code, 'INVALID_ID')
})

test('auth từ chối password sai, company pending, user inactive và locked', { skip: !enabled }, async () => {
  const wrong = await request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: 'admin@internconnect.vn', password: 'wrong-password' }) })
  assert.equal(wrong.status, 401)
  assert.equal(wrong.body.error.code, 'INVALID_CREDENTIALS')
  const pending = await request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: 'pending@internconnect.vn', password: 'Company@123' }) })
  assert.equal(pending.status, 403)
  assert.equal(pending.body.error.code, 'USER_PENDING')
  try {
    await db.execute(`UPDATE users SET status='inactive' WHERE email='sv002@internconnect.vn'`)
    const inactive = await request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: 'sv002@internconnect.vn', password: 'Student@123' }) })
    assert.equal(inactive.status, 403)
    assert.equal(inactive.body.error.code, 'USER_INACTIVE')
    await db.execute(`UPDATE users SET status='locked' WHERE email='sv002@internconnect.vn'`)
    const locked = await request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: 'sv002@internconnect.vn', password: 'Student@123' }) })
    assert.equal(locked.status, 403)
    assert.equal(locked.body.error.code, 'USER_LOCKED')
  } finally { await db.execute(`UPDATE users SET status='active' WHERE email='sv002@internconnect.vn'`) }
})

test('refresh rotation, replay protection và logout hoạt động qua HTTP', { skip: !enabled }, async () => {
  const loggedIn = await request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: 'admin@internconnect.vn', password: 'Admin@123' }) })
  assert.equal(loggedIn.status, 200)
  assert.match(loggedIn.cookie, /refreshToken=/)
  const rotated = await request('/api/auth/refresh', { method: 'POST', headers: { cookie: loggedIn.cookie } })
  assert.equal(rotated.status, 200)
  assert.ok(rotated.body.data.accessToken)
  const replay = await request('/api/auth/refresh', { method: 'POST', headers: { cookie: loggedIn.cookie } })
  assert.equal(replay.status, 401)
  assert.equal(replay.body.error.code, 'REFRESH_TOKEN_REPLAYED')
  const logout = await request('/api/auth/logout', { method: 'POST', headers: { cookie: rotated.cookie } })
  assert.equal(logout.status, 204)
})

test('danh sách lớn trả metadata phân trang và giữ ownership', { skip: !enabled }, async () => {
  const jobs = await request('/api/company/jobs?page=1&limit=1&sort=title', { headers: auth(tokens.company1) })
  assert.equal(jobs.status, 200)
  assert.equal(jobs.body.data.limit, 1)
  assert.ok(Array.isArray(jobs.body.data.items))
  assert.ok(Number.isInteger(jobs.body.data.total))
  const applications = await request('/api/company/applications?page=1&limit=1&status=04', { headers: auth(tokens.company1) })
  assert.equal(applications.status, 200)
  assert.equal(applications.body.data.items.every((item) => item.status === '04'), true)
  const reports = await request('/api/lecturer/reports?page=1&limit=1', { headers: auth(tokens.lecturer1) })
  assert.equal(reports.status, 200)
  assert.deepEqual(Object.keys(reports.body.data).sort(), ['items','limit','page','pages','total'])
})
