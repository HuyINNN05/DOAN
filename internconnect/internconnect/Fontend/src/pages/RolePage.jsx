import { Link } from 'react-router'

function RolePage({ title, description, actions = [] }) {
  return <section><div className="dashboard-page-heading"><div><p className="dashboard-eyebrow">INTERNCONNECT</p><h1>{title}</h1><p>{description}</p></div><span className="dashboard-chip">Dữ liệu hệ thống</span></div><div className="dashboard-panels">{actions.map((action) => <Link to={action.href} className="dashboard-panel hover:border-[#82b3ec]" key={action.href}><h2 className="font-bold text-ink">{action.label}</h2><p className="mt-2 text-sm text-muted">Chức năng nghiệp vụ và dữ liệu hệ thống được hiển thị tại đây.</p><span className="mt-5 inline-block text-xs font-bold text-primary">Mở chức năng →</span></Link>)}</div></section>
}

export default RolePage
