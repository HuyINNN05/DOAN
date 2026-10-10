import { ArrowLeft, ArrowRight, Inbox, RefreshCw } from 'lucide-react'
import { Link } from 'react-router'
import Header from '../Header/Header'
import Footer from '../Footer/Footer'

export function PublicLayout({ children }) {
  return <><Header /><main className="site-main">{children}</main><Footer /></>
}
export function PageHero({ eyebrow, title, description, children }) {
  return <section className="page-hero"><div className="site-container"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="hero-description">{description}</p>{children}</div></section>
}
export function EmptyState({ title = 'Chưa có dữ liệu', description = 'Nội dung sẽ xuất hiện tại đây khi có cập nhật.', to, action }) {
  return <div className="empty-state"><span className="empty-icon"><Inbox size={28} /></span><h2>{title}</h2><p>{description}</p>{to && <Link className="button button-secondary" to={to}>{action || 'Tìm hiểu thêm'}<ArrowRight size={16} /></Link>}</div>
}
export function ResourceState({ resource, children, emptyTitle, emptyDescription }) {
  if (resource.loading) return <div className="loading-grid" role="status" aria-label="Đang tải dữ liệu">{[1, 2, 3].map(x => <div key={x} className="skeleton-card" />)}<span className="sr-only">Đang tải dữ liệu…</span></div>
  if (resource.errorCode === 'INTERNSHIP_NOT_FOUND') return <EmptyState title="Bạn chưa có hồ sơ thực tập" description="Sau khi nhận đề nghị thực tập, nhà trường sẽ xác nhận nơi thực tập và phân công giảng viên cho bạn." to="/student/applications" action="Theo dõi ứng tuyển" />
  if (resource.error) return <div className="error-state" role="alert"><h2>Không thể tải nội dung</h2><p>{resource.error}</p><button className="button button-secondary" onClick={resource.reload}><RefreshCw size={16} />Thử lại</button></div>
  const list = Array.isArray(resource.data) ? resource.data : resource.data?.items
  if (list && list.length === 0) return <EmptyState title={emptyTitle} description={emptyDescription} />
  return children
}
export function BackLink({ to, children }) {
  return <Link className="back-link" to={to}><ArrowLeft size={16} />{children}</Link>
}
