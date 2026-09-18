import defaultApplications from '../data/applications.json'
import { canTransition, STATUS_ROLES } from '../constants/internshipStatuses'
import internships from '../data/internships.json'
import { getJobs } from './companyService'
import { getSession } from './mockAuth'
import { addAuditLog } from './auditService'

const KEY = 'internconnect_applications'
function read() { try { return JSON.parse(localStorage.getItem(KEY)) || defaultApplications } catch { return defaultApplications } }
export function getAllApplications() { return read() }
export function getApplicationCompanyId(application) {
  const job = getJobs().find((item) => item.id === application.internshipId)
  return job?.companyId ?? internships.find((item) => item.id === application.internshipId)?.companyId ?? null
}
function ownsApplication(actor, application) {
  if (actor.role === 'admin') return true
  if (actor.role === 'student') return application.studentId === actor.id
  if (actor.role === 'company') return getApplicationCompanyId(application) === actor.id
  return false
}
export function updateApplication(id, patch, context = {}) {
  const current = read(); const target = current.find((item) => item.id === id)
  if (!target) return { ok: false, error: 'Không tìm thấy hồ sơ', applications: current }
  if (patch.status && !canTransition(target.status, patch.status)) return { ok: false, error: 'Chuyển trạng thái không hợp lệ', applications: current }
  const session = getSession(); const actor = context.actor || session
  if (!actor || !ownsApplication(actor, target)) return { ok: false, error: 'Bạn không có quyền xử lý hồ sơ này', applications: current }
  if (patch.status && STATUS_ROLES[patch.status] !== actor.role) return { ok: false, error: 'Vai trò không được chuyển sang trạng thái này', applications: current }
  if (target.closureReason) return { ok: false, error: 'Hồ sơ đã đóng', applications: current }
  const event = patch.status ? { fromStatus: target.status, toStatus: patch.status, actorId: actor?.id || null, actorRole: actor?.role || 'system', action: context.action || 'Cập nhật trạng thái', note: context.note || '', createdAt: new Date().toISOString() } : null
  const next = current.map((item) => item.id !== id ? item : { ...item, ...patch, statusHistory: event ? [...(item.statusHistory || []), event] : item.statusHistory || [] })
  localStorage.setItem(KEY, JSON.stringify(next)); if (event) addAuditLog({ actorId: event.actorId, actorRole: event.actorRole, action: event.action, entity: `application:${id}`, from: event.fromStatus, to: event.toStatus, note: event.note }); return { ok: true, applications: next }
}
