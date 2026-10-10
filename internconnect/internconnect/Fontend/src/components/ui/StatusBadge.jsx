import { STATUS_LABELS } from '../../constants/internshipStatuses'

function StatusBadge({ status, label }) {
  const labels = { active: 'Đang hoạt động', pending: 'Chờ xác nhận', approved: 'Đã duyệt', rejected: 'Đã từ chối', inactive: 'Ngừng hoạt động', locked: 'Đã khóa', draft: 'Bản nháp', published: 'Đã xuất bản', closed: 'Đã đóng', archived: 'Đã lưu trữ', submitted: 'Chờ duyệt', revision_required: 'Cần chỉnh sửa', reviewed: 'Đã nhận xét', completed: 'Đã hoàn thành', evaluating: 'Đang đánh giá', scheduled: 'Đã lên lịch', confirmed: 'Đã xác nhận', cancelled: 'Đã hủy', open: 'Đang mở', accepted: 'Đã chấp nhận', declined: 'Đã từ chối', passed: 'Đạt', failed: 'Không đạt' }
  const tone = ['15', 'active', 'approved', 'completed', 'published', 'accepted', 'passed'].includes(status) ? 'success' : ['rejected', 'locked', 'failed', 'declined'].includes(status) ? 'danger' : ['08', '09', 'pending', 'submitted', 'revision_required', 'evaluating'].includes(status) ? 'warning' : ['01', 'draft', 'closed', 'inactive', 'archived', 'cancelled'].includes(status) ? 'muted' : 'info'
  return <span className={`status-badge ${tone}`}>{label || STATUS_LABELS[status] || labels[status] || status}</span>
}

export default StatusBadge
