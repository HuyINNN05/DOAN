export function required(value, label) {
  return String(value || '').trim() ? '' : `${label} là bắt buộc.`
}

export function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim()) ? '' : 'Email không hợp lệ.'
}

export function validScore(value) {
  const score = Number(value)
  return Number.isFinite(score) && score >= 0 && score <= 10 ? '' : 'Điểm phải nằm trong khoảng 0 đến 10.'
}

