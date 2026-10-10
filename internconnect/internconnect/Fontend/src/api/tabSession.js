export const SESSION_KEY = 'internconnect_session'
const TAB_KEY = 'internconnect_tab_session'
const ACCESS_KEY = 'internconnect_access_token'
export function readAccessToken() {
  try { return sessionStorage.getItem(ACCESS_KEY) } catch { return null }
}
export function storeAccessToken(token) {
  if(typeof sessionStorage==='undefined')return
  if(token)sessionStorage.setItem(ACCESS_KEY,token)
  else sessionStorage.removeItem(ACCESS_KEY)
}
export function getTabId() {
  if (typeof sessionStorage==='undefined') return null
  let id=sessionStorage.getItem(TAB_KEY)
  if (!id) { id=crypto.randomUUID();sessionStorage.setItem(TAB_KEY,id) }
  return id
}
export function rotateTabId() {
  if (typeof sessionStorage!=='undefined') sessionStorage.setItem(TAB_KEY,crypto.randomUUID())
}
export function getExpectedUserId() {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY))?.id } catch { return null }
}
export function clearTabSession() {
  if (typeof sessionStorage!=='undefined') {sessionStorage.removeItem(SESSION_KEY);sessionStorage.removeItem(ACCESS_KEY)}
}
