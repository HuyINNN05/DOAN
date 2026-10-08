import { useState } from 'react'
import { useNavigate } from 'react-router'
import Header from '../components/Header/Header'
import Footer from '../components/Footer/Footer'
import { getSession, logout } from '../services/sessionService'

export default function AccountPage() {
  const session = getSession()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function signOut() {
    setBusy(true)
    try { await logout(); navigate('/', { replace: true }) }
    catch { setError('Không thể đăng xuất. Vui lòng thử lại.') }
    finally { setBusy(false) }
  }
  return <div className="public-page min-h-screen bg-[#f4f8fd]"><Header/><main className="mx-auto max-w-3xl px-5 py-10"><h1 className="mb-6 text-3xl font-extrabold text-[#123a8b]">Tài khoản</h1><div className="space-y-3 rounded-xl border bg-white p-6 text-sm"><p><b>Họ tên:</b> {session?.name}</p><p><b>Email:</b> {session?.email}</p><p><b>Vai trò:</b> {session?.role}</p>{error&&<p role="alert" className="text-red-700">{error}</p>}<button disabled={busy} className="rounded-md bg-[#0757c9] px-5 py-3 font-bold text-white disabled:opacity-60" onClick={signOut}>{busy?'Đang đăng xuất…':'Đăng xuất'}</button></div></main><Footer/></div>
}
