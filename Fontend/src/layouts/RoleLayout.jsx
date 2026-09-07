import { Link, Outlet, useNavigate } from 'react-router'
import { getSession, logout } from '../services/mockAuth'

function RoleLayout({ role, title }) {
  const session = getSession()
  const navigate = useNavigate()
  const links = {
    student: [['/student/dashboard', 'Dashboard'], ['/student/profile', 'Hồ sơ & CV'], ['/student/opportunities', 'Cơ hội thực tập'], ['/student/applications', 'Ứng tuyển'], ['/student/internship', 'Hồ sơ thực tập'], ['/student/reports', 'Báo cáo']],
    company: [['/company/dashboard', 'Dashboard'], ['/company/profile', 'Hồ sơ doanh nghiệp'], ['/company/jobs', 'Tin tuyển dụng'], ['/company/applications', 'Ứng viên'], ['/company/interviews', 'Phỏng vấn'], ['/company/evaluations', 'Đánh giá']],
    lecturer: [['/lecturer/dashboard', 'Dashboard'], ['/lecturer/students', 'Sinh viên phụ trách'], ['/lecturer/internships', 'Tiến độ thực tập'], ['/lecturer/diaries', 'Nhật ký'], ['/lecturer/reports', 'Báo cáo'], ['/lecturer/evaluations', 'Đánh giá']],
    admin: [['/admin/dashboard', 'Dashboard'], ['/admin/users', 'Tài khoản'], ['/admin/companies', 'Doanh nghiệp'], ['/admin/internship-periods', 'Kỳ thực tập'], ['/admin/assignments', 'Phân công GV'], ['/admin/content', 'Nội dung'], ['/admin/reports', 'Báo cáo']],
  }
  return <div className="min-h-screen bg-[#f7faff]"><header className="border-b border-[#e1eaf5] bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4"><Link to="/" className="text-lg font-extrabold text-[#0757c9]">INTERNCONNECT</Link><div className="flex items-center gap-4 text-sm"><span className="hidden text-[#526b8d] sm:inline">{session?.name}</span><button type="button" onClick={() => { logout(); navigate('/') }} className="font-semibold text-[#0757c9]">Đăng xuất</button></div></div></header><div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-7 lg:flex-row"><aside className="w-full shrink-0 rounded-xl border border-[#e1eaf5] bg-white p-3 lg:w-60"><p className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#7890ad]">{title}</p><nav className="grid gap-1">{links[role].map(([href, label]) => <Link className="rounded-md px-3 py-2.5 text-sm font-semibold text-[#526b8d] hover:bg-[#edf4ff] hover:text-[#0757c9]" to={href} key={href}>{label}</Link>)}</nav></aside><main className="min-w-0 flex-1"><Outlet /></main></div></div>
}

export default RoleLayout
