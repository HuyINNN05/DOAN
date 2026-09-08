import defaultApplications from '../data/applications.json'
import { canTransition } from '../constants/internshipStatuses'
import { addAuditLog } from './auditService'
const KEY = 'internconnect_applications'
function read() { try { return JSON.parse(localStorage.getItem(KEY)) || defaultApplications } catch { return defaultApplications } }
export function getAllApplications() { return read() }
export function updateApplication(id, patch) { const current = read(); const target = current.find((item) => item.id === id); if (!target) return current; if (patch.status && !canTransition(target.status, patch.status)) return current; const next = current.map((item) => { if (item.id !== id) return item; const history = patch.status ? [...new Set([...(item.statusHistory || []), patch.status])] : item.statusHistory || []; return { ...item, ...patch, statusHistory: history } }); localStorage.setItem(KEY, JSON.stringify(next)); if (patch.status) addAuditLog({ actor: 'mock-user', action: 'Cập nhật trạng thái hồ sơ', entity: `application:${id}`, from: target.status, to: patch.status }); return next }
