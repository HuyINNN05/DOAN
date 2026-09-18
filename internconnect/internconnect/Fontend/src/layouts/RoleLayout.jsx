import { Outlet } from 'react-router'
import Sidebar from '../components/dashboard/Sidebar'
import Topbar from '../components/dashboard/Topbar'
import { useState } from 'react'

function RoleLayout({ role }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const links = {
    student: [['/student/dashboard', 'Dashboard'], ['/student/profile', 'Hồ sơ & CV'], ['/student/opportunities', 'Cơ hội thực tập'], ['/student/applications', 'Ứng tuyển'], ['/student/interviews', 'Lịch phỏng vấn'], ['/student/internship', 'Hồ sơ thực tập'], ['/student/diary', 'Nhật ký thực tập'], ['/student/reports', 'Báo cáo thực tập']],
    company: [['/company/dashboard', 'Dashboard'], ['/company/profile', 'Hồ sơ doanh nghiệp'], ['/company/jobs', 'Tin tuyển dụng'], ['/company/jobs/create', 'Đăng tin tuyển dụng'], ['/company/applications', 'Quản lý ứng viên'], ['/company/interviews', 'Lịch phỏng vấn'], ['/company/interns', 'Sinh viên thực tập'], ['/company/evaluations', 'Đánh giá sinh viên']],
    lecturer: [['/lecturer/dashboard', 'Dashboard'], ['/lecturer/students', 'Sinh viên phụ trách'], ['/lecturer/internships', 'Theo dõi tiến độ'], ['/lecturer/diaries', 'Nhật ký thực tập'], ['/lecturer/reports', 'Báo cáo cần duyệt'], ['/lecturer/evaluations', 'Đánh giá cuối kỳ']],
    admin: [['/admin/dashboard', 'Dashboard'], ['/admin/users', 'Quản lý tài khoản'], ['/admin/companies', 'Phê duyệt doanh nghiệp'], ['/admin/applications', 'Xác nhận ứng tuyển'], ['/admin/internship-periods', 'Quản lý kỳ thực tập'], ['/admin/assignments', 'Phân công giảng viên'], ['/admin/content', 'Quản lý nội dung'], ['/admin/notifications', 'Quản lý thông báo'], ['/admin/reports', 'Báo cáo thống kê'], ['/admin/audit', 'Lịch sử thao tác']],
  }
  return <div className="dashboard-shell">{menuOpen && <button className="dashboard-overlay" aria-label="Đóng menu" onClick={() => setMenuOpen(false)} />}<div className={`dashboard-drawer ${menuOpen ? 'open' : ''}`}><Sidebar role={role} links={links[role]} onNavigate={() => setMenuOpen(false)} /><button className="dashboard-close" aria-label="Đóng menu" onClick={() => setMenuOpen(false)}>✕</button></div><div className="dashboard-main"><Topbar role={role} onMenu={() => setMenuOpen(true)} /><main className="dashboard-content"><Outlet /></main></div></div>
}

export default RoleLayout
