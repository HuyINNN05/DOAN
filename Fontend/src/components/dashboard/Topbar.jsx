import { Search } from 'lucide-react'
import NotificationPanel from './NotificationPanel'

function Topbar({ role }) {
  const labels = { student: 'Tìm kiếm cơ hội thực tập, công ty...', company: 'Tìm kiếm ứng viên, tin tuyển dụng...', lecturer: 'Tìm kiếm sinh viên, báo cáo...', admin: 'Tìm kiếm dữ liệu quản trị...' }
  return <header className="dashboard-topbar"><div className="dashboard-search"><Search size={16} /><input placeholder={labels[role]} /></div><div className="dashboard-topbar-actions"><NotificationPanel /><span className="dashboard-topbar-divider" /><div className="dashboard-user-avatar">{role === 'student' ? 'MA' : role === 'company' ? 'FP' : role === 'lecturer' ? 'LK' : 'NT'}</div><div className="hidden text-left sm:block"><b className="block text-xs text-[#173b83]">{role === 'student' ? 'Nguyễn Minh Anh' : role === 'company' ? 'FPT Software' : role === 'lecturer' ? 'TS. Nguyễn Văn An' : 'Nguyễn Thị Hương'}</b><small className="text-[10px] text-[#7890ad]">{role === 'student' ? 'Sinh viên' : role === 'company' ? 'Doanh nghiệp' : role === 'lecturer' ? 'Giảng viên' : 'Quản trị viên'}</small></div></div></header>
}

export default Topbar
