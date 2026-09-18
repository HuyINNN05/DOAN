import { Bell, Check } from 'lucide-react'
import { useState } from 'react'
import { getNotifications, markNotificationRead } from '../../services/notificationService'

function NotificationPanel() {
  const [open, setOpen] = useState(false); const [items, setItems] = useState(getNotifications()); const unread = items.filter((item) => !item.read).length
  function read(id) { markNotificationRead(id); setItems(getNotifications()) }
  return <div className="relative"><button className="dashboard-notification-button" type="button" aria-label="Thông báo" onClick={() => setOpen((value) => !value)}><Bell size={18} />{unread > 0 && <i>{unread}</i>}</button>{open && <div className="dashboard-notification-panel"><div className="flex items-center justify-between border-b border-[#e8eef6] pb-3"><b>Thông báo</b><span>{unread} chưa đọc</span></div>{items.length ? items.map((item) => <button className={`dashboard-notification-item ${item.read ? '' : 'unread'}`} type="button" key={item.id} onClick={() => read(item.id)}><span><b>{item.title}</b><small>{item.message}</small></span>{item.read ? <Check size={14} /> : <i />}</button>) : <p className="py-5 text-center text-xs text-[#7890ad]">Chưa có thông báo.</p>}</div>}</div>
}

export default NotificationPanel
