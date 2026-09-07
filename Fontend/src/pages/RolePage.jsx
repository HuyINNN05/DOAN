import { Link } from 'react-router'

function RolePage({ title, description, actions = [] }) {
  return <section><div className="rounded-xl border border-[#e1eaf5] bg-white p-6"><p className="text-xs font-bold uppercase tracking-wider text-[#0a66c2]">InternConnect</p><h1 className="mt-2 text-2xl font-extrabold text-[#172d50]">{title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[#7890ad]">{description}</p></div><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{actions.map((action) => <Link to={action.href} className="rounded-xl border border-[#e1eaf5] bg-white p-5 hover:border-[#9fc2ed]" key={action.href}><h2 className="font-bold text-[#172d50]">{action.label}</h2><p className="mt-2 text-sm text-[#7890ad]">Dữ liệu mock và thao tác nghiệp vụ sẽ hiển thị tại đây.</p></Link>)}</div></section>
}

export default RolePage
