import { useCallback, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { ArrowRight, Search, Bookmark, MapPin } from 'lucide-react'
import useApiResource from '../../hooks/useApiResource'
import { ResourceState, EmptyState } from '../../components/ui/PageUI'
import Modal from '../../components/ui/Modal'
import { listJobs, getJob } from '../../api/publicApi'
import * as api from '../../api/studentApi'
import { foldText, formatDate, initials, salaryLabel, workModes } from '../../utils/display'
export default function StudentOpportunitiesPage() {
  const [params,setParams] = useSearchParams(), [query,setQuery] = useState(''), [notice,setNotice] = useState(''), [busy,setBusy] = useState(false)
  const jobsLoader = useCallback(() => listJobs({ limit: 100 }).then(x => x.items), [])
  const cvLoader = useCallback(() => api.getCvs(), []), periodLoader = useCallback(() => api.getPeriods(), [])
  const jobs = useApiResource(jobsLoader, []), cvs = useApiResource(cvLoader, []), periods = useApiResource(periodLoader, [])
  const applicationsLoader = useCallback(() => api.getApplications(), [])
  const applications = useApiResource(applicationsLoader, [])
  const [periodId,setPeriodId] = useState('')
  const id = params.get('job')
  const selectedPeriod = periodId || String(periods.data[0]?.id || '')
  const existingApplication = applications.data.find(x => String(x.job_id) === id && String(x.internship_period_id) === selectedPeriod)
  const detailLoader = useCallback(() => id ? getJob(id) : Promise.resolve(null), [id])
  const detail = useApiResource(detailLoader, null)
  const close = useCallback(() => setParams({}), [setParams])
  const filtered = jobs.data.filter(x => foldText(`${x.title} ${x.company_name} ${x.location}`).includes(foldText(query)))
  async function apply(event) {
    event.preventDefault(); if (busy) return; setBusy(true)
    const values = Object.fromEntries(new FormData(event.currentTarget))
    try { await api.applyJob(id,{cvId:Number(values.cvId),internshipPeriodId:Number(values.periodId),coverLetter:values.coverLetter}); setNotice('Đã gửi hồ sơ. Bạn có thể theo dõi kết quả tại mục Ứng tuyển.'); applications.reload(); close() } catch (e) { setNotice(e.response?.data?.error?.message || 'Không thể gửi hồ sơ.') ; applications.reload() } finally { setBusy(false) }
  }
  async function save(id) { try { await api.saveJob(id); setNotice('Đã lưu cơ hội.') } catch (e) { setNotice(e.response?.data?.error?.message || 'Không thể lưu cơ hội.') } }
  return <section><div className="dashboard-page-heading"><div><p className="eyebrow">KHÁM PHÁ & ỨNG TUYỂN</p><h1>Cơ hội thực tập</h1><p>Chọn vị trí phù hợp với định hướng và kỹ năng của bạn.</p></div></div>{notice && <p role="status" className="notice mb-5">{notice}</p>}<div className="search-field mb-6"><Search size={19} /><input placeholder="Tìm vị trí, doanh nghiệp hoặc địa điểm…" aria-label="Tìm cơ hội" value={query} onChange={e => setQuery(e.target.value)} /></div><ResourceState resource={jobs} emptyTitle="Chưa có vị trí đang tuyển">{filtered.length ? <div className="jobs-grid">{filtered.map(job => <article className="job-card" key={job.id}><div className="flex items-center gap-3"><span className="company-logo">{initials(job.company_name)}</span><div><span className="tag">{workModes[job.work_mode]}</span><p className="muted text-xs mt-1">{job.company_name}</p></div></div><h3>{job.title}</h3><p className="job-location"><MapPin size={15} />{job.location || 'Chưa cập nhật'}</p><p className="job-salary">{salaryLabel(job.salary_min,job.salary_max)}</p><p className="text-xs muted mt-3">Hạn {formatDate(job.deadline)}</p><div className="job-footer"><button className="text-link" onClick={() => setParams({job:String(job.id)})}>Ứng tuyển <ArrowRight size={15} /></button><button className="icon-button" aria-label={`Lưu ${job.title}`} onClick={() => save(job.id)}><Bookmark size={18} /></button></div></article>)}</div> : <EmptyState title="Không có kết quả phù hợp" description="Thử tìm kiếm bằng từ khóa khác." />}</ResourceState>{id && <Modal title="Ứng tuyển thực tập" onClose={close}><ResourceState resource={detail}>{detail.data && <><h3 className="text-xl font-bold">{detail.data.title}</h3><p className="muted mt-2">{detail.data.company_name}</p><p className="application-description">{detail.data.description}</p>{notice && <p role="status" className="notice mb-5">{notice}</p>}{cvs.loading || periods.loading || applications.loading ? <p>Đang tải CV và kỳ thực tập…</p> : cvs.error || periods.error || applications.error ? <p role="alert">{cvs.error || periods.error || applications.error}</p> : !cvs.data.length || !periods.data.length ? <EmptyState title={!cvs.data.length ? 'Bạn cần chuẩn bị CV' : 'Chưa có kỳ thực tập để đăng ký'} description={!cvs.data.length ? 'Tải CV lên hồ sơ cá nhân trước khi ứng tuyển.' : 'Liên hệ nhà trường để kiểm tra thời gian đăng ký.'} to={!cvs.data.length ? '/student/profile' : '/contact'} action={!cvs.data.length ? 'Chuẩn bị CV' : 'Xem hỗ trợ'} /> : <form className="application-form" onSubmit={apply}>{existingApplication&&<p role="status" className="notice">Bạn đã ứng tuyển vị trí này trong kỳ đã chọn. <Link className="text-link" to="/student/applications">Xem hồ sơ đã gửi</Link></p>}<label>Chọn CV<select name="cvId" required defaultValue={cvs.data.find(x => x.is_default)?.id}>{cvs.data.map(x => <option value={x.id} key={x.id}>{x.name}{x.is_default ? ' · Mặc định' : ''}</option>)}</select></label><label>Kỳ thực tập<select name="periodId" required value={selectedPeriod} onChange={event=>setPeriodId(event.target.value)}>{periods.data.map(x => <option value={x.id} key={x.id}>{x.name}</option>)}</select></label><label>Thư giới thiệu <span className="muted font-normal">(không bắt buộc)</span><textarea name="coverLetter" rows={4} placeholder="Giới thiệu ngắn về bản thân và lý do bạn phù hợp." /></label><div className="flex flex-wrap gap-3"><button disabled={busy || Boolean(existingApplication)} className="button button-primary">{busy ? 'Đang gửi…' : 'Gửi hồ sơ ứng tuyển'}<ArrowRight size={16} /></button><button type="button" className="button button-secondary" disabled={busy} onClick={close}>Hủy</button></div></form>}</>}</ResourceState></Modal>}</section>
}
