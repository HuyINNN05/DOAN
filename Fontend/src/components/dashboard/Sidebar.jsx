import { Bell, BriefcaseBusiness, Building2, ChartNoAxesCombined, ClipboardCheck, FileText, GraduationCap, LayoutDashboard, MessageSquareText, UserRound, UsersRound } from 'lucide-react'
import { Link, useLocation } from 'react-router'

const icons = { dashboard: LayoutDashboard, profile: UserRound, opportunities: BriefcaseBusiness, applications: ClipboardCheck, interviews: MessageSquareText, internship: GraduationCap, diary: FileText, reports: ChartNoAxesCombined, jobs: BriefcaseBusiness, companies: Building2, students: UsersRound, assignments: UsersRound, content: FileText, notifications: Bell, users: UsersRound, 'internship-periods': ClipboardCheck, evaluations: ClipboardCheck, interns: GraduationCap }

function Sidebar({ role, links }) {
  const location = useLocation()
  const users = { student: ['MA', 'Nguyễn Minh Anh', 'Sinh viên'], company: ['FP', 'FPT Software', 'Doanh nghiệp'], lecturer: ['LK', 'TS. Nguyễn Văn An', 'Giảng viên'], admin: ['NT', 'Nguyễn Thị Hương', 'Quản trị viên'] }
  const [initials, name, label] = users[role]
  return <aside className="dashboard-sidebar"><Link to="/" className="dashboard-brand"><span className="dashboard-brand-mark">◆</span><span>INTERNCONNECT</span></Link><nav className="dashboard-nav">{links.map(([href, text]) => { const slug = href.split('/').pop(); const Icon = icons[slug] || LayoutDashboard; return <Link className={`dashboard-nav-link ${location.pathname === href ? 'active' : ''}`} to={href} key={href}><Icon size={16} /><span>{text}</span></Link> })}</nav><div className="dashboard-sidebar-footer"><div className="dashboard-avatar">{initials}</div><div><b>{name}</b><small>{label}</small></div></div></aside>
}

export default Sidebar
