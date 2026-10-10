import { useState } from 'react'
import { internships } from '../../services/dataSource'
import { INTERNSHIP_STATUSES } from '../../constants/internshipStatuses'
import StatusBadge from '../../components/ui/StatusBadge'
import { confirmOffer, getInterviews, respondInterview } from '../../services/interviewService'
import { createRecord, getRecords } from '../../services/internshipRecordService'
import { getReports, submitReport } from '../../services/reportService'
import { applyForInternship, getApplications, getStudent, saveStudent } from '../../services/studentService'
import { getSession } from '../../services/mockAuth'

const key = 'internconnect_student_notes'
function readNotes() { try { return JSON.parse(localStorage.getItem(key)) || [] } catch { return [] } }
function saveNotes(notes) { localStorage.setItem(key, JSON.stringify(notes)); return notes }

export function StudentProfilePage() {
  const [student, setStudent] = useState(getStudent())
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  function selectCvImage(event) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('CV phải là ảnh JPG, PNG hoặc WEBP.')
      event.target.value = ''
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Ảnh CV không được vượt quá 10 MB.')
      event.target.value = ''
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setStudent((current) => ({
        ...current,
        cv: {
          ...current.cv,
          name: file.name,
          imageData: reader.result,
          updatedAt: new Date().toISOString(),
        },
      }))
      setError('')
      setMessage('Ảnh CV đã được chọn. Hãy nhấn “Lưu thay đổi” để hoàn tất.')
    }
    reader.onerror = () => setError('Không thể đọc ảnh CV. Vui lòng chọn lại.')
    reader.readAsDataURL(file)
  }

  function removeCvImage() {
    setStudent((current) => ({ ...current, cv: { ...current.cv, name: '', imageData: '', updatedAt: '' } }))
    setError('')
    setMessage('Ảnh CV đã được gỡ. Hãy lưu thay đổi để hoàn tất.')
  }

  function submit(event) {
    event.preventDefault()
    try {
      saveStudent(student)
      setMessage('Đã lưu hồ sơ và ảnh CV.')
      setError('')
    } catch {
      setError('Không thể lưu ảnh CV. Hãy chọn ảnh có dung lượng nhỏ hơn.')
    }
  }

  return <Page title="Hồ sơ cá nhân & CV" description="Quản lý thông tin và CV dùng trong quá trình ứng tuyển.">
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <section className="rounded-xl border border-line bg-white p-6">
        <h2 className="text-lg font-bold text-ink">Thông tin cá nhân</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {[['fullName', 'Họ và tên'], ['email', 'Email'], ['phone', 'Số điện thoại'], ['major', 'Chuyên ngành'], ['className', 'Lớp']].map(([field, label]) => <label className="text-sm font-semibold text-ink" key={field}>{label}<input required value={student[field] || ''} onChange={(event) => setStudent({ ...student, [field]: event.target.value })} className="mt-2 w-full rounded-md border border-line px-3 py-2.5 font-normal" /></label>)}
        </div>
        <label className="mt-4 block text-sm font-semibold text-ink">Kỹ năng
          <input value={(student.skills || []).join(', ')} onChange={(event) => setStudent({ ...student, skills: event.target.value.split(',').map((value) => value.trim()).filter(Boolean) })} className="mt-2 w-full rounded-md border border-line px-3 py-2.5 font-normal" placeholder="ReactJS, JavaScript, SQL" />
        </label>
      </section>

      <section className="rounded-xl border border-line bg-white p-6">
        <h2 className="text-lg font-bold text-ink">CV của bạn</h2>
        <p className="mt-1 text-sm leading-5 text-muted">Tải lên ảnh CV mà bạn đã tự thiết kế.</p>
        <div className="mt-4 overflow-hidden rounded-lg border border-dashed border-[#b9cee8] bg-[#f8fbff]">
          {student.cv?.imageData ? <img className="max-h-[520px] w-full object-contain" src={student.cv.imageData} alt={`CV của ${student.fullName}`} /> : <div className="grid min-h-64 place-items-center px-6 text-center text-sm text-muted">Chưa có ảnh CV.<br />Chọn ảnh để xem trước tại đây.</div>}
        </div>
        {student.cv?.name && <p className="mt-3 truncate text-xs text-muted" title={student.cv.name}>Tệp: {student.cv.name}</p>}
        <label className="mt-4 block cursor-pointer rounded-md bg-primary px-4 py-3 text-center text-sm font-bold text-white hover:bg-primary">
          {student.cv?.imageData ? 'Thay ảnh CV' : 'Tải ảnh CV lên'}
          <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={selectCvImage} />
        </label>
        {student.cv?.imageData && <button className="mt-2 w-full rounded-md border border-red-200 px-4 py-2.5 text-sm font-bold text-red-600" type="button" onClick={removeCvImage}>Xóa ảnh CV</button>}
        <p className="mt-3 text-xs leading-5 text-[#91a2b7]">Hỗ trợ JPG, PNG, WEBP. Dung lượng tối đa 10 MB.</p>
      </section>

      <div className="lg:col-span-2">
        {error && <p className="mb-3 rounded-md bg-red-50 px-4 py-3 text-sm font-semibold text-red-600" role="alert">{error}</p>}
        {message && !error && <p className="mb-3 rounded-md bg-green-50 px-4 py-3 text-sm font-semibold text-green-700" role="status">{message}</p>}
        <button className="rounded-md bg-primary px-5 py-3 text-sm font-bold text-white" type="submit">Lưu thay đổi</button>
      </div>
    </form>
  </Page>
}

