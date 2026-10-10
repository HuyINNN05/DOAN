import axios from 'axios'
import { clearTabSession,getExpectedUserId,getTabId,readAccessToken,storeAccessToken } from './tabSession.js'

let accessToken = readAccessToken()
export const setAccessToken = (token) => { accessToken = token;storeAccessToken(token) }

const authActions = ['/auth/login','/auth/refresh','/auth/logout','/auth/company-register','/auth/forgot-password','/auth/reset-password']
function expired(token) {
  try { const claims=JSON.parse(atob(token.split('.')[1].replaceAll('-','+').replaceAll('_','/')));return claims.exp*1000<=Date.now()+5000 } catch { return false }
}
function needsSession(config) {
  return /^\/(students|admin|lecturer|company|applications|interviews|notifications)(\/|$)/.test(config.url) || config.url==='/auth/me' || /^\/jobs\/\d+\/(apply|save)$/.test(config.url)
}

export const api = axios.create({ baseURL: '/api', timeout: 15000, withCredentials: true })
api.interceptors.request.use(async (config) => {
  const tabId=getTabId(),userId=getExpectedUserId()
  if(tabId)config.headers['X-Session-Id']=tabId
  if(userId&&config.url!=='/auth/login')config.headers['X-Expected-User']=String(userId)
  if(!accessToken)accessToken=readAccessToken()
  if(userId&&needsSession(config)&&(!accessToken||expired(accessToken)))await refreshSession()
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
  return config
})

let refreshRequest = null
function refreshSession() {
  refreshRequest ||= (async()=>{
    try {
      const refresh=()=>api.post('/auth/refresh')
      // Duplicated browser tabs can inherit the same sessionStorage identity.
      // Serialize cookie rotation across those tabs without changing replay protection.
      const tab=getTabId()
      const response=typeof navigator!=='undefined'&&navigator.locks&&tab
        ? await navigator.locks.request(`internconnect-refresh-${tab}`,refresh)
        : await refresh()
      const expected=getExpectedUserId()
      if(expected&&String(response.data.data.user?.id)!==String(expected))throw new Error('Phiên đăng nhập không thuộc tài khoản trong tab này')
      setAccessToken(response.data.data.accessToken)
      return response
    } catch(error) {
      const hadSession=Boolean(getExpectedUserId())
      setAccessToken(null);clearTabSession()
      if(hadSession&&typeof window!=='undefined'&&window.location.pathname!=='/login')window.location.assign(`/login?returnUrl=${encodeURIComponent(window.location.pathname+window.location.search)}`)
      throw error
    }
  })().finally(()=>{refreshRequest=null})
  return refreshRequest
}
api.interceptors.response.use((response) => response, async (error) => {
  const original = error.config
  if (error.response?.status !== 401 || !original || original._retried || authActions.includes(original.url)) return Promise.reject(error)
  original._retried = true
  if(!accessToken||original.headers.Authorization===`Bearer ${accessToken}`)await refreshSession()
  original.headers.Authorization = `Bearer ${accessToken}`
  return api(original)
})

export function apiErrorMessage(error, fallback = 'Không thể kết nối máy chủ') {
  return error.response?.data?.error?.message || fallback
}
