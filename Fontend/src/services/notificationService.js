import defaults from '../data/notifications.json'
const KEY = 'internconnect_notifications'
function read() { try { return JSON.parse(localStorage.getItem(KEY)) || defaults } catch { return defaults } }
export function getNotifications(userId = 1) { return read().filter((item) => item.userId === userId) }
export function markNotificationRead(id) { const next = read().map((item) => item.id === id ? { ...item, read: true } : item); localStorage.setItem(KEY, JSON.stringify(next)); return next }
export function addNotification(input) { const next = [...read(), { ...input, id: Date.now(), read: false, createdAt: new Date().toISOString() }]; localStorage.setItem(KEY, JSON.stringify(next)); return next }
