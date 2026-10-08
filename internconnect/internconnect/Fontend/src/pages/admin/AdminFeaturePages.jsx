import { useState } from 'react'
import { Bar } from 'react-chartjs-2'
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Tooltip } from 'chart.js'
import { users } from '../../services/dataSource'
import { getRegistrations, reviewCompany } from '../../services/companyService'
import { getRecords, confirmRecord, startInternship, completeInternship } from '../../services/internshipRecordService'
import { getAllApplications, updateApplication } from '../../services/applicationService'
import { addNotification } from '../../services/notificationService'
ChartJS.register(BarElement, CategoryScale, Legend, LinearScale, Tooltip)
const field = 'mt-2 w-full rounded-md border border-[#d8e3f0] px-3 py-2.5 text-sm'
const button = 'rounded-md bg-[#0757c9] px-4 py-2.5 text-sm font-bold text-white'
const box = 'rounded-xl border border-[#dce9f7] bg-white p-5'
function Shell({ title, children }) { return <section><div className="dashboard-page-heading"><div><p className="dashboard-eyebrow">NHÀ TRƯỜNG</p><h1>{title}</h1></div></div>{children}</section> }
function Notice({ text }) { return text && <p role="status" className="mb-4 rounded-md bg-blue-50 p-3 text-sm">{text}</p> }
function read(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) || fallback } catch { return fallback } }
const lecturers = () => users.filter((item) => item.role === 'lecturer')
export function AdminCompaniesPage() {
  const [items, setItems] = useState(getRegistrations()); const [message, setMessage] = useState('')
  function review(id, decision) { const reason = decision === 'Đã duyệt' ? '' : window.prompt('Lý do xử lý hồ sơ:') || ''; const response = reviewCompany(id, decision, reason); setMessage(response.ok ? 'Đã cập nhật hồ sơ.' : response.error); setItems(getRegistrations()) }
  return <Shell title="Phê duyệt doanh nghiệp"><Notice text={message} /><div className="space-y-3">{items.length ? items.map((item) => <article className={box} key={item.id}><h2 className="font-bold">{item.name}</h2><p className="text-sm">#{item.id} · MST {item.taxCode} · {item.email} · {item.status}</p><p className="text-sm">{item.address} · {item.industry} · {item.representative}</p>{item.reason && <p className="text-sm">Lý do: {item.reason}</p>}{item.status !== 'Đã duyệt' && <div className="mt-3 flex flex-wrap gap-2"><button className={button} onClick={() => review(item.id, 'Đã duyệt')}>Duyệt</button><button className="rounded-md border px-3 py-2 text-sm" onClick={() => review(item.id, 'Yêu cầu bổ sung')}>Yêu cầu bổ sung</button><button className="rounded-md border border-red-300 px-3 py-2 text-sm text-red-700" onClick={() => review(item.id, 'Từ chối')}>Từ chối</button></div>}</article>) : <p>Chưa có hồ sơ đăng ký.</p>}</div></Shell>
}
export function AdminAssignmentsPage() {
  const [records, setRecords] = useState(getRecords()); const [message, setMessage] = useState(''); const [selection, setSelection] = useState({})
  function act(record, action = 'confirm') { const choice = selection[record.id] || {}; const response = action === 'start' ? startInternship(record.id) : action === 'complete' ? completeInternship(record.id) : confirmRecord(record.id, choice); setMessage(response.ok ? 'Đã cập nhật hồ sơ.' : response.error); setRecords(response.records) }
  return <Shell title="Phân công giảng viên"><Notice text={message} /><div className="space-y-3">{records.map((record) => <article className={box} key={record.id}><h2 className="font-bold">Hồ sơ #{record.applicationId} · {record.position}</h2><p className="text-sm">{record.company} · {record.status} · {record.period}</p>{record.status === 'Chờ nhà trường xác nhận' && <div className="mt-3 grid gap-3 sm:grid-cols-2"><label className="text-sm">Kỳ thực tập<input className={field} value={selection[record.id]?.period || ''} onChange={(event) => setSelection({ ...selection, [record.id]: { ...selection[record.id], period: event.target.value } })} /></label><label className="text-sm">Giảng viên<select className={field} value={selection[record.id]?.lecturerId || ''} onChange={(event) => setSelection({ ...selection, [record.id]: { ...selection[record.id], lecturerId: event.target.value } })}><option value="">Chọn giảng viên</option>{lecturers().map((lecturer) => <option value={lecturer.id} key={lecturer.id}>{lecturer.name}</option>)}</select></label><button className={button} onClick={() => act(record)}>Xác nhận & phân công</button></div>}{record.status === 'Đã xác nhận' && <button className={`${button} mt-3`} onClick={() => act(record, 'start')}>Bắt đầu thực tập</button>}{getAllApplications().some((app) => app.id === record.applicationId && app.status === '14') && <button className={`${button} mt-3`} onClick={() => act(record, 'complete')}>Ký xác nhận hoàn thành</button>}</article>)}</div></Shell>
}
export function AdminUsersPage() {
  const [items, setItems] = useState(() => {
    const stored = read('internconnect_users', [])
    return [...stored, ...users.filter((user) => !stored.some((item) => item.id === user.id))]
  })
  const [message, setMessage] = useState('')

  function save(next) {
    localStorage.setItem('internconnect_users', JSON.stringify(next))
    setItems(next)
  }

  function createStudent(event) {
    event.preventDefault()
    const form = event.currentTarget
    const values = Object.fromEntries(new FormData(form))
    const email = values.email.trim().toLowerCase()
    if (items.some((user) => user.email.toLowerCase() === email)) {
      setMessage('Email này đã được sử dụng.')
      return
    }
    if (values.password.length < 6) {
      setMessage('Mật khẩu phải có ít nhất 6 ký tự.')
      return
    }
    const student = {
      id: Date.now(),
      studentCode: values.studentCode.trim(),
      name: values.name.trim(),
      email,
      password: values.password,
      role: 'student',
      active: true,
    }
    save([...items, student])
    setMessage(`Đã cấp tài khoản cho sinh viên ${student.name}.`)
    form.reset()
  }

  function toggle(user) {
    if (!window.confirm(`${user.active === false ? 'Mở' : 'Khóa'} tài khoản ${user.email}?`)) return
    save(items.map((item) => item.id === user.id ? { ...item, active: item.active === false } : item))
    setMessage('Đã cập nhật trạng thái tài khoản.')
  }

  return <Shell title="Quản lý tài khoản">
    <Notice text={message} />
    <form className={`${box} mb-5 grid gap-3 sm:grid-cols-2`} onSubmit={createStudent}>
      <div className="sm:col-span-2"><h2 className="font-bold text-[#172d50]">Cấp tài khoản sinh viên</h2><p className="mt-1 text-sm text-[#6684a8]">Sinh viên sẽ dùng tài khoản do nhà trường cấp để đăng nhập hệ thống.</p></div>
      <label className="text-sm">Mã sinh viên<input className={field} required name="studentCode" /></label>
      <label className="text-sm">Họ và tên<input className={field} required name="name" /></label>
      <label className="text-sm">Email đăng nhập<input className={field} required name="email" type="email" /></label>
      <label className="text-sm">Mật khẩu ban đầu<input className={field} required minLength="6" name="password" type="password" /></label>
      <button className={`${button} sm:col-span-2 sm:justify-self-start`}>Cấp tài khoản</button>
    </form>
    <p className="mb-4 text-sm">{items.length} tài khoản</p>
    <div className="space-y-2">{items.map((user) => <div className={`${box} flex flex-wrap items-center justify-between gap-2`} key={user.id}><div><b>{user.name}</b><p className="text-sm">{user.studentCode ? `${user.studentCode} · ` : ''}{user.email} · {user.role} · {user.active === false ? 'Đã khóa' : 'Hoạt động'}</p></div><button className="rounded-md border px-3 py-2 text-sm" onClick={() => toggle(user)}>{user.active === false ? 'Mở' : 'Khóa'}</button></div>)}</div>
  </Shell>
}
export function AdminPeriodsPage() { const key = 'internconnect_periods'; const [items, setItems] = useState(() => read(key, [])); const [form, setForm] = useState({ name: '', start: '', end: '' }); function save(event) { event.preventDefault(); const next = [...items, { ...form, id: Date.now(), status: 'Bản nháp' }]; localStorage.setItem(key, JSON.stringify(next)); setItems(next); setForm({ name: '', start: '', end: '' }) } function toggle(item) { const next = items.map((row) => row.id === item.id ? { ...row, status: row.status === 'Đang mở' ? 'Đã đóng' : 'Đang mở' } : row); localStorage.setItem(key, JSON.stringify(next)); setItems(next) } return <Shell title="Kỳ thực tập"><form className={`${box} mb-4 grid gap-3 sm:grid-cols-3`} onSubmit={save}>{[['name', 'Tên kỳ'], ['start', 'Bắt đầu'], ['end', 'Kết thúc']].map(([name, label]) => <label className="text-sm" key={name}>{label}<input required className={field} type={name === 'name' ? 'text' : 'date'} value={form[name]} onChange={(event) => setForm({ ...form, [name]: event.target.value })} /></label>)}<button className={button}>Thêm kỳ</button></form>{items.map((item) => <article className={`${box} mb-2`} key={item.id}><b>{item.name}</b><p className="text-sm">{item.start} → {item.end} · {item.status}</p><button className="mt-2 text-sm text-[#0757c9]" onClick={() => toggle(item)}>{item.status === 'Đang mở' ? 'Đóng kỳ' : 'Mở kỳ'}</button></article>)}</Shell> }
export function AdminContentPage() { const key = 'internconnect_articles'; const [items, setItems] = useState(() => read(key, [])); const [form, setForm] = useState({ title: '', category: 'Tin tức', body: '' }); function save(event) { event.preventDefault(); const next = [...items, { ...form, id: Date.now(), status: 'Đã xuất bản' }]; localStorage.setItem(key, JSON.stringify(next)); setItems(next); setForm({ title: '', category: 'Tin tức', body: '' }) } return <Shell title="Quản lý nội dung"><form className={`${box} mb-4 space-y-3`} onSubmit={save}><label className="block text-sm">Tiêu đề<input required className={field} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label><label className="block text-sm">Danh mục<select className={field} value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}><option>Tin tức</option><option>Hướng dẫn</option><option>Quy định</option></select></label><label className="block text-sm">Nội dung<textarea required className={field} value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} /></label><button className={button}>Xuất bản</button></form>{items.map((item) => <article className={`${box} mb-2`} key={item.id}><b>{item.title}</b><p className="text-sm">{item.category} · {item.status}</p></article>)}</Shell> }
export function AdminNotificationsPage() { const [message, setMessage] = useState(''); function submit(event) { event.preventDefault(); const response = addNotification(Object.fromEntries(new FormData(event.currentTarget))); setMessage(response.ok ? 'Đã tạo thông báo.' : response.error); if (response.ok) event.currentTarget.reset() } return <Shell title="Quản lý thông báo"><Notice text={message} /><form className={`${box} max-w-xl space-y-4`} onSubmit={submit}><label className="block text-sm">Tiêu đề<input className={field} required name="title" /></label><label className="block text-sm">Vai trò nhận<select className={field} name="role"><option value="student">Sinh viên</option><option value="company">Doanh nghiệp</option><option value="lecturer">Giảng viên</option><option value="admin">Nhà trường</option></select></label><label className="block text-sm">Nội dung<textarea className={field} required name="message" /></label><button className={button}>Gửi thông báo</button></form></Shell> }
export function AdminReportsPage() { const apps = getAllApplications(); const counts = ['02', '05', '10', '13', '15'].map((status) => apps.filter((item) => item.status === status).length); return <Shell title="Báo cáo thống kê"><div className={box}><p className="mb-4 text-sm">{apps.length} hồ sơ · {getRegistrations().filter((item) => item.status === 'Đã duyệt').length} doanh nghiệp mới được duyệt</p><div className="h-72"><Bar data={{ labels: ['Ứng tuyển', 'Đang xét', 'Chờ offer', 'Thực tập', 'Hoàn thành'], datasets: [{ label: 'Hồ sơ', data: counts, backgroundColor: '#34204f', hoverBackgroundColor: '#f0a044' }] }} options={{ maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } }} /></div></div></Shell> }
export function AdminApplicationsPage() { const [apps, setApps] = useState(getAllApplications()); const [message, setMessage] = useState(''); function advance(app) { const nextStatus = app.status === '02' ? '03' : '04'; const response = updateApplication(app.id, { status: nextStatus }, { action: nextStatus === '03' ? 'Xác nhận sinh viên đủ điều kiện' : 'Gửi hồ sơ tới doanh nghiệp' }); setMessage(response.ok ? 'Đã cập nhật hồ sơ.' : response.error); setApps(response.applications) } return <Shell title="Xác nhận hồ sơ ứng tuyển"><Notice text={message} /><div className="space-y-3">{apps.filter((app) => ['02', '03'].includes(app.status)).map((app) => <article className={`${box} flex flex-wrap items-center justify-between gap-3`} key={app.id}><div><b>{users.find((item) => item.id === app.studentId)?.name || `Sinh viên #${app.studentId}`}</b><p className="text-sm">Hồ sơ #{app.id} · Bước {app.status}</p></div><button className={button} onClick={() => advance(app)}>{app.status === '02' ? 'Xác nhận đủ điều kiện' : 'Gửi doanh nghiệp'}</button></article>)}</div></Shell> }
