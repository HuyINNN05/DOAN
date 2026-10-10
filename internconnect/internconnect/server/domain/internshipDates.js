import { AppError } from '../utils/AppError.js'

export function validatePeriodDates(input) {
  if (input.startDate > input.endDate || (input.registrationStart && input.registrationEnd && new Date(input.registrationStart) > new Date(input.registrationEnd))) {
    throw new AppError(422, 'INVALID_PERIOD_DATES', 'Ngày bắt đầu phải trước hoặc bằng ngày kết thúc')
  }
}
export function validateDiaryDate(record, date) {
  const day = value => value instanceof Date ? `${value.getFullYear()}-${String(value.getMonth()+1).padStart(2,'0')}-${String(value.getDate()).padStart(2,'0')}` : String(value).slice(0,10)
  if (date < day(record.start_date) || date > day(record.end_date)) throw new AppError(422, 'DIARY_DATE_OUTSIDE_INTERNSHIP', 'Ngày nhật ký phải nằm trong kỳ thực tập')
}
