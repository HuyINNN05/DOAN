import { Bell, BriefcaseBusiness, Building2, ChartNoAxesCombined, ClipboardCheck, FileText, GraduationCap, LayoutDashboard, MessageSquareText, UserRound, UsersRound } from 'lucide-react'
import { Link, useLocation } from 'react-router'

const icons = { dashboard: LayoutDashboard, profile: UserRound, opportunities: BriefcaseBusiness, applications: ClipboardCheck, interviews: MessageSquareText, internship: GraduationCap, diary: FileText, reports: ChartNoAxesCombined, jobs: BriefcaseBusiness, companies: Building2, students: UsersRound, assignments: UsersRound, content: FileText, notifications: Bell, users: UsersRound, 'internship-periods': ClipboardCheck, evaluations: ClipboardCheck, interns: GraduationCap }

function Sidebar({ role, links }) {
  const location = useLocation()
  return <aside className="dashboard-sidebar"><Link to="/" className="dashboard-brand"><span className="dashboard-brand-mark">◆</span><span>INTERNCONNECT</span></Link><nav className="dashboard-nav">{links.map(([href, label]) => { const slug = href.split('/').pop(); const Icon = icons[slug] || LayoutDashboard; const active = location.pathname === href; return <Link className={`dashboard-nav-link ${active ? 'active' : ''}`} to={href} key={href}><Icon size={16} /><span>{label}</span></Link> })}</nav><div className="dashboard-sidebar-footer"><div className="dashboard-avatar">{role === 'student' ? 'MA' : role === 'company' ? 'FP' : role === 'lecturer' ? 'LK' : 'NT'}</div><div><b>{role === 'student' ? 'Nguyễn Minh Anh' : role === 'company' ? 'FPT Software' : role === 'lecturer' ? 'Lê Trung Kiên' : 'Nhà trường'}</b><small>{role === 'student' ? 'Sinh viên' : role === 'company' ? 'Doanh nghiệp' : role === 'lecturer' ? 'Giảng viên' : 'Quản trị viên'}</small></div></div></aside>
}

export default Sidebar
