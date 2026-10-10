import test from 'node:test'
import assert from 'node:assert/strict'
import { validateIdParam } from '../server/middleware/validateIdParam.js'

const invoke = (value) => new Promise((resolve) => validateIdParam({}, {}, resolve, value))

test('ID route chỉ chấp nhận số nguyên dương', async () => {
  assert.equal(await invoke('1'), undefined)
  for (const value of ['0', '-1', '1.5', 'abc', '1 OR 1=1']) {
    const error = await invoke(value)
    assert.equal(error.code, 'INVALID_ID')
    assert.equal(error.status, 422)
  }
})
