import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { LogOut, ShieldCheck, ArrowRight, UserRound } from 'lucide-react'
import { PublicLayout, PageHero } from '../components/ui/PageUI'
import { getSession, logout } from '../services/sessionService'
import { roleLabels, initials } from '../utils/display'
export default function AccountPage() {
  const session = getSession(), navigate = useNavigate()
  const [error,setError] = useState(''), [busy,setBusy] = useState(false)
  async function signOut() { setBusy(true); try { await logout(); navigate('/login',{replace:true}) } catch { navigate('/login',{replace:true}) } finally { setBusy(false) } }
  return <PublicLayout><PageHero eyebrow="TÀI KHOẢN CỦA BẠN" title="Thông tin tài khoản" description="Kiểm tra thông tin đăng nhập và truy cập không gian làm việc của bạn." /><div className="site-container section-space account-layout"><article className="surface account-summary"><span className="account-avatar">{initials(session?.name)}</span><h2>{session?.name}</h2><span className="tag mt-3">{roleLabels[session?.role]}</span><p className="muted text-sm mt-4">{session?.email}</p><Link className="button button-primary mt-6" to={`/${session?.role}/dashboard`}>Không gian làm việc <ArrowRight size={16} /></Link></article><section className="surface account-details"><div className="flex gap-3 items-center"><UserRound size={22} /><h2>Thông tin đăng nhập</h2></div><dl><div><dt>Họ và tên</dt><dd>{session?.name}</dd></div><div><dt>Email</dt><dd>{session?.email}</dd></div><div><dt>Vai trò</dt><dd>{roleLabels[session?.role]}</dd></div></dl><div className="account-security"><ShieldCheck size={22} /><p>Không chia sẻ mật khẩu. Đăng xuất sau khi sử dụng máy tính dùng chung.</p></div>{error && <p role="alert">{error}</p>}<button className="button button-secondary mt-6" disabled={busy} onClick={() => { setError(''); signOut() }}><LogOut size={17} />{busy ? 'Đang đăng xuất…' : 'Đăng xuất'}</button></section></div></PublicLayout>
}
