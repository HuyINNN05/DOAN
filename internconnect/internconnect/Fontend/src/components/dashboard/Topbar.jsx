import { ChevronRight, Menu, ExternalLink } from 'lucide-react'
import { Link } from 'react-router'
import NotificationPanel from './NotificationPanel'
import { getSession } from '../../services/sessionService'
import { initials, roleLabels } from '../../utils/display'
export default function Topbar({ role, onMenu }) {
  const session = getSession(), name = session?.name || session?.full_name || 'Tài khoản'
  return <header className="dashboard-topbar"><button className="dashboard-menu-button icon-button" aria-label="Mở menu" onClick={onMenu}><Menu size={22} /></button><div className="dashboard-breadcrumb">Không gian làm việc<ChevronRight size={14} /><span>{roleLabels[role]}</span></div><div className="dashboard-topbar-actions"><Link className="icon-button" to="/" aria-label="Về trang chủ"><ExternalLink size={18} /></Link><NotificationPanel /><span className="dashboard-topbar-divider" /><Link className="flex items-center gap-3" to="/account"><span className="dashboard-user-avatar">{initials(name)}</span><span className="hidden text-left sm:block"><b className="block">{name}</b><small className="text-xs text-muted">{roleLabels[role]}</small></span></Link></div></header>
}
