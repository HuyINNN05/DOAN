import { useEffect, useState } from 'react'
import Header from '../components/Header/Header'
import Footer from '../components/Footer/Footer'
import LoadingState from '../components/ui/LoadingState'
import { listNotifications, readAllNotifications, readNotification } from '../api/notificationApi'

export default function NotificationsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    listNotifications().then(setItems).catch((requestError) => setError(requestError.response?.data?.error?.message || 'Không tải được thông báo.')).finally(() => setLoading(false))
  }, [])

  async function read(id) {
    try {
      await readNotification(id)
      setItems((current) => current.map((item) => item.id === id ? { ...item, is_read: true } : item))
    } catch (requestError) { setError(requestError.response?.data?.error?.message || 'Không cập nhật được thông báo.') }
  }

  async function readAll() {
    try {
      await readAllNotifications()
      setItems((current) => current.map((item) => ({ ...item, is_read: true })))
      setMessage('Đã đánh dấu tất cả là đã đọc.')
    } catch (requestError) { setError(requestError.response?.data?.error?.message || 'Không cập nhật được thông báo.') }
  }

  return <div className="public-page min-h-screen bg-[#f4f8fd]"><Header/><main className="mx-auto max-w-3xl px-5 py-10">
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><h1 className="text-3xl font-extrabold text-[#123a8b]">Thông báo</h1>{items.some((item) => !item.is_read) && <button className="rounded-md bg-[#0757c9] px-4 py-2 text-sm font-bold text-white" onClick={readAll}>Đọc tất cả</button>}</div>
    {message && <p role="status" className="mb-4 rounded bg-blue-50 p-3 text-sm">{message}</p>}
    {error && <p role="alert" className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {loading ? <LoadingState/> : items.length === 0 ? <p className="rounded-xl border bg-white p-6">Chưa có thông báo.</p> : <div className="space-y-3">{items.map((item) => <article className={`rounded-xl border bg-white p-5 text-sm ${item.is_read ? '' : 'border-blue-300'}`} key={item.id}><div className="flex justify-between gap-3"><div><b>{item.title}</b><p className="mt-1">{item.message}</p><small>{item.is_read ? 'Đã đọc' : 'Chưa đọc'} · {new Date(item.created_at).toLocaleString('vi-VN')}</small></div>{!item.is_read && <button className="self-start rounded border px-3 py-2" onClick={() => read(item.id)}>Đánh dấu đã đọc</button>}</div></article>)}</div>}
  </main><Footer/></div>
}
