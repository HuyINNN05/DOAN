export const roleLabels = { student: 'Sinh viên', company: 'Doanh nghiệp', lecturer: 'Giảng viên', admin: 'Nhà trường' }
export const workModes = { onsite: 'Tại văn phòng', remote: 'Từ xa', hybrid: 'Kết hợp' }
export function formatDate(value) {
  if (!value) return 'Chưa cập nhật'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Chưa cập nhật' : date.toLocaleDateString('vi-VN')
}
export function initials(name = '') { return name.trim().split(/\s+/).slice(-2).map(x => x[0]).join('').toUpperCase() || 'IC' }
export function foldText(value = '') { return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase() }
export function salaryLabel(min, max) {
  const money = value => Number(value).toLocaleString('vi-VN') + ' đ'
  if (min != null && max != null) return `${money(min)} – ${money(max)}`
  if (min != null) return `Từ ${money(min)}`
  if (max != null) return `Đến ${money(max)}`
  return 'Thỏa thuận'
}
