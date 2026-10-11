import { useCallback, useState } from 'react'
import useApiResource from '../../hooks/useApiResource'
import * as api from '../../api/adminApi'

const labels = { pending: 'Chờ duyệt', approved: 'Đã đăng', rejected: 'Từ chối', changes_requested: 'Yêu cầu chỉnh sửa' }
export default function AdminJobsPage() {
  const [status, setStatus] = useState('pending')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(null)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const loader = useCallback(() => api.jobs({ status, page, limit: 20 }), [status, page])
  const resource = useApiResource(loader, { items: [] })
  async function review(event) {
    event.preventDefault()
    setBusy(true)
    const form = event.currentTarget
    try {
      await api.reviewJob(selected.id, { decision: form.decision.value, note: form.note.value })
      setMessage('Đã lưu kết quả duyệt.')
      setSelected(null)
      resource.reload()
    } catch (error) { setMessage(error.response?.data?.error?.message || 'Không thể duyệt tin.') }
    finally { setBusy(false) }
  }
  return <section>
    <h1 className="text-2xl font-bold">Duyệt tin tuyển dụng</h1>
    {message && <p role="status" className="my-4">{message}</p>}
    <label>Trạng thái <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); setSelected(null) }}><option value="">Tất cả</option>{Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
    {resource.loading ? <p>Đang tải...</p> : resource.error ? <p role="alert">{resource.error}</p> : <div className="mt-4 space-y-4">{resource.data.items.length === 0 && <p>Không có tin trong danh sách.</p>}{resource.data.items.map(job => <article className="rounded-xl border bg-white p-5" key={job.id}>
      <h2 className="font-bold">{job.title}</h2><p>{job.company_name} · {labels[job.review_status]}{job.pending_revision && ' · Bản sửa của tin đã đăng'}</p>
      <dl className="my-3 text-sm"><dt>Địa điểm / hình thức</dt><dd>{job.location} / {job.work_mode}</dd><dt>Số lượng / hỗ trợ</dt><dd>{job.quantity} / {job.salary_min ?? '—'} – {job.salary_max ?? '—'}</dd><dt>Hạn ứng tuyển</dt><dd>{String(job.deadline).slice(0,10)}</dd><dt>Kỹ năng</dt><dd>{typeof job.skills === 'string' ? job.skills : (job.skills || []).join(', ')}</dd></dl>
      {[['Mô tả',job.description],['Yêu cầu',job.requirements],['Quyền lợi',job.benefits]].map(([label,value]) => <div key={label}><b>{label}</b><p className="whitespace-pre-wrap mb-3">{value || '—'}</p></div>)}
      {job.review_note && <p>Nhận xét: {job.review_note}</p>}
      {job.review_status === 'pending' && <button className="rounded bg-primary px-4 py-2 text-white" disabled={busy} onClick={() => setSelected(job)}>Xét duyệt</button>}
    </article>)}</div>}
    {selected && <form key={selected.id} className="my-4 rounded-xl border bg-white p-5" onSubmit={review}>
      <h2 className="font-bold">Xét duyệt: {selected.title}</h2>
      <label>Kết quả<select className="block my-3 border p-2" name="decision"><option value="approved">Duyệt và đăng</option><option value="rejected">Từ chối</option><option value="changes_requested">Yêu cầu chỉnh sửa</option></select></label>
      <label>Lý do / nhận xét (bắt buộc khi từ chối hoặc yêu cầu chỉnh sửa)<textarea className="block w-full border p-2" name="note" maxLength={5000}/></label>
      <button className="mt-3 rounded bg-primary px-4 py-2 text-white" disabled={busy}>Lưu kết quả</button><button type="button" className="ml-3" disabled={busy} onClick={() => setSelected(null)}>Hủy</button>
    </form>}
    {resource.data.pages > 1 && <nav className="mt-4 flex gap-3"><button disabled={page === 1 || resource.loading} onClick={() => setPage(p => p - 1)}>Trước</button><span>Trang {page} / {resource.data.pages}</span><button disabled={page >= resource.data.pages || resource.loading} onClick={() => setPage(p => p + 1)}>Sau</button></nav>}
  </section>
}
