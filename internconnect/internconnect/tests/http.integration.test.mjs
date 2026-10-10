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

test('company registration explains invalid fields and stores valid pending accounts', { skip: !enabled }, async () => {
  const suffix = String(Date.now()), email = `registration-${suffix}@example.com`
  const input = {fullName:'Registration Tester',email,password:'Example@123',companyName:'Regression registration company',taxCode:'225534',companyEmail:email}
  const invalid = await request('/api/auth/company-register',{method:'POST',body:JSON.stringify(input)})
  assert.equal(invalid.status,422)
  assert.deepEqual(invalid.body.error.details.fieldErrors.taxCode,['Mã số thuế phải có ít nhất 8 ký tự'])
  let companyId
  try {
    const created = await request('/api/auth/company-register',{method:'POST',body:JSON.stringify({...input,taxCode:suffix})})
    assert.equal(created.status,201)
    companyId = created.body.data.companyId
    assert.equal(created.body.data.status,'pending')
    const [accounts] = await db.execute('SELECT u.status,ca.company_id FROM users u JOIN company_accounts ca ON ca.user_id=u.id WHERE u.email=?',[email])
    assert.equal(accounts[0].company_id,companyId)
    assert.equal(accounts[0].status,'pending')
  } finally {
    if (companyId) { await db.execute('DELETE FROM company_accounts WHERE company_id=?',[companyId]); await db.execute('DELETE FROM companies WHERE id=?',[companyId]) }
    await db.execute('DELETE FROM users WHERE email=?',[email])
  }
})

test('public job listing includes total and pagination metadata', { skip: !enabled }, async () => {
  const response = await request('/api/jobs?limit=1&page=1')
  assert.equal(response.status, 200)
  assert.ok(Number.isInteger(response.body.data.total))
  assert.equal(response.body.data.pages, response.body.data.total)
  assert.equal(response.body.data.limit, 1)
  assert.ok(response.body.data.items.length <= 1)
  const empty = await request('/api/jobs?search=__no_matching_job_for_pagination__')
  assert.equal(empty.body.data.total, 0)
  assert.equal(empty.body.data.pages, 0)
  assert.deepEqual(empty.body.data.items, [])
  const hostile = await request('/api/jobs?limit=1.5&page=Infinity')
  assert.equal(hostile.status,200)
  assert.equal(hostile.body.data.limit,1)
  assert.equal(hostile.body.data.page,1)
})

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
    const existingSession = await request('/api/students/me', { headers: auth(tokens.student2) })
    assert.equal(existingSession.status, 403)
    assert.equal(existingSession.body.error.code, 'USER_NOT_ACTIVE')
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

test('upload checks actual content and document download enforces ownership', { skip: !enabled }, async () => {
  let cvId
  const upload = async (contents, name = 'Regression CV') => {
    const form = new FormData()
    form.set('name',name)
    form.set('file',new Blob([contents],{type:'application/pdf'}),'regression.pdf')
    const response = await fetch(`${base}/api/students/me/cvs`,{method:'POST',headers:auth(tokens.student1),body:form})
    return {status:response.status,body:await response.json()}
  }
  try {
    const invalid = await upload('executable masquerading as a PDF')
    assert.equal(invalid.status,422)
    assert.equal(invalid.body.error.code,'INVALID_FILE_CONTENT')
    const missingName = await upload('%PDF-1.7\ntrailer\n%%EOF','')
    assert.equal(missingName.status,422)
    assert.equal(missingName.body.error.code,'INVALID_CV_NAME')
    const created = await upload('%PDF-1.7\ntrailer\n%%EOF')
    assert.equal(created.status,201)
    cvId = created.body.data.id
    const own = await fetch(`${base}/api/documents/cvs/${cvId}/download`,{headers:auth(tokens.student1)})
    assert.equal(own.status,200)
    assert.match(own.headers.get('content-disposition'),/attachment/)
    assert.match(await own.text(),/^%PDF-/)
    assert.equal((await request(`/api/documents/cvs/${cvId}/download`,{headers:auth(tokens.student2)})).status,404)
    assert.equal((await request(`/api/documents/cvs/${cvId}/download`,{headers:auth(tokens.company2)})).status,404)
  } finally {
    if (cvId) assert.equal((await request(`/api/students/me/cvs/${cvId}`,{method:'DELETE',headers:auth(tokens.student1)})).status,204)
  }
})
