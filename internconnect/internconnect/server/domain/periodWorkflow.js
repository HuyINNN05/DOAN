import { AppError } from '../utils/AppError.js'

export function assertPeriodTransition(current,target) {
  if (current===target) return
  const allowed = {draft:['open'],open:['closed'],closed:['open','completed'],completed:[]}
  if (!allowed[current]?.includes(target)) throw new AppError(409,'INVALID_PERIOD_TRANSITION','Kỳ thực tập không thể chuyển trạng thái theo yêu cầu')
}
