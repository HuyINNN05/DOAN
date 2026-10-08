import { defaultInternshipRecords as defaults, internships } from './dataSource'
import { getJobs } from './companyService'
import { getAllApplications, updateApplication } from './applicationService'
import { getSession } from './mockAuth'

const KEY = 'internconnect_internship_records'
const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || defaults } catch { return defaults } }
const result = (ok, error = '') => ({ ok, error, records: read() })
export function getRecords() { return read() }
export function createRecord(application) {
  const actor = getSession(); const app = getAllApplications().find((item) => item.id === application?.id)
  if (!actor || actor.role !== 'student' || app?.studentId !== actor.id || app.status !== '11' || app.offerDecision !== 'accepted') return result(false, 'Chỉ tạo hồ sơ sau khi nhận đề nghị thực tập')
  if (read().some((item) => item.applicationId === app.id)) return result(false, 'Hồ sơ thực tập đã tồn tại')
  const job = [...internships.map((item) => ({ ...item, title: item.position })), ...getJobs()].find((item) => item.id === app.internshipId)
  const next = [...read(), { id: Date.now(), applicationId: app.id, studentId: app.studentId, internshipId: app.internshipId, companyId: job?.companyId, company: job?.company || 'Doanh nghiệp', position: job?.title || 'Vị trí thực tập', period: '', status: 'Chờ nhà trường xác nhận', lecturerId: null, lecturer: null, createdAt: new Date().toISOString() }]
  localStorage.setItem(KEY, JSON.stringify(next)); return result(true)
}
export function confirmRecord(id, { lecturerId, period } = {}) {
  const actor = getSession(); const record = read().find((item) => item.id === id)
  if (!actor || actor.role !== 'admin' || !record || !lecturerId || !period?.trim() || record.status !== 'Chờ nhà trường xác nhận') return result(false, 'Cần chọn kỳ và giảng viên cho hồ sơ chờ xác nhận')
  const changed = updateApplication(record.applicationId, { status: '12' }, { action: 'Xác nhận nơi thực tập và phân công' })
  if (!changed.ok) return result(false, changed.error)
  localStorage.setItem(KEY, JSON.stringify(read().map((item) => item.id === id ? { ...item, lecturerId: Number(lecturerId), period: period.trim(), status: 'Đã xác nhận' } : item)))
  return result(true)
}
export function startInternship(id) {
  const actor = getSession(); const record = read().find((item) => item.id === id)
  if (!actor || actor.role !== 'admin' || record?.status !== 'Đã xác nhận') return result(false, 'Hồ sơ chưa được xác nhận')
  const changed = updateApplication(record.applicationId, { status: '13' }, { action: 'Bắt đầu thực tập' })
  if (!changed.ok) return result(false, changed.error)
  localStorage.setItem(KEY, JSON.stringify(read().map((item) => item.id === id ? { ...item, status: 'Đang thực tập' } : item)))
  return result(true)
}
export function completeInternship(id) {
  const actor = getSession(); const record = read().find((item) => item.id === id); const app = getAllApplications().find((item) => item.id === record?.applicationId)
  if (actor?.role !== 'admin' || !record || app?.status !== '14') return result(false, 'Hồ sơ chưa đủ đánh giá để hoàn thành')
  const changed = updateApplication(app.id, { status: '15' }, { action: 'Ký xác nhận hoàn thành' })
  if (!changed.ok) return result(false, changed.error)
  localStorage.setItem(KEY, JSON.stringify(read().map((item) => item.id === id ? { ...item, status: 'Hoàn thành' } : item)))
  return result(true)
}
