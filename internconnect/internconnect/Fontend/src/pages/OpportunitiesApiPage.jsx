import { useCallback, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { ArrowRight, Bookmark, CalendarDays, MapPin, Search, BriefcaseBusiness } from 'lucide-react'
import { PublicLayout, PageHero, ResourceState } from '../components/ui/PageUI'
import Modal from '../components/ui/Modal'
import useApiResource from '../hooks/useApiResource'
import { listJobs, getJob } from '../api/publicApi'
import { getSession } from '../services/sessionService'
import { saveJob } from '../api/studentApi'
import { formatDate, initials, salaryLabel, workModes } from '../utils/display'
function JobDetails({ id }) {
  const loader = useCallback(() => getJob(id), [id]), r = useApiResource(loader, {})
  const session = getSession()
  const target = `/student/opportunities?job=${id}`
  return <ResourceState resource={r}><div className="job-detail"><div className="flex gap-4 items-center"><span className="company-logo">{initials(r.data.company_name)}</span><div><h3>{r.data.title}</h3><p className="muted">{r.data.company_name}</p></div></div><div className="job-detail-meta"><span><MapPin size={16} />{r.data.location || 'Chưa cập nhật'}</span><span><BriefcaseBusiness size={16} />{workModes[r.data.work_mode]}</span><span><CalendarDays size={16} />Hạn {formatDate(r.data.deadline)}</span></div><p className="job-salary">{salaryLabel(r.data.salary_min, r.data.salary_max)}</p>{[['description','Mô tả công việc'],['requirements','Yêu cầu ứng viên'],['benefits','Quyền lợi']].map(([key,title]) => r.data[key] && <section key={key}><h4>{title}</h4><p>{r.data[key]}</p></section>)}<Link className="button button-primary mt-6" to={session?.role === 'student' ? target : session ? `/${session.role}/dashboard` : `/login?returnUrl=${encodeURIComponent(target)}`}>{session && session.role !== 'student' ? 'Vào không gian làm việc' : 'Ứng tuyển vị trí này'}<ArrowRight size={16} /></Link></div></ResourceState>
}
export default function OpportunitiesPage() {
  const [params, setParams] = useSearchParams(), query = params.get('q') || '', page = Math.max(1, Number(params.get('page')) || 1)
  const [draft, setDraft] = useState(query), [notice, setNotice] = useState(''), [saving, setSaving] = useState(null)
  const loader = useCallback(() => listJobs({ search: query, page, limit: 12 }), [query,page]), resource = useApiResource(loader, { items: [], total: 0, pages: 0 })
  function update(key,value) { const next = new URLSearchParams(params); if (value) next.set(key,String(value)); else next.delete(key); setParams(next) }
  function search(e) { e.preventDefault(); const next = new URLSearchParams(params); next.set('q',draft.trim()); next.delete('page'); setParams(next) }
  async function save(id) {
    setSaving(id)
    try { await saveJob(id); setNotice('Đã lưu cơ hội vào hồ sơ của bạn.') } catch (error) { setNotice(error.response?.data?.error?.message || 'Không thể lưu cơ hội. Vui lòng thử lại.') } finally { setSaving(null) }
  }
  const session = getSession()
  return <PublicLayout><PageHero eyebrow="CƠ HỘI THỰC TẬP" title="Bước đầu cho hành trình lớn." description="Khám phá vị trí phù hợp với kỹ năng và định hướng của bạn. Đọc kỹ yêu cầu trước khi ứng tuyển." /><div className="site-container section-space"><form className="content-toolbar" onSubmit={search}><div className="search-field"><Search size={20} /><input aria-label="Tìm cơ hội thực tập" placeholder="Vị trí, kỹ năng hoặc doanh nghiệp…" value={draft} onChange={e => setDraft(e.target.value)} /></div><button className="button button-primary">Tìm kiếm <ArrowRight size={16} /></button></form><div className="section-heading"><h2>{query ? `Kết quả cho “${query}”` : 'Vị trí đang tuyển'}</h2><span>{resource.data.total || 0} cơ hội</span></div>{notice && <p role="status" className="notice mb-5">{notice}</p>}<ResourceState resource={resource} emptyTitle="Chưa tìm thấy cơ hội phù hợp" emptyDescription="Thử từ khóa khác hoặc quay lại khi có vị trí mới."><div className="jobs-grid">{resource.data.items.map(job => <article className="job-card" key={job.id}><div className="flex w-full justify-between gap-3"><span className="company-logo">{initials(job.company_name)}</span><span className="tag">{workModes[job.work_mode]}</span></div><h3>{job.title}</h3><p className="text-sm text-muted mb-3">{job.company_name}</p><p className="job-location"><MapPin size={15} />{job.location || 'Chưa cập nhật'}</p><p className="job-salary">{salaryLabel(job.salary_min,job.salary_max)}</p><p className="text-xs text-muted mt-3">Hạn {formatDate(job.deadline)}</p><div className="job-footer"><button className="text-link" onClick={() => update('job',job.id)}>Xem chi tiết <ArrowRight size={15} /></button>{session?.role === 'student' ? <button className="icon-button" aria-label={`Lưu ${job.title}`} disabled={saving === job.id} onClick={() => save(job.id)}><Bookmark size={18} /></button> : !session ? <Link className="icon-button" aria-label={`Đăng nhập để lưu ${job.title}`} to={`/login?returnUrl=${encodeURIComponent('/opportunities')}`}><Bookmark size={18} /></Link> : null}</div></article>)}</div></ResourceState>{resource.data.pages > 1 && <nav className="pagination" aria-label="Phân trang cơ hội"><button className="button button-secondary" disabled={page <= 1 || resource.loading} onClick={() => update('page',page - 1)}>Trang trước</button><span>Trang {page} / {resource.data.pages}</span><button className="button button-secondary" disabled={page >= resource.data.pages || resource.loading} onClick={() => update('page',page + 1)}>Trang sau</button></nav>}</div>{params.get('job') && <Modal title="Chi tiết cơ hội thực tập" onClose={() => update('job','')}><JobDetails id={params.get('job')} /></Modal>}</PublicLayout>
}
