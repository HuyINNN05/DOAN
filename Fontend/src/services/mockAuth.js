import users from '../data/users.json'

const SESSION_KEY = 'internconnect_session'

export function login(email, password) {
  const user = users.find((item) => item.email === email && item.password === password)
  if (!user) return null
  const session = { id: user.id, email: user.email, name: user.name, role: user.role }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return session
}

export function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)) } catch { return null }
}

export function logout() { localStorage.removeItem(SESSION_KEY) }
