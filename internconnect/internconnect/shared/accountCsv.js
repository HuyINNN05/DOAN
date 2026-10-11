export const MAX_ACCOUNT_ROWS = 100
export const ACCOUNT_HEADERS = ['role', 'fullName', 'email', 'studentCode', 'lecturerCode', 'phone', 'faculty', 'major', 'className', 'course', 'department', 'academicTitle']
export function parseAccountCsv(text) {
  text = text.replace(/^\uFEFF/, '')
  if (text.includes('\0')) throw new Error('CSV chứa ký tự không hợp lệ.')
  const separator = text.split(/\r?\n/, 1)[0].includes(',') ? ',' : ';'
  const records = []
  let cells = [], value = '', quoted = false, closed = false, line = 1, startLine = 1
  const cell = () => { cells.push(value.trim()); value = ''; closed = false }
  const row = () => {
    cell()
    if (cells.some(Boolean)) records.push({ line: startLine, cells })
    cells = []
    if (records.length > MAX_ACCOUNT_ROWS + 1) throw new Error(`Tối đa ${MAX_ACCOUNT_ROWS} dòng dữ liệu mỗi lần.`)
  }
  for (let index = 0; index < text.length; index++) {
    const character = text[index]
    if (quoted) {
      if (character === '"') {
        if (text[index + 1] === '"') { value += '"'; index++ }
        else { quoted = false; closed = true }
      } else { value += character; if (character === '\n') line++ }
    } else if (character === '"') {
      if (value || closed) throw new Error(`Dấu ngoặc kép không hợp lệ ở dòng ${line}.`)
      quoted = true
    } else if (character === separator) cell()
    else if (character === '\n' || character === '\r') {
      row()
      if (character === '\r' && text[index + 1] === '\n') index++
      line++; startLine = line
    } else {
      if (closed && character.trim()) throw new Error(`Dữ liệu sau ngoặc kép ở dòng ${line}.`)
      if (!closed) value += character
    }
  }
  if (quoted) throw new Error('CSV có ngoặc kép chưa đóng.')
  if (value || cells.length || closed) row()
  if (records.length < 2) throw new Error('CSV cần header và ít nhất một dòng dữ liệu.')
  const headers = records.shift().cells
  if (headers.some(header => !ACCOUNT_HEADERS.includes(header)) || new Set(headers).size !== headers.length) throw new Error('Header CSV không hợp lệ hoặc bị trùng.')
  for (const required of ['role', 'fullName', 'email']) if (!headers.includes(required)) throw new Error(`Thiếu header ${required}.`)
  return records.map(record => ({
    line: record.line,
    ...(record.cells.length !== headers.length ? { error: 'Số ô không khớp với header.' } : {}),
    data: Object.fromEntries(headers.map((header, index) => [header, record.cells[index] || ''])),
  }))
}

export const ACCOUNT_CSV_TEMPLATE = '\uFEFFrole,fullName,email,studentCode,lecturerCode,phone,faculty,major,className,course,department,academicTitle\r\nstudent,Nguyễn Văn An,an@school.edu.vn,SV2026001,,,CNTT,Kỹ thuật phần mềm,D26,2026,,\r\nlecturer,Trần Thu Hà,ha@school.edu.vn,,GV2026001,,CNTT,,,,Kỹ thuật phần mềm,Thạc sĩ\r\n'
