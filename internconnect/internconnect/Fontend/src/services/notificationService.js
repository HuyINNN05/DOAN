import defaults from '../data/notifications.json'
import { getSession } from './mockAuth'
const KEY = 'internconnect_notifications'
const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || defaults } catch { return defaults } }
export function getNotifications() {
  const session = getSession()
  if (!session) return []
  return read().filter((item) => item.userId === session.id || (!item.userId && item.role === session.role))
}
export function markNotificationRead(id) {
  if (!getNotifications().some((item) => item.id === id)) return getNotifications()
  localStorage.setItem(KEY, JSON.stringify(read().map((item) => item.id === id ? { ...item, read: true } : item)))
  return getNotifications()
}
export function addNotification(input) {
  const session = getSession()
  if (session?.role !== 'admin') return { ok: false, error: 'Chỉ nhà trường được tạo thông báo' }
  const next = [...read(), { ...input, id: Date.now(), read: false, createdAt: new Date().toISOString() }]
  localStorage.setItem(KEY, JSON.stringify(next))
  return { ok: true, notifications: next }
}
