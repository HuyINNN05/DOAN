import { Link, useNavigate } from 'react-router'
import dashboard from '../data/dashboard.json'
import statuses from '../data/internshipStatuses.json'
import { getSession, logout } from '../services/mockAuth'
import { getApplications } from '../services/studentService'
import { getInterviews } from '../services/interviewService'
import { getRecords } from '../services/internshipRecordService'
import { getReports } from '../services/reportService'
import StatCard from '../components/dashboard/StatCard'

const roleActions = {
  student: [['/student/profile', 'Hoàn thiện hồ sơ'], ['/student/opportunities', 'Tìm cơ hội thực tập'], ['/student/reports', 'Nộp báo cáo']],
  company: [['/company/jobs/create', 'Đăng tin tuyển dụng'], ['/company/applications', 'Xử lý hồ sơ'], ['/company/interviews', 'Quản lý phỏng vấn']],
  lecturer: [['/lecturer/students', 'Xem sinh viên phụ trách'], ['/lecturer/reports', 'Duyệt báo cáo'], ['/lecturer/evaluations', 'Đánh giá cuối kỳ']],
  admin: [['/admin/companies', 'Phê duyệt doanh nghiệp'], ['/admin/assignments', 'Phân công giảng viên'], ['/admin/reports', 'Xem báo cáo thống kê']],
}

function DashboardPage() {
  const navigate = useNavigate()
  const session = getSession()
  const data = dashboard[session.role]
  const applications = getApplications()
  const interviews = getInterviews()
  const records = getRecords()
  const reports = getReports()
  const currentApplication = applications.find((item) => item.studentId === session.id) || applications[0]
  const currentIndex = Math.max(0, statuses.findIndex((item) => item.id === currentApplication?.status))
  const pendingInterview = interviews.find((item) => item.status === 'Chờ sinh viên xác nhận') || interviews[0]
  const pendingReports = reports.filter((item) => item.status === 'Chờ giảng viên duyệt').length
  const activity = session.role === 'student'
    ? [['Hồ sơ đã được đồng bộ', 'Cập nhật gần đây'], [pendingInterview ? 'Có lịch phỏng vấn cần theo dõi' : 'Chưa có lịch phỏng vấn mới', 'Theo dữ liệu hiện tại'], [currentApplication ? `Hồ sơ đang ở bước ${currentApplication.status}` : 'Chưa có hồ sơ ứng tuyển', 'Trạng thái ứng tuyển']]
    : session.role === 'company'
      ? [['Có hồ sơ ứng viên mới', 'Cần xử lý trong hôm nay'], [`${interviews.length} lịch phỏng vấn trong hệ thống`, 'Theo dữ liệu hiện tại'], [`${records.length} hồ sơ đang thực tập`, 'Đang theo dõi']]
      : session.role === 'lecturer'
        ? [[`${pendingReports} báo cáo chờ duyệt`, 'Cần xử lý'], [`${records.length} hồ sơ thực tập`, 'Đang theo dõi'], ['Tiến độ sinh viên đã được cập nhật', 'Theo dữ liệu hiện tại']]
        : [['Hồ sơ doanh nghiệp chờ thẩm định', 'Cần xử lý'], ['Kỳ thực tập hiện tại đang mở', 'Hệ thống'], ['Báo cáo thống kê đã sẵn sàng', 'Cập nhật hôm nay']]
  function handleLogout() { logout(); navigate('/') }
  return <section><div className="dashboard-page-heading"><div><p className="dashboard-eyebrow">TỔNG QUAN HỆ THỐNG</p><h1>{data.title}</h1><p>Xin chào, <b>{session.name}</b>. Đây là tổng quan hoạt động của bạn.</p></div><button type="button" onClick={handleLogout} className="dashboard-secondary-button">Đăng xuất</button></div><section className="dashboard-welcome"><div><span className="dashboard-welcome-pill">✦ Kết nối đúng cơ hội</span><h2>{session.role === 'student' ? 'Bắt đầu hành trình thực tập của bạn.' : session.role === 'company' ? 'Cùng tìm kiếm và phát triển tài năng trẻ.' : session.role === 'lecturer' ? 'Đồng hành cùng sinh viên trên hành trình nghề nghiệp.' : 'Quản lý hoạt động thực tập tập trung và hiệu quả.'}</h2><p>{session.role === 'student' ? 'Hoàn thiện hồ sơ, khám phá cơ hội phù hợp và theo dõi tiến độ thực tập.' : 'Tổng quan những hoạt động mới nhất đang cần bạn xử lý.'}</p></div><div className="dashboard-welcome-illustration"><span>◆</span><b>{session.role === 'student' ? currentIndex + 1 : data.stats[0].value}</b><small>{session.role === 'student' ? 'mốc đã đi qua' : 'tổng quan'}</small></div></section><div className="dashboard-stats-grid">{data.stats.map((stat, index) => <StatCard key={stat.label} label={stat.label} value={stat.value} note={index % 2 ? 'Theo dữ liệu mới nhất' : 'Cập nhật hôm nay'} tone={['blue', 'green', 'orange', 'purple'][index]} />)}</div>{session.role === 'student' && <section className="dashboard-panel dashboard-timeline-panel"><div className="dashboard-panel-heading"><h2>Hành trình thực tập (15 giai đoạn)</h2><Link to="/student/applications">Xem chi tiết →</Link></div><div className="dashboard-timeline">{statuses.map((status, index) => <div className={`dashboard-timeline-step ${index < currentIndex ? 'done' : ''} ${index === currentIndex ? 'done current' : ''}`} key={status.id}><span>{status.id}</span><small>{status.label}</small></div>)}</div></section>}<div className="dashboard-panels"><section className="dashboard-panel dashboard-panel-large"><div className="dashboard-panel-heading"><h2>Hoạt động gần đây</h2><span className="dashboard-chip">Đã đồng bộ</span></div><div className="dashboard-activity-list">{activity.map(([item, note], index) => <div key={item}><span className={`activity-dot dot-${index}`} /><p>{item}<small>{note}</small></p></div>)}</div></section><section className="dashboard-panel"><div className="dashboard-panel-heading"><h2>Thao tác nhanh</h2><span className="dashboard-chip">Gợi ý</span></div><div className="dashboard-quick-actions">{roleActions[session.role].map(([href, label]) => <Link to={href} key={href}>{label}<span>→</span></Link>)}</div>{session.role === 'student' && pendingInterview && <div className="dashboard-interview"><b>LỊCH<br /><strong>{pendingInterview.date}</strong></b><div><strong>{pendingInterview.time}</strong><p>Phỏng vấn sắp tới</p><small>{pendingInterview.mode} · {pendingInterview.location}</small></div></div>}</section></div></section>
}

export default DashboardPage
