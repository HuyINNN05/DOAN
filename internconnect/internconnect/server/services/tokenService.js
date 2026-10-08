import { createHash, randomUUID } from 'node:crypto'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
export const hashToken = (value) => createHash('sha256').update(value).digest('hex')
export const createAccessToken = (user) => jwt.sign({ sub: String(user.id), role: user.role, email: user.email }, env.JWT_ACCESS_SECRET,
  { algorithm: 'HS256', expiresIn: env.JWT_ACCESS_EXPIRES_IN, issuer: 'internconnect', audience: 'internconnect-web' })
export function createRefreshToken(user, familyId = randomUUID()) {
  return { familyId, token: jwt.sign({ sub: String(user.id), familyId, type: 'refresh' }, env.JWT_REFRESH_SECRET,
    { algorithm: 'HS256', expiresIn: env.JWT_REFRESH_EXPIRES_IN, issuer: 'internconnect', audience: 'internconnect-web', jwtid: randomUUID() }) }
}
export const verifyRefreshToken = (token) => jwt.verify(token, env.JWT_REFRESH_SECRET,
  { algorithms: ['HS256'], issuer: 'internconnect', audience: 'internconnect-web' })
