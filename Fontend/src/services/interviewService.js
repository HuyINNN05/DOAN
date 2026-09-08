import defaultInterviews from '../data/interviews.json'
import { updateApplication } from './applicationService'

const KEY = 'internconnect_interviews'
function read() { try { return JSON.parse(localStorage.getItem(KEY)) || defaultInterviews } catch { return defaultInterviews } }
export function getInterviews() { return read() }
export function createInterview(input) { const next = [...read(), { ...input, id: Date.now(), status: 'Chờ sinh viên xác nhận' }]; localStorage.setItem(KEY, JSON.stringify(next)); updateApplication(input.applicationId, { status: '06', statusLabel: 'Được mời phỏng vấn' }); return next }
export function respondInterview(id, accepted) { const current = read(); const interview = current.find((item) => item.id === id); if (!interview) return current; const next = current.map((item) => item.id === id ? { ...item, status: accepted ? 'Đã xác nhận' : 'Đã từ chối' } : item); localStorage.setItem(KEY, JSON.stringify(next)); if (accepted) updateApplication(interview.applicationId, { status: '07', statusLabel: 'Sinh viên xác nhận lịch' }); return next }
export function recordInterviewResult(id, passed, note) { const current = read(); const interview = current.find((item) => item.id === id); if (!interview || interview.status !== 'Đã xác nhận') return current; const next = current.map((item) => item.id === id ? { ...item, status: passed ? 'Đạt phỏng vấn' : 'Không đạt', result: note } : item); localStorage.setItem(KEY, JSON.stringify(next)); updateApplication(interview.applicationId, { status: '09', statusLabel: passed ? 'Trúng tuyển' : 'Không đạt', result: note }); return next }
export function confirmOffer(applicationId, accepted) { return updateApplication(applicationId, { status: accepted ? '11' : '09', statusLabel: accepted ? 'Sinh viên xác nhận nhận thực tập' : 'Từ chối offer' }) }
