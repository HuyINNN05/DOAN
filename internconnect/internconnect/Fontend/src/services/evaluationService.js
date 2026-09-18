import { getSession } from './mockAuth'
import { getRecords } from './internshipRecordService'
import { getAllApplications, updateApplication } from './applicationService'

const KEY = 'internconnect_evaluations'
const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || [] } catch { return [] } }
const result = (ok, error = '') => ({ ok, error, evaluations: read() })
export function getEvaluations() { return read() }
export function saveEvaluation(input) {
  const actor = getSession(); const record = getRecords().find((item) => item.applicationId === input.applicationId)
  const app = getAllApplications().find((item) => item.id === input.applicationId)
  const score = Number(input.score)
  if (!actor || actor.role !== input.evaluatorRole || !['company', 'lecturer'].includes(actor.role) || !record || !app || app.status !== '13' || record.studentId !== input.studentId) return result(false, 'Không thể đánh giá hồ sơ này')
  if (actor.role === 'company' && record.companyId !== actor.id || actor.role === 'lecturer' && record.lecturerId !== actor.id) return result(false, 'Hồ sơ không thuộc phạm vi của bạn')
  if (read().some((item) => item.applicationId === input.applicationId && item.evaluatorRole === actor.role)) return result(false, 'Đánh giá đã khóa sau khi gửi')
  if (input.score === '' || !Number.isFinite(score) || score < 0 || score > 10) return result(false, 'Điểm phải trong khoảng 0–10')
  const next = [...read(), { ...input, score, evaluatorId: actor.id, id: Date.now(), status: 'Đã gửi', submittedAt: new Date().toISOString() }]
  localStorage.setItem(KEY, JSON.stringify(next))
  if (next.some((item) => item.applicationId === app.id && item.evaluatorRole === 'company') && next.some((item) => item.applicationId === app.id && item.evaluatorRole === 'lecturer')) updateApplication(app.id, { status: '14' }, { actor: { id: record.lecturerId, role: 'lecturer' }, action: 'Đủ đánh giá cuối kỳ' })
  return result(true)
}
