import { AppError } from '../utils/AppError.js'

export function calculateEvaluation(criteria, details) {
  const rules = new Map(criteria.map(rule => [Number(rule.id), rule]))
  const ids = details.map(detail => detail.criteriaId)
  if (!criteria.length || ids.length !== rules.size || new Set(ids).size !== ids.length || ids.some(id => !rules.has(id))) {
    throw new AppError(422, 'INVALID_EVALUATION_CRITERIA', 'Phải chấm đủ tiêu chí, mỗi tiêu chí đúng một lần')
  }
  let weighted = 0, totalWeight = 0
  for (const detail of details) {
    const rule = rules.get(detail.criteriaId), maximum = Number(rule.max_score), weight = Number(rule.weight)
    if (!Number.isFinite(maximum) || maximum <= 0 || !Number.isFinite(weight) || weight <= 0) {
      throw new AppError(409, 'INVALID_EVALUATION_CONFIGURATION', 'Cấu hình tiêu chí chấm điểm không hợp lệ')
    }
    if (!Number.isFinite(detail.score) || detail.score < 0 || detail.score > maximum) {
      throw new AppError(422, 'INVALID_EVALUATION_SCORE', 'Điểm vượt quá giới hạn tiêu chí')
    }
    weighted += detail.score / maximum * 10 * weight
    totalWeight += weight
  }
  return Math.round(weighted / totalWeight * 100) / 100
}
