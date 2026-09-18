import { Link } from 'react-router'

function RolePage({ title, description, actions = [] }) {
  return <section><div className="dashboard-page-heading"><div><p className="dashboard-eyebrow">INTERNCONNECT</p><h1>{title}</h1><p>{description}</p></div><span className="dashboard-chip">Mock data</span></div><div className="dashboard-panels">{actions.map((action) => <Link to={action.href} className="dashboard-panel hover:border-[#82b3ec]" key={action.href}><h2 className="font-bold text-[#173b83]">{action.label}</h2><p className="mt-2 text-sm text-[#7890ad]">Dữ liệu mock và thao tác nghiệp vụ sẽ hiển thị tại đây.</p><span className="mt-5 inline-block text-xs font-bold text-[#0757c9]">Mở chức năng →</span></Link>)}</div></section>
}

export default RolePage
