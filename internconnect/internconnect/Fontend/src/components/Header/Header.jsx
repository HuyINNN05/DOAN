import { GraduationCap, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router'
import { getSession } from '../../services/sessionService'
const navigation = [['/', 'Trang chủ'], ['/opportunities', 'Cơ hội thực tập'], ['/companies', 'Doanh nghiệp'], ['/information', 'Thông tin'], ['/guide', 'Hướng dẫn'], ['/contact', 'Liên hệ']]
export default function Header() {
  const [open, setOpen] = useState(false)
  const session = getSession()
  const destination = session ? `/${session.role}/dashboard` : '/login'
  return <header className="public-header"><div className="header-inner"><Link className="brand" to="/" aria-label="InternConnect — Trang chủ"><span className="brand-mark"><GraduationCap size={22} /></span>InternConnect</Link><nav className="header-nav" aria-label="Điều hướng chính">{navigation.map(([to, label]) => <NavLink end={to === '/'} className={({ isActive }) => isActive ? 'active' : ''} to={to} key={to}>{label}</NavLink>)}</nav><div className="header-actions"><Link className="button button-primary" to={destination}>{session ? 'Không gian làm việc' : 'Đăng nhập'}</Link></div><button className="icon-button header-mobile-button" aria-label={open ? 'Đóng menu' : 'Mở menu'} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}>{open ? <X size={22} /> : <Menu size={22} />}</button></div>{open && <nav className="mobile-navigation" id="mobile-navigation" aria-label="Điều hướng di động">{navigation.map(([to, label]) => <NavLink end={to === '/'} to={to} onClick={() => setOpen(false)} key={to}>{label}</NavLink>)}</nav>}</header>
}
