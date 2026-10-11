import { useState } from 'react'
import * as api from '../../api/adminApi'
import { ACCOUNT_CSV_TEMPLATE, MAX_ACCOUNT_ROWS } from '../../../../shared/accountCsv.js'

const fields = { fullName: 'Họ tên', email: 'Email trường', studentCode: 'Mã sinh viên', lecturerCode: 'Mã giảng viên', phone: 'Điện thoại', faculty: 'Khoa', major: 'Ngành', className: 'Lớp', course: 'Khóa', department: 'Bộ môn', academicTitle: 'Học hàm / học vị' }
const deliveryLabels = { pending: 'Đang xử lý email', sent: 'Email đã được máy chủ chấp nhận', failed: 'Gửi email thất bại', not_configured: 'Email chưa cấu hình', unknown: 'Chưa xác nhận được kết quả email' }
function errorMessage(error) { return error.response?.data?.error?.message || 'Không thể xử lý yêu cầu.' }
export function ActivationEmailAction({ user, onChanged }) {
  const [busy, setBusy] = useState(false), [message, setMessage] = useState('')
  async function resend() {
    setBusy(true)
    try { const result = await api.resendActivation(user.id); setMessage(result.delivery.message); onChanged() }
    catch (error) { setMessage(errorMessage(error)) }
    finally { setBusy(false) }
  }
  if (!user.delivery_status) return <span>—</span>
  return <div><span>{user.activation_completed_at ? 'Đã kích hoạt' : deliveryLabels[user.delivery_status]}</span>
    {!user.activation_completed_at && user.status === 'pending' && <button type="button" disabled={busy} className="button button-secondary mt-2" onClick={resend}>{busy ? 'Đang gửi…' : 'Gửi lại email'}</button>}
    {message && <small role="status" className="block mt-2">{message}</small>}</div>
}
export default function AccountProvisioningPanel({ onChanged }) {
  const [mode, setMode] = useState(null), [role, setRole] = useState('student'), [busy, setBusy] = useState(false), [message, setMessage] = useState(''), [file, setFile] = useState(null), [report, setReport] = useState(null)
  async function create(event) {
    event.preventDefault(); setBusy(true); setMessage('')
    const form = event.currentTarget, values = Object.fromEntries(new FormData(form))
    try {
      const result = await api.createSchoolAccount({ ...values, role })
      setMessage(`Đã tạo tài khoản ${result.email}, chờ người dùng đặt mật khẩu. ${result.delivery.message}`)
      form.reset(); onChanged()
    } catch (error) {
      const details = error.response?.data?.error?.details?.fieldErrors
      setMessage(details ? Object.entries(details).map(([name, errors]) => `${fields[name] || name}: ${errors.join(', ')}`).join('; ') : errorMessage(error))
    } finally { setBusy(false) }
  }
  async function upload(preview) {
    setBusy(true); setMessage('')
    try {
      const result = await api.importSchoolAccounts(file, preview)
      setReport({ ...result, preview })
      if (!preview) { setMessage('Đã xử lý danh sách. Kiểm tra kết quả từng dòng và trạng thái email bên dưới.'); onChanged() }
    } catch (error) { setMessage(errorMessage(error)) }
    finally { setBusy(false) }
  }
  function template() {
    const url = URL.createObjectURL(new Blob([ACCOUNT_CSV_TEMPLATE], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a'); link.href = url; link.download = 'mau-cap-tai-khoan.csv'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  return <div className="mb-6 rounded-xl border border-line bg-white p-5">
    <div className="flex flex-wrap gap-3"><button type="button" disabled={busy} className="button button-primary" onClick={() => { setMode('single'); setMessage('') }}>Tạo sinh viên / giảng viên</button><button type="button" disabled={busy} className="button button-secondary" onClick={() => { setMode('import'); setMessage('') }}>Nhập danh sách CSV</button>{mode && <button type="button" disabled={busy} className="button button-secondary" onClick={() => setMode(null)}>Đóng</button>}</div>
    {message && <p role="status" className="notice my-4">{message}</p>}
    {mode === 'single' && <form onSubmit={create} className="mt-4 grid gap-4 md:grid-cols-2">
      <label>Loại tài khoản<select className="block w-full rounded border p-2 mt-1" value={role} disabled={busy} onChange={e => setRole(e.target.value)}><option value="student">Sinh viên</option><option value="lecturer">Giảng viên</option></select></label>
      <p className="text-sm self-center">Người dùng tự đặt mật khẩu qua email; Admin không nhận mật khẩu.</p>
      {['fullName','email',role === 'student' ? 'studentCode' : 'lecturerCode','phone','faculty',...(role === 'student' ? ['major','className','course'] : ['department','academicTitle'])].map(name => <label key={name}>{fields[name]}{['fullName','email','studentCode','lecturerCode'].includes(name) && ' *'}<input className="block w-full rounded border p-2 mt-1" name={name} disabled={busy} type={name === 'email' ? 'email' : name === 'phone' ? 'tel' : 'text'} required={['fullName','email','studentCode','lecturerCode'].includes(name)} maxLength={{ fullName: 150, email: 255, phone: 30, studentCode: 50, lecturerCode: 50, className: 100, course: 50, academicTitle: 100 }[name] || 150}/></label>)}
      <button disabled={busy} className="button button-primary md:col-span-2">{busy ? 'Đang tạo…' : 'Tạo tài khoản và gửi email kích hoạt'}</button>
    </form>}
    {mode === 'import' && <div className="mt-4 space-y-4">
      <p>CSV UTF-8, tối đa 1 MB và {MAX_ACCOUNT_ROWS} dòng. Excel: chọn “Save As → CSV UTF-8”. Header bắt buộc: role, fullName, email và studentCode hoặc lecturerCode theo vai trò. role chỉ nhận student / lecturer.</p>
      <button type="button" className="button button-secondary" onClick={template}>Tải file mẫu</button>
      <label className="block">Danh sách tài khoản<input className="block mt-2" type="file" accept=".csv,text/csv" disabled={busy} onChange={event => {
        const selected = event.target.files[0]; setReport(null); setMessage('')
        if (selected && (selected.size > 1024 * 1024 || !/\.csv$/i.test(selected.name))) { setFile(null); setMessage('Chọn CSV UTF-8 không quá 1 MB.'); return }
        setFile(selected || null)
      }}/></label>
      <div className="flex gap-3"><button type="button" className="button button-secondary" disabled={!file || busy} onClick={() => upload(true)}>{busy ? 'Đang xử lý…' : 'Kiểm tra / xem trước'}</button><button type="button" className="button button-primary" disabled={busy || !report?.preview || !report.summary.valid} onClick={() => upload(false)}>Tạo {report?.summary.valid || 0} tài khoản hợp lệ</button></div>
      {report && <><p role="status">Tổng: {report.summary.total} · {report.preview ? `Hợp lệ: ${report.summary.valid}` : `Đã tạo: ${report.summary.created}`} · Lỗi: {report.summary.errors}{!report.preview && ` · Email gửi được: ${report.summary.emailSent} · Email chưa gửi/xác nhận được: ${report.summary.emailNotSent}`}</p>
        <div className="overflow-x-auto"><table className="w-full text-left text-sm"><caption className="sr-only">Kết quả kiểm tra hoặc tạo tài khoản theo dòng CSV</caption><thead><tr><th>Dòng</th><th>Họ tên / email</th><th>Kết quả</th><th>Chi tiết / email</th></tr></thead><tbody>{report.results.map(row => <tr key={row.line}><td>{row.line}</td><td>{row.data?.fullName}<small className="block">{row.data?.email}</small></td><td>{{ valid: 'Hợp lệ', created: 'Đã tạo', error: 'Lỗi' }[row.status]}</td><td>{row.error ? <span>{row.error.message}{row.error.details?.fieldErrors && <small className="block">{Object.entries(row.error.details.fieldErrors).map(([name, errors]) => `${fields[name] || name}: ${errors.join(', ')}`).join('; ')}</small>}</span> : row.account?.delivery.message || 'Sẵn sàng tạo'}</td></tr>)}</tbody></table></div></>}
    </div>}
  </div>
}
