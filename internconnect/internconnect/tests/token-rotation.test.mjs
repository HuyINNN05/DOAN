import test from 'node:test'
import assert from 'node:assert/strict'
import { createRefreshToken, hashToken } from '../server/services/tokenService.js'

test('refresh token rotation luôn tạo token mới trong cùng family', () => {
  const user = { id: 1, role: 'student' }
  const first = createRefreshToken(user)
  const next = createRefreshToken(user, first.familyId)
  assert.equal(next.familyId, first.familyId)
  assert.notEqual(next.token, first.token)
  assert.notEqual(hashToken(next.token), hashToken(first.token))
})
