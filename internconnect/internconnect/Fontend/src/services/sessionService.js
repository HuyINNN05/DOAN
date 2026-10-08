import { loginRequest, logoutRequest } from '../api/authApi'

const SESSION_KEY = 'internconnect_session'

export async function login(email, password) {
  const user = await loginRequest({ email, password })
  const session = { ...user, name: user.full_name || user.name }
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return session
}

export function getSession() {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)) } catch { return null }
}

export async function logout() {
  try { await logoutRequest() } finally { sessionStorage.removeItem(SESSION_KEY) }
}
