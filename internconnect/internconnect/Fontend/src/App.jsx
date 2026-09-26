import { ArrowRight, CheckCircle2, ChevronRight, MapPin, Search, Sparkles, UsersRound } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import InternshipModal from './components/InternshipModal/InternshipModal'
import EmptyState from './components/EmptyState/EmptyState'
import internships from './data/internships.json'
import { applyForInternship } from './services/studentService'
import { getSession } from './services/mockAuth'
import { getAllApplications } from './services/applicationService'
import { getJobs, getRegistrations } from './services/companyService'
import { getCompany } from './services/companyService'

const processSteps = ['Đăng ký', 'Xác nhận hồ sơ', 'Gửi doanh nghiệp', 'Phỏng vấn', 'Trúng tuyển', 'Xác nhận', 'Thực tập', 'Đánh giá', 'Hoàn thành']

function JobCard({ internship, isSaved, onSave, onSelect }) {
  return <article className="home-job-card">
    <div className="flex items-start justify-between"><div className="home-logo">{internship.logo}</div><button className={`home-save ${isSaved ? 'saved' : ''}`} onClick={() => onSave(internship.id)} type="button" aria-label={isSaved ? 'Bỏ lưu cơ hội' : 'Lưu cơ hội'} aria-pressed={isSaved}>{isSaved ? '♥' : '♡'}</button></div>
    <h3>{internship.position}</h3><p className="company">{internship.company}</p><p className="location"><MapPin size={13} /> {internship.location}</p>
    <div className="home-tags">{internship.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
    <button className="home-detail" type="button" onClick={() => onSelect(internship)}>Xem chi tiết <ChevronRight size={14} /></button>
  </article>
}

function HomePage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const [saved, setSaved] = useState(() => { try { return JSON.parse(localStorage.getItem('internconnect_saved_opportunities')) || [] } catch { return [] } })
  const [message, setMessage] = useState('')
  const items = useMemo(() => {
    const search = query.trim().toLowerCase()
    if (!search) return internships
    return internships.filter((item) => `${item.company} ${item.position} ${item.tags.join(' ')}`.toLowerCase().includes(search))
  }, [query])
  function apply(id) { const session = getSession(); if (!session) { navigate(`/login?returnUrl=${encodeURIComponent(`/opportunities?job=${id}`)}`); return } const response = applyForInternship(id); setSelected(null); setMessage(response.ok ? 'Đã gửi hồ sơ ứng tuyển.' : response.error) }
  function toggleSaved(id) { setSaved((current) => { const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id]; localStorage.setItem('internconnect_saved_opportunities', JSON.stringify(next)); return next }) }

  return <div className="public-home"><Header /><main>
    {message && <div className="mx-auto max-w-7xl px-5 pt-4"><p className="rounded-lg bg-green-50 px-4 py-3 text-sm font-semibold text-green-700" role="status">{message}</p></div>}
    <section className="home-hero"><div className="mx-auto grid max-w-7xl items-center gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[1.1fr_.9fr] lg:px-10 lg:py-20"><div><span className="home-pill"><Sparkles size={13} /> Nền tảng kết nối thực tập</span><h1>Kết nối đúng <span>cơ hội.</span><br />Đồng hành trọn kỳ thực tập.</h1><p>InternConnect kết nối sinh viên, nhà trường và doanh nghiệp trên một nền tảng thống nhất, giúp bạn dễ dàng tìm kiếm, ứng tuyển và phát triển sự nghiệp.</p><div className="mt-5 flex flex-wrap gap-3"><Link className="public-primary-button" to="/login">Đăng ký thực tập</Link><Link className="public-outline-button" to="/opportunities">Khám phá cơ hội</Link></div><form className="home-search" onSubmit={(event) => { event.preventDefault(); navigate(`/opportunities?q=${encodeURIComponent(query)}`) }} role="search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm kiếm cơ hội thực tập..." aria-label="Tìm kiếm cơ hội thực tập" /><button type="submit">Tìm kiếm <ArrowRight size={15} /></button></form></div><div className="home-hero-art"><img className="home-hero-image" src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=85" alt="Nhóm đồng nghiệp cùng làm việc trong văn phòng" /><div className="home-art-card"><CheckCircle2 size={18} /> Hồ sơ được xác thực</div></div></div></section>
    <section className="home-stats mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">{[[new Set(getAllApplications().map((app) => app.studentId)).size, 'Sinh viên ứng tuyển'], [getRegistrations().filter((item) => item.status === 'Đã duyệt').length + 1, 'Doanh nghiệp đối tác'], [internships.length + getJobs().filter((item) => item.status === 'Đã xuất bản').length, 'Cơ hội thực tập'], [getAllApplications().filter((app) => app.status === '15').length, 'Hoàn thành']].map(([value, label]) => <div key={label}><b>{value}</b><span>{label}</span></div>)}</section>
    <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10"><div className="home-section-heading"><div><small>CHỌN VAI TRÒ</small><h2>Không gian dành cho bạn</h2></div></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[['Sinh viên', '/student/dashboard'], ['Doanh nghiệp', '/companies'], ['Nhà trường', '/admin/dashboard'], ['Giảng viên', '/lecturer/dashboard']].map(([label, href]) => <Link className="rounded-xl border border-[#dce9f7] bg-white p-5 text-sm font-bold text-[#0757c9]" to={href} key={label}>{label} →</Link>)}</div></section>
    <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10"><div className="home-section-heading"><div><small>KHÁM PHÁ CƠ HỘI</small><h2>Cơ hội thực tập nổi bật</h2><p>Tìm vị trí phù hợp với kỹ năng và định hướng của bạn.</p></div><Link to="/opportunities">Xem tất cả <ArrowRight size={15} /></Link></div>{items.length ? <div className="home-job-grid">{items.map((item) => <JobCard key={item.id} internship={item} isSaved={saved.includes(item.id)} onSave={toggleSaved} onSelect={setSelected} />)}</div> : <EmptyState onReset={() => setQuery('')} />}</section>
    <section className="home-process"><div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10"><div className="home-section-heading"><div><small>QUY TRÌNH MINH BẠCH</small><h2>Đồng hành cùng bạn trong suốt kỳ thực tập</h2></div></div><div className="home-process-row">{processSteps.map((step, index) => <div className="home-process-step" key={step}><span>{String(index + 1).padStart(2, '0')}</span><b>{step}</b>{index < processSteps.length - 1 && <i />}</div>)}</div></div></section>
    <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10"><div className="home-section-heading"><div><small>ĐỐI TÁC ĐỒNG HÀNH</small><h2>Doanh nghiệp đã duyệt</h2></div><Link to="/companies">Xem tất cả <ArrowRight size={15} /></Link></div><div className="home-partners">{[getCompany().name, ...getRegistrations().filter((item) => item.status === 'Đã duyệt').map((item) => item.name)].map((partner) => <div key={partner}>{partner}</div>)}</div></section>
  </main><Footer />{selected && <InternshipModal internship={selected} onClose={() => setSelected(null)} onApply={apply} />}</div>
}

export default HomePage
