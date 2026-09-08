const KEY = 'internconnect_reports'
function read() { try { return JSON.parse(localStorage.getItem(KEY)) || [] } catch { return [] } }
export function getReports() { return read() }
export function submitReport(report) { const next = [...read(), { ...report, id: Date.now(), status: 'Chờ giảng viên duyệt', submittedAt: new Date().toISOString() }]; localStorage.setItem(KEY, JSON.stringify(next)); return next }
export function reviewReport(id, approved, feedback = '') { const next = read().map((report) => report.id === id ? { ...report, status: approved ? 'Đã duyệt' : 'Yêu cầu chỉnh sửa', feedback } : report); localStorage.setItem(KEY, JSON.stringify(next)); return next }
