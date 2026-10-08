import { users } from './dataSource'

const SESSION_KEY = 'internconnect_session'

export function login(email, password) {
  const extra = (() => { try { return JSON.parse(localStorage.getItem('internconnect_users')) || [] } catch { return [] } })()
  const user = [...extra, ...users.filter((item) => !extra.some((override) => override.id === item.id))].find((item) => item.email === email && item.password === password && item.active !== false)
  if (!user) return null
  const session = { id: user.id, email: user.email, name: user.name, role: user.role }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return session
}

export function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)) } catch { return null }
}

export function logout() { localStorage.removeItem(SESSION_KEY) }
