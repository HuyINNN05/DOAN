import { Outlet } from 'react-router'
import Sidebar from '../components/dashboard/Sidebar'
import Topbar from '../components/dashboard/Topbar'

function RoleLayout({ role }) {
  const links = {
    student: [['/student/dashboard', 'Dashboard'], ['/student/profile', 'Hồ sơ & CV'], ['/student/opportunities', 'Cơ hội thực tập'], ['/student/applications', 'Ứng tuyển'], ['/student/internship', 'Hồ sơ thực tập'], ['/student/reports', 'Báo cáo']],
    company: [['/company/dashboard', 'Dashboard'], ['/company/profile', 'Hồ sơ doanh nghiệp'], ['/company/jobs', 'Tin tuyển dụng'], ['/company/applications', 'Ứng viên'], ['/company/interviews', 'Phỏng vấn'], ['/company/evaluations', 'Đánh giá']],
    lecturer: [['/lecturer/dashboard', 'Dashboard'], ['/lecturer/students', 'Sinh viên phụ trách'], ['/lecturer/internships', 'Tiến độ thực tập'], ['/lecturer/diaries', 'Nhật ký'], ['/lecturer/reports', 'Báo cáo'], ['/lecturer/evaluations', 'Đánh giá']],
    admin: [['/admin/dashboard', 'Dashboard'], ['/admin/users', 'Tài khoản'], ['/admin/companies', 'Doanh nghiệp'], ['/admin/internship-periods', 'Kỳ thực tập'], ['/admin/assignments', 'Phân công GV'], ['/admin/content', 'Nội dung'], ['/admin/reports', 'Báo cáo'], ['/admin/audit', 'Lịch sử thao tác']],
  }
  return <div className="dashboard-shell"><Sidebar role={role} links={links[role]} /><div className="dashboard-main"><Topbar role={role} /><main className="dashboard-content"><Outlet /></main></div></div>
}

export default RoleLayout
