import { STATUS_LABELS } from '../../constants/internshipStatuses'

function StatusBadge({ status, label }) {
  const tone = status === '15' ? 'success' : ['08', '09'].includes(status) ? 'warning' : status === '01' ? 'muted' : 'info'
  return <span className={`status-badge ${tone}`}>{label || STATUS_LABELS[status] || status}</span>
}

export default StatusBadge
