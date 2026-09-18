import defaults from '../data/interviews.json'
import { getAllApplications, getApplicationCompanyId, updateApplication } from './applicationService'
import { getSession } from './mockAuth'

const KEY = 'internconnect_interviews'
const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || defaults } catch { return defaults } }
const result = (ok, error = '') => ({ ok, error, interviews: read(), applications: getAllApplications() })
export function getInterviews() { return read() }
export function createInterview(input) {
  const actor = getSession()
  const app = getAllApplications().find((item) => item.id === Number(input.applicationId))
  if (!actor || actor.role !== 'company' || !app || getApplicationCompanyId(app) !== actor.id || app.status !== '05') return result(false, 'Không thể mời phỏng vấn hồ sơ này')
  if (!input.date || !input.time || !input.location?.trim()) return result(false, 'Vui lòng nhập đầy đủ lịch phỏng vấn')
  if (read().some((item) => item.applicationId === app.id && !['Đã hủy', 'Đã hoàn thành', 'Đã từ chối'].includes(item.status))) return result(false, 'Hồ sơ đã có lịch phỏng vấn đang hoạt động')
  const changed = updateApplication(app.id, { status: '06' }, { action: 'Mời phỏng vấn' })
  if (!changed.ok) return result(false, changed.error)
  localStorage.setItem(KEY, JSON.stringify([...read(), { ...input, id: Date.now(), applicationId: app.id, companyId: actor.id, studentId: app.studentId, status: 'Chờ sinh viên xác nhận' }]))
  return result(true)
}
export function respondInterview(id, accepted, reason = '') {
  const actor = getSession(); const interview = read().find((item) => item.id === id)
  if (!actor || actor.role !== 'student' || interview?.studentId !== actor.id || interview.status !== 'Chờ sinh viên xác nhận') return result(false, 'Không thể xử lý lịch này')
  if (!accepted && !reason.trim()) return result(false, 'Vui lòng nhập lý do từ chối')
  const changed = accepted ? updateApplication(interview.applicationId, { status: '07' }, { action: 'Xác nhận lịch phỏng vấn' }) : updateApplication(interview.applicationId, { closureReason: reason.trim() }, { action: 'Từ chối lịch', note: reason.trim() })
  if (!changed.ok) return result(false, changed.error)
  localStorage.setItem(KEY, JSON.stringify(read().map((item) => item.id === id ? { ...item, status: accepted ? 'Đã xác nhận' : 'Đã từ chối', reason } : item)))
  return result(true)
}
export function recordInterviewResult(id, passed, note = '') {
  const actor = getSession(); const interview = read().find((item) => item.id === id)
  if (!actor || actor.role !== 'company' || interview?.companyId !== actor.id || interview.status !== 'Đã xác nhận') return result(false, 'Không thể ghi kết quả lịch này')
  const first = updateApplication(interview.applicationId, { status: '08' }, { action: 'Hoàn thành phỏng vấn', note })
  if (!first.ok) return result(false, first.error)
  const second = passed ? updateApplication(interview.applicationId, { status: '09', recruitmentResult: 'passed' }, { action: 'Ghi kết quả đạt', note }) : updateApplication(interview.applicationId, { recruitmentResult: 'failed', closureReason: note.trim() || 'Không đạt phỏng vấn' }, { action: 'Ghi kết quả không đạt', note })
  if (!second.ok) return result(false, second.error)
  if (passed) updateApplication(interview.applicationId, { status: '10' }, { action: 'Gửi đề nghị thực tập' })
  localStorage.setItem(KEY, JSON.stringify(read().map((item) => item.id === id ? { ...item, status: 'Đã hoàn thành', passed, result: note } : item)))
  return result(true)
}
export function confirmOffer(applicationId, accepted, reason = '') {
  const actor = getSession(); const app = getAllApplications().find((item) => item.id === applicationId)
  if (!actor || actor.role !== 'student' || app?.studentId !== actor.id || app.status !== '10' || app.recruitmentResult !== 'passed' || app.closureReason) return { ok: false, error: 'Không thể xác nhận đề nghị này', applications: getAllApplications() }
  if (!accepted && !reason.trim()) return { ok: false, error: 'Vui lòng nhập lý do từ chối', applications: getAllApplications() }
  return accepted ? updateApplication(applicationId, { status: '11', offerDecision: 'accepted' }, { action: 'Nhận thực tập' }) : updateApplication(applicationId, { offerDecision: 'declined', closureReason: reason.trim() }, { action: 'Từ chối đề nghị', note: reason.trim() })
}
