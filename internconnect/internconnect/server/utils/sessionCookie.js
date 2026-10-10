import { AppError } from './AppError.js'

export function refreshCookieName(req) {
  const id=req.get('X-Session-Id')
  if(!id)return 'refreshToken'
  if(!/^[a-zA-Z0-9-]{16,64}$/.test(id))throw new AppError(422,'INVALID_SESSION_ID','Định danh phiên đăng nhập không hợp lệ')
  return `refreshToken_${id}`
}
