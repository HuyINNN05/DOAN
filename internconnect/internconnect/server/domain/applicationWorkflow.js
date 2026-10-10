import { AppError } from '../utils/AppError.js'

export const TRANSITIONS = Object.freeze({
  '01': { to: '02', role: 'student' }, '02': { to: '03', role: 'admin' },
  '03': { to: '04', role: 'admin' }, '04': { to: '05', role: 'company' },
  '05': { to: '06', role: 'company' }, '06': { to: '07', role: 'student' },
  '07': { to: '08', role: 'company' }, '08': { to: '09', role: 'company' },
  '09': { to: '10', role: 'company' }, '10': { to: '11', role: 'student' },
  '11': { to: '12', role: 'admin' }, '12': { to: '13', role: 'admin' },
  '13': { to: '14', role: 'lecturer' }, '14': { to: '15', role: 'admin' },
})

export function assertTransition(currentStatus, targetStatus, actorRole) {
  const transition = TRANSITIONS[currentStatus]
  if (!transition || transition.to !== targetStatus) throw new AppError(409, 'INVALID_STATUS_TRANSITION', `Không thể chuyển từ ${currentStatus} sang ${targetStatus}`)
  if (transition.role !== actorRole) throw new AppError(403, 'TRANSITION_FORBIDDEN', `Vai trò ${actorRole} không được thực hiện bước này`)
  return transition
}

export function resolveTransitionTarget(currentStatus, requestedTarget, actorRole) {
  if (requestedTarget !== 'admin-confirm') return requestedTarget
  if (actorRole !== 'admin' || !['02', '03'].includes(currentStatus)) throw new AppError(409, 'APPLICATION_NOT_CONFIRMABLE', 'Hồ sơ không ở bước nhà trường có thể xác nhận')
  return currentStatus === '02' ? '03' : '04'
}
