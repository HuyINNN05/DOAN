import { Link } from 'react-router'
import { useState } from 'react'
import Header from '../components/Header/Header'
import Footer from '../components/Footer/Footer'
import internships from '../data/internships.json'

function OpportunitiesPage() {
  const [query, setQuery] = useState('')
  const items = internships.filter((item) => `${item.company} ${item.position} ${item.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase()))
  return <><Header activeItem="Cơ hội thực tập" /><main className="public-page"><section className="public-list-hero"><div className="mx-auto max-w-6xl"><Link to="/" className="text-sm font-bold text-[#0757c9]">← Trang chủ</Link><h1 className="mt-5 text-4xl font-extrabold text-[#123a8b]">Cơ hội thực tập</h1><p className="mt-2 max-w-xl text-sm leading-6 text-[#6684a8]">Khám phá những vị trí thực tập chất lượng từ các doanh nghiệp uy tín, phù hợp với kỹ năng và định hướng nghề nghiệp của bạn.</p><div className="public-search-box"><SearchIcon /><input placeholder="Tìm theo vị trí, công ty hoặc kỹ năng..." value={query} onChange={(e) => setQuery(e.target.value)} /><button type="button">Tìm kiếm</button></div></div></section><section className="mx-auto max-w-6xl px-5 py-10 sm:px-8"><div className="mb-6 flex items-end justify-between"><div><p className="public-eyebrow">KHÁM PHÁ CƠ HỘI</p><h2 className="text-2xl font-extrabold text-[#123a8b]">Tìm thấy {items.length} cơ hội phù hợp</h2></div><select className="rounded-md border border-[#d8e3f0] bg-white px-3 py-2 text-xs font-semibold text-[#526b8d]"><option>Sắp xếp: Mới nhất</option></select></div><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{items.map((item) => <article className="public-job-card" key={item.id}><div className="flex items-start justify-between"><div className="public-company-logo">{item.logo}</div><span className="public-bookmark">♡</span></div><h2 className="mt-4 font-bold text-[#173b83]">{item.position}</h2><p className="mt-1 text-sm text-[#7890ad]">{item.company} · {item.location}</p><div className="mt-4 flex flex-wrap gap-2">{item.tags.map((tag) => <span className="public-tag" key={tag}>{tag}</span>)}</div><div className="mt-5 flex items-center justify-between border-t border-[#edf2f7] pt-4"><span className="text-xs font-semibold text-[#14a675]">● Đang tuyển</span><Link to="/login" className="text-xs font-bold text-[#0757c9]">Xem chi tiết →</Link></div></article>)}</div></section></main><Footer /></>
}

function SearchIcon() { return <span className="text-[#7890ad]">⌕</span> }

export default OpportunitiesPage
