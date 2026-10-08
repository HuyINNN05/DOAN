import { api, setAccessToken } from './client'
export async function loginRequest(credentials) { const { data } = await api.post('/auth/login', credentials); setAccessToken(data.data.accessToken); return data.data.user }
export async function logoutRequest() { try { await api.post('/auth/logout') } finally { setAccessToken(null) } }
export async function meRequest() { const { data } = await api.get('/auth/me'); return data.data }
export async function registerCompanyRequest(input){const{data}=await api.post('/auth/company-register',input);return data.data}
export async function forgotPasswordRequest(email){const{data}=await api.post('/auth/forgot-password',{email});return data.data}
export async function resetPasswordRequest(token,password){const{data}=await api.post('/auth/reset-password',{token,password});return data.data}
