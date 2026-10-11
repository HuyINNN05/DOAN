import test from 'node:test'
import assert from 'node:assert/strict'
import { parseAccountCsv, ACCOUNT_CSV_TEMPLATE, MAX_ACCOUNT_ROWS } from '../shared/accountCsv.js'
import { accountSchema } from '../server/validation/accountProvisioning.js'
import { createAccountMailer } from '../server/services/accountMailService.js'

test('downloadable CSV template and quoted UTF-8 cells are valid in the browser/server shared parser', () => {
  const rows = parseAccountCsv(ACCOUNT_CSV_TEMPLATE)
  assert.equal(rows.length, 2)
  for (const row of rows) assert.ok(accountSchema.safeParse(row.data).success)
  const quoted = parseAccountCsv('role,fullName,email,studentCode\r\nstudent,"Nguyễn, Văn ""An""",an@school.test,SV01')
  assert.equal(quoted[0].data.fullName, 'Nguyễn, Văn "An"')
  assert.equal(quoted[0].line, 2)
  assert.equal(parseAccountCsv('role;fullName;email;studentCode\nstudent;Nguyễn An;an@school.test;SV01')[0].data.studentCode, 'SV01')
})
test('CSV rejects malicious headers, malformed quoting and excessive rows; cell-count errors retain row numbers', () => {
  for (const csv of ['role,email,email\nstudent,a,b','role,email,password\nstudent,a,secret','role,fullName,email\nstudent,"unfinished,a']) assert.throws(() => parseAccountCsv(csv))
  assert.throws(() => parseAccountCsv('role,fullName,email,studentCode\n' + 'student,Nguyễn An,an@school.test,SV01\n'.repeat(MAX_ACCOUNT_ROWS + 1)))
  const rows = parseAccountCsv('role,fullName,email,studentCode\nstudent,Nguyễn An,an@school.test\nstudent,Trần An,tran@school.test,SV02')
  assert.ok(rows[0].error); assert.equal(rows[1].line, 3)
})
test('only student and lecturer roles are accepted; server rejects invalid fields and password injection', () => {
  const student = { role: 'student', fullName: 'Nguyễn An', email: ' AN@SCHOOL.TEST ', studentCode: 'SV01' }
  assert.equal(accountSchema.parse(student).email, 'an@school.test')
  for (const input of [{ ...student, role: 'admin' }, { ...student, studentCode: '' }, { ...student, password: 'Student@123' }, { ...student, email: 'invalid' }, { ...student, fullName: ' ' }]) assert.equal(accountSchema.safeParse(input).success, false)
})
test('missing email configuration and transport rejection never report success or expose secrets', async () => {
  const input = { email: 'an@school.test', fullName: 'Nguyễn An', token: 'a'.repeat(64) }
  assert.equal((await createAccountMailer({})(input)).status, 'not_configured')
  const settings = { SMTP_HOST: 'localhost', SMTP_FROM: 'admin@school.test', APP_PUBLIC_URL: 'https://school.test', ACCOUNT_ACTIVATION_HOURS: 24 }
  const failed = await createAccountMailer(settings, { sendMail: async () => { throw new Error(input.token) } })(input)
  assert.equal(failed.status, 'failed'); assert.ok(!JSON.stringify(failed).includes(input.token))
  const rejected = await createAccountMailer(settings, { sendMail: async () => ({ accepted: [], rejected: [input.email] }) })(input)
  assert.equal(rejected.status, 'failed')
  let message
  const sent = await createAccountMailer(settings, { sendMail: async value => { message = value; return { accepted: [input.email] } } })(input)
  assert.equal(sent.status, 'sent'); assert.match(message.text, /activate-account#token=/)
  assert.ok(!JSON.stringify(sent).includes(input.token))
})
