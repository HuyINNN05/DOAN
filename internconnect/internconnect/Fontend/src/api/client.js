import axios from 'axios'

let accessToken = null
export const setAccessToken = (token) => { accessToken = token }

export const api = axios.create({ baseURL: '/api', timeout: 15000, withCredentials: true })
api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
  return config
})

let refreshRequest = null
api.interceptors.response.use((response) => response, async (error) => {
  const original = error.config
  if (error.response?.status !== 401 || original?._retried || original?.url === '/auth/refresh') return Promise.reject(error)
  original._retried = true
  refreshRequest ||= api.post('/auth/refresh').finally(() => { refreshRequest = null })
  const response = await refreshRequest
  setAccessToken(response.data.data.accessToken)
  original.headers.Authorization = `Bearer ${response.data.data.accessToken}`
  return api(original)
})

export function apiErrorMessage(error, fallback = 'Không thể kết nối máy chủ') {
  return error.response?.data?.error?.message || fallback
}
