import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

const routes = fs.readFileSync(new URL('../server/routes/adminRoutes.js', import.meta.url), 'utf8')

test('assignment POST và PATCH dùng handler riêng, PATCH không bỏ qua id', () => {
  assert.match(routes, /post\('\/assignments'.*c\.createAssignment/)
  assert.match(routes, /patch\('\/assignments\/:id'.*c\.updateAssignment/)
  assert.doesNotMatch(routes, /patch\('\/assignments\/:id'.*c\.assign/)
})
