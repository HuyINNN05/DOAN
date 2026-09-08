import defaults from '../data/internshipRecords.json'
import { updateApplication } from './applicationService'

const KEY = 'internconnect_internship_records'
function read() { try { return JSON.parse(localStorage.getItem(KEY)) || defaults } catch { return defaults } }
export function getRecords() { return read() }
export function createRecord(application) { const current = read(); const existing = current.find((record) => record.applicationId === application.id); if (existing) return current; const next = [...current, { id: Date.now(), applicationId: application.id, studentId: application.studentId, internshipId: application.internshipId, company: 'FPT Software', position: 'Frontend Developer Intern', period: 'Học kỳ 1 - 2026/2027', status: 'Chờ nhà trường xác nhận', lecturer: null, createdAt: new Date().toISOString() }]; localStorage.setItem(KEY, JSON.stringify(next)); updateApplication(application.id, { status: '12', statusLabel: 'Nhà trường xác nhận kỳ/nơi thực tập' }); return next }
export function confirmRecord(id) { const next = read().map((record) => record.id === id ? { ...record, status: 'Đang thực tập', lecturer: 'ThS. Lê Trung Kiên' } : record); localStorage.setItem(KEY, JSON.stringify(next)); const record = next.find((item) => item.id === id); if (record) updateApplication(record.applicationId, { status: '13', statusLabel: 'Đang thực tập' }); return next }
