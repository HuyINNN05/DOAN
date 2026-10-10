import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import bcrypt from 'bcryptjs'

const seed = await readFile(new URL('../database/seed.sql', import.meta.url), 'utf8')

const accountCases = [
  ['admin@internconnect.vn', 'Admin@123'],
  ['sv001@internconnect.vn', 'Student@123'],
  ['gv001@internconnect.vn', 'Lecturer@123'],
  ['company1@internconnect.vn', 'Company@123'],
]

test('mật khẩu tài khoản seed khớp README', async () => {
  for (const [email, password] of accountCases) {
    const match = seed.match(new RegExp(`\\('${email.replace('.', '\\.')}',\\s*'([^']+)'`))
    assert.ok(match, `Không tìm thấy tài khoản ${email}`)
    assert.equal(await bcrypt.compare(password, match[1]), true, `Sai mật khẩu seed của ${email}`)
  }
})

test('seed có đủ dữ liệu tối thiểu và nhiều trạng thái application', () => {
  for (const email of accountCases.map(([email]) => email)) assert.match(seed, new RegExp(email.replace('.', '\\.')))
  assert.match(seed, /'approved'/)
  assert.match(seed, /'pending'/)
  assert.match(seed, /@student1,@job1,@cv1,@period,'04'/)
  assert.match(seed, /@student2,@job2,@cv2,@period,'02'/)
})
