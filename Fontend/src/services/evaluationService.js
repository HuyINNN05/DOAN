const KEY = 'internconnect_evaluations'
function read() { try { return JSON.parse(localStorage.getItem(KEY)) || [] } catch { return [] } }
export function getEvaluations() { return read() }
export function saveEvaluation(input) { const score = Number(input.score); if (!Number.isFinite(score) || score < 0 || score > 10) return read(); const current = read(); const next = [...current.filter((item) => !(item.studentId === input.studentId && item.evaluatorRole === input.evaluatorRole)), { ...input, score, id: Date.now(), status: 'Đã gửi', submittedAt: new Date().toISOString() }]; localStorage.setItem(KEY, JSON.stringify(next)); return next }
