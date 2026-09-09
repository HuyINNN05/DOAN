import { Search } from 'lucide-react'
import NotificationPanel from './NotificationPanel'

function Topbar({ role }) {
  const labels = { student: 'Tìm kiếm cơ hội thực tập, công ty...', company: 'Tìm kiếm ứng viên, tin tuyển dụng...', lecturer: 'Tìm kiếm sinh viên, báo cáo...', admin: 'Tìm kiếm dữ liệu quản trị...' }
  const names = { student: ['Nguyễn Minh Anh', 'Sinh viên', 'MA'], company: ['FPT Software', 'Doanh nghiệp', 'FP'], lecturer: ['TS. Nguyễn Văn An', 'Giảng viên', 'LK'], admin: ['Nguyễn Thị Hương', 'Quản trị viên', 'NT'] }
  const [name, label, initials] = names[role]
  return <header className="dashboard-topbar"><div className="dashboard-search"><Search size={16} /><input placeholder={labels[role]} /></div><div className="dashboard-topbar-actions"><NotificationPanel /><span className="dashboard-topbar-divider" /><div className="dashboard-user-avatar">{initials}</div><div className="hidden text-left sm:block"><b className="block text-xs text-[#173b83]">{name}</b><small className="text-[10px] text-[#7890ad]">{label}</small></div></div></header>
}

export default Topbar
