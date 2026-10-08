import { Bell, Check } from 'lucide-react'
import { useEffect, useState } from 'react'
import { listNotifications, readNotification } from '../../api/notificationApi'

function NotificationPanel() {
  const [open, setOpen] = useState(false); const [items, setItems] = useState([]); const unread = items.filter((item) => !item.is_read).length
  useEffect(() => { listNotifications().then((data) => setItems(data.map((item) => ({ ...item, read: item.is_read })))).catch(() => setItems([])) }, [])
  async function read(id) { await readNotification(id); setItems((current) => current.map((item) => item.id === id ? { ...item, is_read: true, read: true } : item)) }
  return <div className="relative"><button className="dashboard-notification-button" type="button" aria-label="Thông báo" onClick={() => setOpen((value) => !value)}><Bell size={18} />{unread > 0 && <i>{unread}</i>}</button>{open && <div className="dashboard-notification-panel"><div className="flex items-center justify-between border-b border-[#e8eef6] pb-3"><b>Thông báo</b><span>{unread} chưa đọc</span></div>{items.length ? items.map((item) => <button className={`dashboard-notification-item ${item.read ? '' : 'unread'}`} type="button" key={item.id} onClick={() => read(item.id)}><span><b>{item.title}</b><small>{item.message}</small></span>{item.read ? <Check size={14} /> : <i />}</button>) : <p className="py-5 text-center text-xs text-[#7890ad]">Chưa có thông báo.</p>}</div>}</div>
}

export default NotificationPanel
