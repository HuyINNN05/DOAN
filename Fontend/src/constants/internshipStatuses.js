export const INTERNSHIP_STATUSES = Object.freeze([
  { id: '01', label: 'Chưa đăng ký' },
  { id: '02', label: 'Đã đăng ký thực tập' },
  { id: '03', label: 'Nhà trường xác nhận' },
  { id: '04', label: 'Hồ sơ gửi doanh nghiệp' },
  { id: '05', label: 'Doanh nghiệp đang xem xét' },
  { id: '06', label: 'Được mời phỏng vấn' },
  { id: '07', label: 'Sinh viên xác nhận lịch' },
  { id: '08', label: 'Đang/chờ kết quả phỏng vấn' },
  { id: '09', label: 'Kết quả tuyển chọn' },
  { id: '10', label: 'Chờ xác nhận nhận thực tập' },
  { id: '11', label: 'Sinh viên xác nhận nhận thực tập' },
  { id: '12', label: 'Nhà trường xác nhận kỳ/nơi thực tập' },
  { id: '13', label: 'Đang thực tập' },
  { id: '14', label: 'Đang đánh giá và ký xác nhận' },
  { id: '15', label: 'Hoàn thành thực tập' },
])

export const STATUS_LABELS = Object.fromEntries(INTERNSHIP_STATUSES.map((status) => [status.id, status.label]))

export const STATUS_TRANSITIONS = Object.freeze({
  '01': ['02'], '02': ['03'], '03': ['04'], '04': ['05'], '05': ['06', '09'],
  '06': ['07'], '07': ['08'], '08': ['09'], '09': ['10'], '10': ['11', '09'],
  '11': ['12'], '12': ['13'], '13': ['14'], '14': ['15'], '15': [],
})

export function canTransition(from, to) {
  return (STATUS_TRANSITIONS[from] || []).includes(to)
}
