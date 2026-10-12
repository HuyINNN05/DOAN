import test from 'node:test'
import assert from 'node:assert/strict'
import { api, setAccessToken } from '../Fontend/src/api/client.js'
import { listJobs, listCompanies, normalizeJobs } from '../Fontend/src/api/publicApi.js'
import { initials, salaryLabel } from '../Fontend/src/utils/display.js'
import { createServer } from 'vite'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'

const payload = { success: true, data: { items: [{ id: 9, title: 'Tuyển TTS', company_name: 'Công ty TNHH Trí Nam', location: 'Hà Nội', work_mode: 'remote', salary_min: '1000000', salary_max: null, skills: '["React"]', deadline: null }], total: 4, pages: 1, page: 1, limit: 20 } }

test('jobs contract preserves pagination and handles optional skills and salary', () => {
  const jobs = normalizeJobs(payload)
  assert.equal(jobs.total, 4)
  assert.equal(jobs.items[0].title, 'Tuyển TTS')
  assert.deepEqual(jobs.items[0].skills, ['React'])
  for (const skills of [null, 'invalid', '{}', [null]]) {
    assert.deepEqual(normalizeJobs({ ...payload, data: { ...payload.data, items: [{ skills }] } }).items[0].skills, [])
  }
  assert.equal(initials(null), 'IC')
  assert.equal(salaryLabel(null, null), 'Thỏa thuận')
  assert.equal(salaryLabel('', 'invalid'), 'Thỏa thuận')
  assert.match(salaryLabel('1000000', null), /^Từ /)
  assert.throws(() => normalizeJobs({ success: true, data: [] }))
  assert.deepEqual(normalizeJobs({ success: true, data: { items: [], total: 0 } }).items, [])
})

test('public jobs remain available when companies fail without refreshing session', async () => {
  const adapter = api.defaults.adapter, calls = []
  setAccessToken('stale-token')
  api.defaults.adapter = async config => {
    calls.push(config.url)
    if (config.url === '/jobs') return { status: 200, data: payload, headers: {}, config }
    throw Object.assign(new Error('Company API failed'), { config, response: { status: 401, data: { error: { message: 'Company API failed' } } } })
  }
  try {
    const [jobs, companies] = await Promise.allSettled([listJobs({ limit: 6 }), listCompanies()])
    assert.equal(jobs.status, 'fulfilled')
    assert.equal(jobs.value.total, 4)
    assert.equal(companies.status, 'rejected')
    assert.deepEqual(calls, ['/jobs', '/public/companies'])
  } finally { api.defaults.adapter = adapter; setAccessToken(null) }
})

test('home renders jobs independently and distinguishes loading, empty and error', async () => {
  // Replace only the hook for deterministic rendering; use the real page and UI.
  const server = await createServer({ server: { middlewareMode: true }, plugins: [{
    name: 'resource-fixture', enforce: 'pre',
    transform(_code, id) {
      if (id.replaceAll('\\', '/').endsWith('/hooks/useApiResource.js')) {
        return 'export default function(loader) { globalThis.__homeLoaders.push(loader); return globalThis.__homeResources.shift() }'
      }
    },
  }] })
  try {
    const { default: Home } = await server.ssrLoadModule('/Fontend/src/pages/HomeApiPage.jsx')
    const resource = (data, extra = {}) => ({ data, loading: false, error: '', reload() {}, ...extra })
    const render = (jobs, companies) => {
      globalThis.__homeLoaders = []
      globalThis.__homeResources = [jobs, companies]
      return renderToStaticMarkup(createElement(MemoryRouter, null, createElement(Home)))
    }
    const jobs = normalizeJobs(payload)
    let html = render(resource(jobs), resource([], { error: 'Company API failed' }))
    for (const text of ['Tuyển TTS', 'Công ty TNHH Trí Nam', 'Hà Nội', 'Từ xa', 'Company API failed']) assert.ok(html.includes(text), text)
    assert.equal(globalThis.__homeLoaders.length, 2)
    html = render(resource({ items: [], total: 0 }), resource([]))
    assert.ok(html.includes('Chưa có vị trí tuyển dụng mới'))
    html = render(resource({ items: [], total: 0 }, { loading: true }), resource([]))
    assert.ok(html.includes('Đang tải dữ liệu'))
    assert.ok(!html.includes('Chưa có vị trí tuyển dụng mới'))
    html = render(resource({ items: [], total: 0 }, { error: 'Jobs API failed' }), resource([]))
    assert.ok(html.includes('Jobs API failed'))
    assert.ok(!html.includes('Chưa có vị trí tuyển dụng mới'))
    html = render(resource({ items: [{ id: 1, title: 'Optional fields', company_name: null }], total: 1 }), resource([]))
    assert.ok(html.includes('Optional fields'))
    assert.ok(html.includes('Thỏa thuận'))
  } finally {
    delete globalThis.__homeLoaders
    delete globalThis.__homeResources
    await server.close()
  }
})
