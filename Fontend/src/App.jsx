import { ArrowRight, CheckCircle2, ChevronRight, MapPin, Search, Sparkles, UsersRound } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import InternshipModal from './components/InternshipModal/InternshipModal'
import EmptyState from './components/EmptyState/EmptyState'
import internships from './data/internships.json'
import { applyForInternship } from './services/studentService'

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
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const [saved, setSaved] = useState([])
  const [message, setMessage] = useState('')
  const items = useMemo(() => {
    const search = query.trim().toLowerCase()
    if (!search) return internships
    return internships.filter((item) => `${item.company} ${item.position} ${item.tags.join(' ')}`.toLowerCase().includes(search))
  }, [query])
  function apply(id) { applyForInternship(id); setSelected(null); setMessage('Đã gửi hồ sơ ứng tuyển mock. Hãy đăng nhập để theo dõi tiến trình.') }
  function toggleSaved(id) { setSaved((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]) }

  return <div className="public-home"><Header /><main>
    {message && <div className="mx-auto max-w-7xl px-5 pt-4"><p className="rounded-lg bg-green-50 px-4 py-3 text-sm font-semibold text-green-700" role="status">{message}</p></div>}
    <section className="home-hero"><div className="mx-auto grid max-w-7xl items-center gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[1.1fr_.9fr] lg:px-10 lg:py-20"><div><span className="home-pill"><Sparkles size={13} /> Nền tảng kết nối thực tập hàng đầu</span><h1>Kết nối đúng <span>cơ hội.</span><br />Đồng hành trọn kỳ thực tập.</h1><p>InternConnect kết nối sinh viên, nhà trường và doanh nghiệp trên một nền tảng thống nhất, giúp bạn dễ dàng tìm kiếm, ứng tuyển và phát triển sự nghiệp.</p><form className="home-search" onSubmit={(event) => event.preventDefault()} role="search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm kiếm cơ hội thực tập..." aria-label="Tìm kiếm cơ hội thực tập" /><button type="submit">Tìm kiếm <ArrowRight size={15} /></button></form></div><div className="home-hero-art"><div className="home-art-circle"><UsersRound size={100} /></div><div className="home-art-card"><CheckCircle2 size={18} /> Hồ sơ được xác thực</div></div></div></section>
    <section className="home-stats mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">{[['5,000+', 'Sinh viên đăng ký'], ['800+', 'Doanh nghiệp đối tác'], ['3,000+', 'Cơ hội thực tập'], ['95%', 'Hài lòng nền tảng']].map(([value, label]) => <div key={label}><b>{value}</b><span>{label}</span></div>)}</section>
    <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10"><div className="home-section-heading"><div><small>KHÁM PHÁ CƠ HỘI</small><h2>Cơ hội thực tập nổi bật</h2><p>Tìm vị trí phù hợp với kỹ năng và định hướng của bạn.</p></div><Link to="/opportunities">Xem tất cả <ArrowRight size={15} /></Link></div>{items.length ? <div className="home-job-grid">{items.map((item) => <JobCard key={item.id} internship={item} isSaved={saved.includes(item.id)} onSave={toggleSaved} onSelect={setSelected} />)}</div> : <EmptyState onReset={() => setQuery('')} />}</section>
    <section className="home-process"><div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10"><div className="home-section-heading"><div><small>QUY TRÌNH MINH BẠCH</small><h2>Đồng hành cùng bạn trong suốt kỳ thực tập</h2></div></div><div className="home-process-row">{processSteps.map((step, index) => <div className="home-process-step" key={step}><span>{String(index + 1).padStart(2, '0')}</span><b>{step}</b>{index < processSteps.length - 1 && <i />}</div>)}</div></div></section>
    <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10"><div className="home-section-heading"><div><small>ĐỐI TÁC ĐỒNG HÀNH</small><h2>Doanh nghiệp uy tín</h2></div><Link to="/companies">Xem tất cả <ArrowRight size={15} /></Link></div><div className="home-partners">{['FPT Software', 'VNG', 'Viettel', 'MB Bank', 'Tiki', 'Shopee', 'Lazada', 'Bosch'].map((partner) => <div key={partner}>{partner}</div>)}</div></section>
  </main><Footer />{selected && <InternshipModal internship={selected} onClose={() => setSelected(null)} onApply={apply} />}</div>
}

export default HomePage
