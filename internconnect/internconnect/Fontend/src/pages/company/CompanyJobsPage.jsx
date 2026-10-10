import { useCallback, useState } from 'react'
import useApiResource from '../../hooks/useApiResource'
import LoadingState from '../../components/ui/LoadingState'
import { confirmAction } from '../../utils/confirmAction'
import * as api from '../../api/companyApi'

const box = 'rounded-xl border border-line bg-white p-5'
const field = 'mt-2 w-full rounded-md border border-line px-3 py-2.5'
const button = 'rounded-md bg-primary px-4 py-2 text-sm font-bold text-white disabled:bg-slate-300'

function skillsValue(value) {
  if (Array.isArray(value)) return value.join(', ')
  try { return JSON.parse(value || '[]').join(', ') } catch { return value || '' }
}

function formValue(form) {
  return {
    title: form.title.value,
    description: form.description.value,
    requirements: form.requirements.value,
    benefits: form.benefits.value,
    location: form.location.value,
    workMode: form.workMode.value,
    salaryMin: form.salaryMin.value ? Number(form.salaryMin.value) : null,
    salaryMax: form.salaryMax.value ? Number(form.salaryMax.value) : null,
    quantity: Number(form.quantity.value),
    skills: form.skills.value.split(',').map((item) => item.trim()).filter(Boolean),
    deadline: form.deadline.value,
  }
}

export default function CompanyJobsPage({ create = false }) {
  const [page, setPage] = useState(1)
  const loader = useCallback(() => api.getJobs({ page, limit: 20 }), [page])
  const resource = useApiResource(loader, { items: [] })
  const [editor, setEditor] = useState(create ? {} : null)
  const [message, setMessage] = useState('')

  async function submit(event) {
    event.preventDefault()
    try {
      if (editor.id) await api.updateJob(editor.id, formValue(event.currentTarget))
      else await api.createJob(formValue(event.currentTarget))
      setMessage(editor.id ? 'Đã cập nhật tin tuyển dụng.' : 'Đã tạo bản nháp.')
      setEditor(null)
      resource.reload()
    } catch (error) { setMessage(error.response?.data?.error?.message || 'Không thể lưu tin tuyển dụng.') }
  }

  async function changeStatus(job, action) {
    if (action === 'close' && !await confirmAction({ title: 'Đóng tin tuyển dụng?', text: 'Tin sẽ ngừng nhận hồ sơ mới.', confirmText: 'Đóng tin' })) return
    try {
      await (action === 'publish' ? api.publishJob(job.id) : api.closeJob(job.id))
      setMessage(action === 'publish' ? 'Đã xuất bản tin.' : 'Đã đóng tin.')
      resource.reload()
    } catch (error) { setMessage(error.response?.data?.error?.message || 'Không cập nhật được tin.') }
  }

  return <section>
    <div className="dashboard-page-heading"><div><p className="dashboard-eyebrow">KHU VỰC DOANH NGHIỆP</p><h1>Tin tuyển dụng</h1></div><span className="dashboard-chip">Không gian làm việc</span></div>
    {message && <p role="status" className="mb-4 rounded bg-blue-50 p-3 text-sm">{message}</p>}
    <button className={button} onClick={() => setEditor({})}>Tạo tin mới</button>
    {editor && <form key={editor.id || 'new'} className={`${box} mt-4 grid gap-4 md:grid-cols-2`} onSubmit={submit}>
      {[['title','Tiêu đề'],['location','Địa điểm'],['salaryMin','Mức hỗ trợ tối thiểu (đ)'],['salaryMax','Mức hỗ trợ tối đa (đ)'],['quantity','Số lượng'],['skills','Kỹ năng'],['deadline','Hạn ứng tuyển']].map(([name,label]) => <label className="text-sm" key={name}>{label}<input className={field} name={name} type={name === 'deadline' ? 'date' : ['salaryMin','salaryMax','quantity'].includes(name) ? 'number' : 'text'} min={name === 'quantity' ? 1 : ['salaryMin','salaryMax'].includes(name) ? 0 : undefined} defaultValue={name === 'skills' ? skillsValue(editor.skills) : name === 'deadline' ? String(editor.deadline || '').slice(0,10) : editor[{ salaryMin: 'salary_min', salaryMax: 'salary_max' }[name] || name] ?? ''} required={['title','quantity','deadline'].includes(name)}/></label>)}
      <label className="text-sm">Hình thức<select className={field} name="workMode" defaultValue={editor.work_mode || 'onsite'}><option value="onsite">Tại văn phòng</option><option value="hybrid">Hybrid</option><option value="remote">Remote</option></select></label>
      <label className="text-sm md:col-span-2">Mô tả<textarea className={field} name="description" defaultValue={editor.description || ''} required/></label>
      <label className="text-sm">Yêu cầu<textarea className={field} name="requirements" defaultValue={editor.requirements || ''}/></label>
      <label className="text-sm">Quyền lợi<textarea className={field} name="benefits" defaultValue={editor.benefits || ''}/></label>
      <div className="flex gap-2 md:col-span-2"><button className={button}>{editor.id ? 'Lưu thay đổi' : 'Lưu bản nháp'}</button><button type="button" onClick={() => setEditor(null)}>Hủy</button></div>
    </form>}
    {resource.loading ? <LoadingState/> : resource.error ? <p role="alert">{resource.error}</p> : resource.data.items.length === 0 ? <p className={`${box} mt-4`}>Chưa có tin tuyển dụng.</p> : <div className="mt-5 space-y-3">{resource.data.items.map((job) => <article className={box} key={job.id}><div className="flex flex-wrap justify-between gap-3"><div><b>{job.title}</b><p className="text-sm">{job.location} · {job.status}</p></div><div className="flex flex-wrap gap-2">{job.status === 'draft' && <><button className="rounded-md border px-3" onClick={() => setEditor(job)}>Chỉnh sửa</button><button className={button} onClick={() => changeStatus(job,'publish')}>Xuất bản</button></>}{job.status === 'published' && <button className="rounded-md border px-3" onClick={() => changeStatus(job,'close')}>Đóng tin</button>}</div></div></article>)}</div>}
    {resource.data.pages > 1 && <nav className="pagination" aria-label="Phân trang tin tuyển dụng"><button className="button button-secondary" disabled={page === 1 || resource.loading} onClick={() => setPage(x => x - 1)}>Trước</button><span>Trang {page} / {resource.data.pages}</span><button className="button button-secondary" disabled={page >= resource.data.pages || resource.loading} onClick={() => setPage(x => x + 1)}>Sau</button></nav>}
  </section>
}
