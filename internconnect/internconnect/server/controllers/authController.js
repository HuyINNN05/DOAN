import * as auth from '../services/authService.js'
import { env } from '../config/env.js'
import { refreshCookieName } from '../utils/sessionCookie.js'
const cookie = { httpOnly: true, secure: env.NODE_ENV === 'production', sameSite: 'lax', path: '/api/auth', maxAge: 604800000 }
export async function login(req, res) { const name=refreshCookieName(req);const data = await auth.login(req.body.email, req.body.password,{ip:req.ip,userAgent:req.get('user-agent')}); res.cookie(name, data.refreshToken, cookie); res.json({ success: true, data: { accessToken: data.accessToken, user: data.user } }) }
export async function refresh(req, res) { const name=refreshCookieName(req);const data = await auth.refresh(req.cookies[name],req.get('X-Expected-User')); res.cookie(name, data.refreshToken, cookie); res.json({ success: true, data: { accessToken: data.accessToken, user: data.user } }) }
export async function logout(req, res) { const name=refreshCookieName(req);await auth.logout(req.cookies[name]); res.clearCookie(name, cookie); res.status(204).end() }
export function me(req, res) { res.json({ success: true, data: req.user }) }
export async function registerCompany(req,res){res.status(201).json({success:true,data:await auth.registerCompany(req.body)})}
export async function forgotPassword(req,res){res.json({success:true,data:await auth.forgotPassword(req.body.email)})}
export async function resetPassword(req,res){res.json({success:true,data:await auth.resetPassword(req.body.token,req.body.password)})}
