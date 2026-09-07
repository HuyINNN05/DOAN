import { Link, useNavigate } from 'react-router'
import dashboard from '../data/dashboard.json'
import { getSession, logout } from '../services/mockAuth'

function DashboardPage() {
  const navigate = useNavigate()
  const session = getSession()
  const data = dashboard[session.role]
  function handleLogout() { logout(); navigate('/') }

  return <main className="min-h-screen bg-[#f7faff] px-5 py-8 sm:px-8 lg:px-12">
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><Link to="/" className="text-sm font-bold text-[#0757c9]">← InternConnect</Link><h1 className="mt-3 text-3xl font-extrabold text-[#172d50]">{data.title}</h1><p className="mt-1 text-sm text-[#7890ad]">Xin chào, {session.name}</p></div>
        <button type="button" onClick={handleLogout} className="rounded-md border border-[#cbd9e9] px-4 py-2 text-sm font-semibold text-[#2b4263]">Đăng xuất</button>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{data.stats.map((stat) => <div className="rounded-xl border border-[#e1eaf5] bg-white p-5" key={stat.label}><p className="text-sm text-[#7890ad]">{stat.label}</p><p className="mt-3 text-3xl font-extrabold text-[#0757c9]">{stat.value}</p></div>)}</div>
      <section className="mt-6 rounded-xl border border-[#e1eaf5] bg-white p-6"><h2 className="text-lg font-bold text-[#172d50]">Khu vực đang phát triển</h2><p className="mt-2 text-sm leading-6 text-[#7890ad]">Các chức năng chi tiết của vai trò sẽ được nối vào mock service và dữ liệu JSON trong các bước tiếp theo.</p></section>
    </div>
  </main>
}

export default DashboardPage
