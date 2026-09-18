import defaultCompany from '../data/company.json'
import defaultJobs from '../data/companyJobs.json'
import { getSession } from './mockAuth'
const COMPANY_KEY = 'internconnect_company'; const JOBS_KEY = 'internconnect_company_jobs'; const REG_KEY = 'internconnect_company_registrations'
function read(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) || fallback } catch { return fallback } }
export function getCompany() { const session = getSession(); if (!session || session.id === defaultCompany.id) return read(COMPANY_KEY, { ...defaultCompany, status: 'Đã duyệt' }); return read(`internconnect_company_${session.id}`, { ...getRegistrations().find((item) => item.id === session.id), status: 'Đã duyệt' }) }
export function saveCompany(value) { const session = getSession(); localStorage.setItem(session?.id === defaultCompany.id ? COMPANY_KEY : `internconnect_company_${session?.id}`, JSON.stringify(value)); return value }
export function getJobs() { return read(JOBS_KEY, defaultJobs) }
export function saveJobs(value) { localStorage.setItem(JOBS_KEY, JSON.stringify(value)); return value }
export function getRegistrations() { return read(REG_KEY, []) }
export function registerCompany(input) {
  if (!input.name?.trim() || !input.taxCode?.trim() || !input.email?.trim()) return { ok: false, error: 'Thiếu thông tin đăng ký' }
  if (getRegistrations().some((item) => item.taxCode === input.taxCode || item.email === input.email)) return { ok: false, error: 'Mã số thuế hoặc email đã được đăng ký' }
  const registration = { ...input, id: Date.now(), status: 'Chờ duyệt', reason: '', createdAt: new Date().toISOString() }
  localStorage.setItem(REG_KEY, JSON.stringify([...getRegistrations(), registration]))
  return { ok: true, registration }
}
export function reviewCompany(id, decision, reason = '') {
  if (getSession()?.role !== 'admin') return { ok: false, error: 'Chỉ nhà trường được duyệt doanh nghiệp' }
  if (!['Đã duyệt', 'Từ chối', 'Yêu cầu bổ sung'].includes(decision) || decision !== 'Đã duyệt' && !reason.trim()) return { ok: false, error: 'Cần nhập lý do' }
  const registration = getRegistrations().find((item) => item.id === id)
  if (!registration) return { ok: false, error: 'Không tìm thấy hồ sơ' }
  localStorage.setItem(REG_KEY, JSON.stringify(getRegistrations().map((item) => item.id === id ? { ...item, status: decision, reason } : item)))
  if (decision === 'Đã duyệt') {
    const key = 'internconnect_users'; const users = read(key, []); const account = users.find((item) => item.email === registration.email)
    if (!account) localStorage.setItem(key, JSON.stringify([...users, { id: registration.id, email: registration.email, password: registration.password, name: registration.name, role: 'company', active: true }]))
  }
  return { ok: true, registrations: getRegistrations() }
}
