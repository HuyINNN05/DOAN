import { getSession } from './mockAuth'
import { getRecords } from './internshipRecordService'
import { getAllApplications } from './applicationService'
const KEY = 'internconnect_reports'
const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || [] } catch { return [] } }
const result = (ok, error = '') => ({ ok, error, reports: read() })
export function getReports() { return read() }
export function submitReport(input) {
  const actor = getSession(); const record = getRecords().find((item) => item.studentId === actor?.id && item.applicationId === input.applicationId); const app = getAllApplications().find((item) => item.id === input.applicationId)
  if (actor?.role !== 'student' || !record || app?.status !== '13') return result(false, 'Chỉ nộp báo cáo khi đang thực tập')
  if (!input.name?.trim()) return result(false, 'Vui lòng chọn tên báo cáo')
  const version = read().filter((item) => item.applicationId === app.id).length + 1
  localStorage.setItem(KEY, JSON.stringify([...read(), { ...input, id: Date.now(), studentId: actor.id, version, status: 'Chờ giảng viên duyệt', submittedAt: new Date().toISOString() }]))
  return result(true)
}
export function reviewReport(id, approved, feedback = '') {
  const actor = getSession(); const report = read().find((item) => item.id === id); const record = getRecords().find((item) => item.applicationId === report?.applicationId)
  if (actor?.role !== 'lecturer' || record?.lecturerId !== actor.id || report?.status !== 'Chờ giảng viên duyệt') return result(false, 'Không thể duyệt báo cáo này')
  if (!approved && !feedback.trim()) return result(false, 'Vui lòng nhập nội dung cần sửa')
  localStorage.setItem(KEY, JSON.stringify(read().map((item) => item.id === id ? { ...item, status: approved ? 'Đã duyệt' : 'Yêu cầu chỉnh sửa', feedback } : item)))
  return result(true)
}