export function StudentOpportunitiesPage() {
  const [query, setQuery] = useState(''); const [applications, setApplications] = useState(getApplications()); const [message, setMessage] = useState('')
  const items = internships.filter((item) => `${item.company} ${item.position} ${item.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase())); const applied = new Set(applications.map((x) => x.internshipId))
  function apply(id) { const result = applyForInternship(id); setApplications(result.applications); setMessage(result.ok ? 'Đã gửi hồ sơ ứng tuyển.' : result.error) }
  return <Page title="Cơ hội thực tập" description="Tìm kiếm và ứng tuyển các vị trí phù hợp."><input className="mb-5 w-full rounded-lg border border-line bg-white px-4 py-3 text-sm" placeholder="Tìm công ty, vị trí hoặc kỹ năng..." value={query} onChange={(e) => setQuery(e.target.value)} />{message && <p className="mb-4 text-sm font-semibold text-green-600">{message}</p>}{items.length ? <div className="grid gap-4 md:grid-cols-2">{items.map((item) => <article className="rounded-xl border border-line bg-white p-5" key={item.id}><p className="text-xs text-muted">{item.company} · {item.location}</p><h2 className="mt-2 font-bold text-ink">{item.position}</h2><div className="mt-3 flex flex-wrap gap-2">{item.tags.map((tag) => <span className="rounded-full bg-[#edf4ff] px-2 py-1 text-xs text-[#4774b3]" key={tag}>{tag}</span>)}</div><button type="button" onClick={() => apply(item.id)} disabled={applied.has(item.id)} className="mt-5 rounded-md bg-primary px-4 py-2 text-sm font-bold text-white disabled:bg-slate-300">{applied.has(item.id) ? 'Đã ứng tuyển' : 'Ứng tuyển ngay'}</button></article>)}</div> : <Empty title="Chưa có cơ hội thực tập" text="Dữ liệu sẽ hiển thị tại đây sau khi hệ thống kết nối API." />}</Page>
}

export function StudentApplicationsPage() { const [apps, setApps] = useState(getApplications()); const [message, setMessage] = useState(''); function offer(id, accepted) { const reason = accepted ? '' : window.prompt('Lý do từ chối đề nghị thực tập?') || ''; const response = confirmOffer(id, accepted, reason); setMessage(response.ok ? 'Đã cập nhật đề nghị.' : response.error); setApps(response.applications) } return <Page title="Quản lý ứng tuyển" description="Theo dõi toàn bộ hồ sơ và lịch sử xử lý."><div className="space-y-4">{message && <p role="status" className="text-sm text-primary">{message}</p>}{apps.filter((app) => app.studentId === getSession()?.id).map((app) => { const item = internships.find((x) => x.id === app.internshipId); const current = INTERNSHIP_STATUSES.findIndex((x) => x.id === app.status); const canConfirm = app.status === '10' && app.recruitmentResult === 'passed' && !app.closureReason; return <article className="rounded-xl border border-line bg-white p-5" key={app.id}><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-bold text-ink">{item?.position || 'Vị trí thực tập'} · {item?.company || 'Doanh nghiệp'}</h2><p className="mt-1 text-xs text-muted">Mã hồ sơ: #{app.id} · {app.closureReason ? `Đã đóng: ${app.closureReason}` : 'Đang xử lý'}</p></div><StatusBadge status={app.status} /></div>{canConfirm && <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-green-50 p-4"><p className="text-sm font-semibold text-green-700">Bạn đã trúng tuyển. Xác nhận nhận thực tập để chuyển sang bước tiếp theo.</p><div className="flex gap-2"><button className="rounded-md border border-red-200 px-3 py-2 text-xs font-bold text-red-600" type="button" onClick={() => offer(app.id, false)}>Từ chối</button><button className="rounded-md bg-[#0aa46e] px-3 py-2 text-xs font-bold text-white" type="button" onClick={() => offer(app.id, true)}>Nhận thực tập</button></div></div>}<div className="mt-4 flex gap-2 overflow-x-auto pb-2">{INTERNSHIP_STATUSES.map((status, index) => <span className={`shrink-0 rounded-md px-2 py-1 text-xs ${index <= current ? 'bg-[#dcecff] font-bold text-primary' : 'bg-slate-100 text-slate-500'}`} key={status.id}>{status.id}. {status.label}</span>)}</div></article>})}</div></Page> }

export function StudentInterviewsPage() { const [interviews, setInterviews] = useState(getInterviews()); const [message, setMessage] = useState(''); function respond(id, accepted) { const reason = accepted ? '' : window.prompt('Lý do từ chối lịch phỏng vấn?') || ''; const response = respondInterview(id, accepted, reason); setInterviews(response.interviews); setMessage(response.ok ? 'Đã cập nhật lịch.' : response.error) } const rows = interviews.filter((item) => item.studentId === getSession()?.id); return <Page title="Lịch phỏng vấn" description="Theo dõi và xác nhận lịch phỏng vấn do doanh nghiệp gửi."><div className="space-y-4">{message && <p role="status">{message}</p>}{rows.length ? rows.map((interview) => <article className="flex flex-wrap items-center justify-between gap-5 rounded-xl border border-line bg-white p-5" key={interview.id}><div><p className="text-sm font-bold text-muted">{interview.date} · {interview.time}</p><h2 className="mt-2 font-bold text-ink">Hồ sơ #{interview.applicationId}</h2><p className="mt-1 text-sm text-muted">{interview.mode} · {interview.location}</p></div><div className="flex items-center gap-2">{interview.status === 'Chờ sinh viên xác nhận' ? <><button className="rounded-md border border-red-200 px-3 py-2 text-sm font-bold text-red-600" type="button" onClick={() => respond(interview.id, false)}>Từ chối</button><button className="rounded-md bg-primary px-3 py-2 text-sm font-bold text-white" type="button" onClick={() => respond(interview.id, true)}>Xác nhận lịch</button></> : <span className="status-badge info">{interview.status}</span>}</div></article>) : <Empty title="Chưa có lịch phỏng vấn" text="Khi doanh nghiệp mời phỏng vấn, lịch sẽ hiển thị tại đây." />}</div></Page> }
export function StudentInternshipPage() { const [records, setRecords] = useState(getRecords()); const [message, setMessage] = useState(''); const mine = records.filter((item) => item.studentId === getSession()?.id); const application = getApplications().find((item) => item.studentId === getSession()?.id && item.status === '11' && item.offerDecision === 'accepted'); function create() { const response = createRecord(application); setRecords(response.records); setMessage(response.ok ? 'Đã gửi hồ sơ cho nhà trường.' : response.error) } return <Page title="Hồ sơ thực tập" description="Theo dõi doanh nghiệp, giảng viên hướng dẫn và tiến độ thực tập."><div className="space-y-4">{message && <p role="status">{message}</p>}{mine.map((record) => <article className="rounded-xl border border-line bg-white p-6" key={record.id}><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm text-muted">{record.period || 'Chờ xác nhận kỳ'}</p><h2 className="mt-2 text-xl font-bold text-ink">{record.position}</h2><p className="mt-1 text-sm text-muted">{record.company} · GV hướng dẫn: {record.lecturer || 'Chờ phân công'}</p></div><span className="status-badge info">{record.status}</span></div></article>)}{!mine.length && application && <div className="rounded-xl border border-[#b9d8f4] bg-white p-6"><h2 className="font-bold text-ink">Bạn đã xác nhận nhận thực tập</h2><p className="mt-2 text-sm text-muted">Hãy tạo hồ sơ thực tập để nhà trường xác nhận kỳ và nơi thực tập.</p><button type="button" onClick={create} className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-bold text-white">Tạo hồ sơ thực tập</button></div>}{!mine.length && !application && <Empty title="Chưa có hồ sơ thực tập" text="Hồ sơ sẽ được tạo sau khi bạn xác nhận nhận offer." />}</div></Page> }
export function StudentDiaryPage() { const [notes, setNotes] = useState(readNotes()); const [text, setText] = useState(''); const active = getRecords().find((record) => record.studentId === getSession()?.id && record.status === 'Đang thực tập'); function add(e) { e.preventDefault(); if (!text.trim() || !active) return; setNotes(saveNotes([{ id: Date.now(), studentId: getSession().id, applicationId: active.applicationId, date: new Date().toLocaleDateString('vi-VN'), text }, ...notes])); setText('') } return <Page title="Nhật ký thực tập" description="Ghi nhận công việc và nhận xét trong quá trình thực tập.">{active ? <><form onSubmit={add} className="rounded-xl border border-line bg-white p-5"><label className="text-sm">Nội dung tuần<textarea required className="mt-2 min-h-32 w-full rounded-md border border-line p-3 text-sm" value={text} onChange={(e) => setText(e.target.value)} /></label><button className="mt-3 rounded-md bg-primary px-4 py-2 text-sm font-bold text-white" type="submit">Lưu nhật ký</button></form><div className="mt-5 space-y-3">{notes.filter((note) => note.studentId === getSession()?.id).map((note) => <article className="rounded-lg border border-line bg-white p-4" key={note.id}><p className="text-sm font-bold text-muted">{note.date}</p><p className="mt-2 text-sm text-ink">{note.text}</p>{note.feedback && <p className="text-sm">Nhận xét: {note.feedback}</p>}</article>)}</div></> : <Empty title="Chưa thể ghi nhật ký" text="Bạn chỉ có thể ghi nhật ký khi đang thực tập." />}</Page> }
export function StudentReportsPage() { const [reports, setReports] = useState(getReports()); const [fileName, setFileName] = useState(''); const [message, setMessage] = useState(''); const application = getApplications().find((item) => item.studentId === getSession()?.id && item.status === '13'); function submit(event) { event.preventDefault(); const response = submitReport({ applicationId: application?.id, name: fileName }); setReports(response.reports); setMessage(response.ok ? 'Đã nộp báo cáo.' : response.error) } return <Page title="Báo cáo thực tập" description="Nộp báo cáo tổng kết và theo dõi phản hồi từ giảng viên.">{message && <p role="status">{message}</p>}{application && <form onSubmit={submit} className="rounded-xl border border-line bg-white p-6"><h2 className="font-bold text-ink">Nộp báo cáo</h2><label className="mt-4 block text-sm">Chọn tệp PDF/DOCX<input className="mt-2 block w-full rounded-md border border-line p-3 text-sm" type="file" accept=".pdf,.doc,.docx" onChange={(e) => setFileName(e.target.files?.[0]?.name || '')} /></label><button className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-bold text-white disabled:bg-slate-300" disabled={!fileName} type="submit">Nộp báo cáo</button></form>}<div className="mt-5 space-y-3">{reports.filter((item) => item.studentId === getSession()?.id).map((report) => <article className="rounded-xl border border-line bg-white p-5" key={report.id}><h3 className="font-bold text-ink">{report.name}</h3><p className="text-sm">Phiên bản {report.version} · {report.status}</p>{report.feedback && <p className="text-sm">Phản hồi: {report.feedback}</p>}</article>)}</div></Page> }

function Page({ title, description, children }) { return <section><div className="dashboard-page-heading"><div><p className="dashboard-eyebrow">KHU VỰC SINH VIÊN</p><h1>{title}</h1><p>{description}</p></div><span className="dashboard-chip">Đã đồng bộ</span></div>{children}</section> }
function Empty({ title, text }) { return <div className="rounded-xl border border-dashed border-[#b9cee8] bg-white p-10 text-center"><h2 className="font-bold text-ink">{title}</h2><p className="mt-2 text-sm text-muted">{text}</p></div> }
