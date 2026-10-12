import test from 'node:test'
import assert from 'node:assert/strict'
import { webcrypto } from 'node:crypto'
import { validate, version } from 'uuid'
import { getTabId, rotateTabId } from '../Fontend/src/api/tabSession.js'
import { api, setAccessToken } from '../Fontend/src/api/client.js'
import { listJobs } from '../Fontend/src/api/publicApi.js'

function fixture(crypto) {
  const oldCrypto = Object.getOwnPropertyDescriptor(globalThis, 'crypto')
  const oldStorage = Object.getOwnPropertyDescriptor(globalThis, 'sessionStorage')
  const values = new Map()
  Object.defineProperty(globalThis, 'crypto', { configurable: true, value: crypto })
  Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, value: {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key),
  } })
  return () => {
    for (const [key, descriptor] of [['crypto', oldCrypto], ['sessionStorage', oldStorage]]) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor)
      else delete globalThis[key]
    }
  }
}

test('HTTP LAN generates secure v4 UUIDs without randomUUID and keeps the tab ID stable', () => {
  let draws = 0
  const restore = fixture({ getRandomValues(bytes) { draws++; return webcrypto.getRandomValues(bytes) } })
  try {
    const first = getTabId()
    assert.ok(validate(first))
    assert.equal(version(first), 4)
    assert.equal(getTabId(), first)
    assert.equal(draws, 1)
    rotateTabId()
    const second = getTabId()
    assert.ok(validate(second))
    assert.equal(version(second), 4)
    assert.notEqual(second, first)
    assert.equal(draws, 2)
  } finally { restore() }
})

test('HTTPS uses native randomUUID once per tab and again only on rotation', () => {
  let calls = 0
  const restore = fixture({ randomUUID() { calls++; return webcrypto.randomUUID() } })
  try {
    const first = getTabId()
    assert.ok(validate(first))
    assert.equal(getTabId(), first)
    assert.equal(calls, 1)
    rotateTabId()
    assert.notEqual(getTabId(), first)
    assert.equal(calls, 2)
  } finally { restore() }
})

test('missing cryptographic entropy fails explicitly rather than using weak randomness', () => {
  const restore = fixture({})
  try { assert.throws(getTabId, /mã phiên an toàn/) } finally { restore() }
})

test('HTTP LAN jobs request reaches Axios adapter and preserves all four jobs', async () => {
  const restore = fixture({ getRandomValues: bytes => webcrypto.getRandomValues(bytes) })
  const adapter = api.defaults.adapter, calls = []
  setAccessToken(null)
  const items = Array.from({ length: 4 }, (_, index) => ({ id: index + 1, title: `Job ${index + 1}`, company_name: 'Company', skills: null }))
  api.defaults.adapter = async config => {
    calls.push(config)
    return { status: 200, headers: {}, config, data: { success: true, data: { items, total: 4, pages: 1, page: 1, limit: 12 } } }
  }
  try {
    for (let i = 0; i < 2; i++) {
      const jobs = await listJobs({ page: 1, limit: 12 })
      assert.equal(jobs.total, 4)
      assert.equal(jobs.items.length, 4)
      assert.equal(jobs.items[0].title, 'Job 1')
    }
    assert.ok(calls.every(config => config.url === '/jobs'))
    assert.ok(validate(calls[0].headers['X-Session-Id']))
    assert.equal(calls[0].headers['X-Session-Id'], calls[1].headers['X-Session-Id'])
  } finally { api.defaults.adapter = adapter; setAccessToken(null); restore() }
})
