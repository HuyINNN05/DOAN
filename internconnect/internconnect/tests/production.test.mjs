import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import process from 'node:process'
import express from 'express'

const configEnv = { NODE_ENV: 'production', JWT_ACCESS_SECRET: 'a'.repeat(40), JWT_REFRESH_SECRET: 'b'.repeat(40), DB_PASSWORD: 'test-only-strong-password', CORS_ORIGIN: '' }
function check(overrides) {
  return spawnSync(process.execPath, ['--input-type=module', '-e', "import './server/config/env.js'"], {
    env: { ...process.env, ...configEnv, ...overrides }, encoding: 'utf8',
  })
}
test('production rejects default secrets, equal JWT keys, wildcard CORS and invalid proxy hops', () => {
  assert.equal(check({}).status, 0)
  for (const input of [{ JWT_ACCESS_SECRET: 'development-access-secret-change-me' }, { DB_PASSWORD: '' },
    { DB_PASSWORD: 'change_me' }, { JWT_REFRESH_SECRET: 'a'.repeat(40) }, { CORS_ORIGIN: '*' }, { TRUST_PROXY_HOPS: 'true' }]) {
    assert.notEqual(check(input).status, 0)
  }
})
test('invalid environment diagnostics do not include secret values', () => {
  const result = check({ JWT_ACCESS_SECRET: 'private-marker' })
  assert.notEqual(result.status, 0)
  assert.ok(!result.stderr.includes('private-marker'))
})
test('one trusted proxy uses normalized client IP and HTTPS instead of attacker leftmost XFF', async () => {
  const app = express()
  app.set('trust proxy', 1)
  app.get('/', (req, res) => res.json({ ip: req.ip, secure: req.secure }))
  const server = app.listen(0, '127.0.0.1')
  await new Promise(resolve => server.once('listening', resolve))
  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/`, {
      headers: { 'X-Forwarded-For': '198.51.100.99, 203.0.113.10', 'X-Forwarded-Proto': 'https' },
    })
    assert.deepEqual(await response.json(), { ip: '203.0.113.10', secure: true })
  } finally { await new Promise(resolve => server.close(resolve)) }
})
