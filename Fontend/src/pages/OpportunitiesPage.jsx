import { Link } from 'react-router'
import { useState } from 'react'
import Header from '../components/Header/Header'
import Footer from '../components/Footer/Footer'
import internships from '../data/internships.json'

function OpportunitiesPage() {
  const [query, setQuery] = useState('')
  const items = internships.filter((item) => `${item.company} ${item.position} ${item.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase()))
  return <><Header activeItem="Cơ hội thực tập" /><main className="min-h-screen bg-[#f7faff] px-5 py-10 sm:px-8 lg:px-12"><div className="mx-auto max-w-6xl"><Link to="/" className="text-sm font-bold text-[#0757c9]">← Trang chủ</Link><h1 className="mt-4 text-3xl font-extrabold text-[#172d50]">Cơ hội thực tập</h1><p className="mt-2 text-sm text-[#7890ad]">Khám phá các vị trí phù hợp với kỹ năng và định hướng của bạn.</p><input className="mt-6 w-full max-w-xl rounded-lg border border-[#d8e3f0] bg-white px-4 py-3 text-sm outline-none focus:border-[#0757c9]" placeholder="Tìm công ty, vị trí hoặc kỹ năng..." value={query} onChange={(e) => setQuery(e.target.value)} /><div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{items.map((item) => <article className="rounded-xl border border-[#e1eaf5] bg-white p-5 shadow-sm" key={item.id}><div className="grid size-10 place-items-center rounded-lg bg-[#edf4ff] text-sm font-extrabold text-[#0757c9]">{item.logo}</div><h2 className="mt-4 font-bold text-[#172d50]">{item.position}</h2><p className="mt-1 text-sm text-[#7890ad]">{item.company} · {item.location}</p><div className="mt-4 flex flex-wrap gap-2">{item.tags.map((tag) => <span className="rounded-full bg-[#edf4ff] px-2 py-1 text-xs text-[#4774b3]" key={tag}>{tag}</span>)}</div><Link to="/login" className="mt-5 inline-block rounded-md bg-[#0757c9] px-4 py-2 text-sm font-bold text-white">Đăng nhập để ứng tuyển</Link></article>)}</div></div></main><Footer /></>
}

export default OpportunitiesPage
