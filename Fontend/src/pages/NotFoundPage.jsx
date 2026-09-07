import { Link } from 'react-router'

function NotFoundPage() {
  return <main className="grid min-h-screen place-items-center bg-[#f7faff] px-5"><div className="text-center"><p className="text-6xl font-extrabold text-[#0757c9]">404</p><h1 className="mt-3 text-2xl font-extrabold text-[#172d50]">Không tìm thấy trang</h1><p className="mt-2 text-sm text-[#7890ad]">Đường dẫn này không tồn tại hoặc đã được thay đổi.</p><Link className="mt-6 inline-block rounded-md bg-[#0757c9] px-5 py-3 text-sm font-bold text-white" to="/">Về trang chủ</Link></div></main>
}

export default NotFoundPage
