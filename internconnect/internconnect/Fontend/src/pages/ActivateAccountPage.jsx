import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { api } from '../api/client'
export default function ActivateAccountPage() {
  const [token] = useState(() => new URLSearchParams(window.location.hash.slice(1)).get('token') || '')
  useEffect(() => { window.history.replaceState(null, '', window.location.pathname) }, [])
  const [message, setMessage] = useState(''), [busy, setBusy] = useState(false), [done, setDone] = useState(false)
  async function submit(event) {
    event.preventDefault()
    const form = event.currentTarget
    if (form.password.value !== form.confirm.value) { setMessage('Xác nhận mật khẩu không khớp.'); return }
    setBusy(true)
    try { await api.post('/auth/activate-account', { token, password: form.password.value }); setDone(true); setMessage('Đã thiết lập mật khẩu và kích hoạt tài khoản. Bạn có thể đăng nhập.') }
    catch (error) { setMessage(error.response?.data?.error?.message || 'Không thể kích hoạt tài khoản.') }
    finally { setBusy(false) }
  }
  return <main className="mx-auto max-w-lg p-6"><h1 className="text-2xl font-bold mb-5">Thiết lập mật khẩu tài khoản</h1>
    {!token && <p role="alert">Thiếu liên kết kích hoạt. Liên hệ nhà trường để gửi lại email.</p>}
    {token && !done && <form onSubmit={submit} className="space-y-4 rounded-xl border bg-white p-5"><label className="block">Mật khẩu mới<input className="block w-full border rounded p-2 mt-2" type="password" name="password" autoComplete="new-password" minLength={8} maxLength={72} required disabled={busy}/></label><label className="block">Xác nhận mật khẩu<input className="block w-full border rounded p-2 mt-2" type="password" name="confirm" autoComplete="new-password" minLength={8} maxLength={72} required disabled={busy}/></label><button className="button button-primary" disabled={busy}>{busy ? 'Đang kích hoạt…' : 'Thiết lập mật khẩu'}</button></form>}
    {message && <p role="status" className="my-4">{message}</p>}<Link to="/login" className="button button-secondary mt-4">Đến trang đăng nhập</Link>
  </main>
}
