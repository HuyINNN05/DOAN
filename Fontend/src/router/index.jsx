import { BrowserRouter, Route, Routes } from 'react-router'
import ProtectedRoute from '../components/Auth/ProtectedRoute'
import App from '../App'
import DashboardPage from '../pages/DashboardPage'
import LoginPage from '../pages/LoginPage'
import OpportunitiesPage from '../pages/OpportunitiesPage'
import RoleLayout from '../layouts/RoleLayout'
import RolePage from '../pages/RolePage'
import NotFoundPage from '../pages/NotFoundPage'
import PublicInfoPage from '../pages/PublicInfoPage'
import { StudentApplicationsPage, StudentDiaryPage, StudentInterviewsPage, StudentInternshipPage, StudentOpportunitiesPage, StudentProfilePage, StudentReportsPage } from '../pages/student/StudentFeaturePages'
import { CompanyApplicationsPage, CompanyEvaluationsPage, CompanyInterviewsPage, CompanyInternsPage, CompanyJobsPage, CompanyProfilePage } from '../pages/company/CompanyFeaturePages'
import { LecturerDiariesPage, LecturerEvaluationsPage, LecturerInternshipsPage, LecturerReportsPage, LecturerStudentsPage } from '../pages/lecturer/LecturerFeaturePages'
import { AdminAssignmentsPage, AdminCompaniesPage, AdminContentPage, AdminNotificationsPage, AdminPeriodsPage, AdminReportsPage, AdminUsersPage } from '../pages/admin/AdminFeaturePages'
import AuditLogsPage from '../pages/admin/AuditLogsPage'

const pages = {
  student: [['profile', 'Hồ sơ cá nhân & CV'], ['opportunities', 'Cơ hội thực tập'], ['applications', 'Quản lý ứng tuyển'], ['interviews', 'Lịch phỏng vấn'], ['internship', 'Hồ sơ thực tập'], ['diary', 'Nhật ký thực tập'], ['reports', 'Báo cáo thực tập']],
  company: [['profile', 'Hồ sơ doanh nghiệp'], ['jobs', 'Quản lý tin tuyển dụng'], ['jobs/create', 'Đăng tin tuyển dụng'], ['applications', 'Quản lý hồ sơ ứng viên'], ['interviews', 'Lịch phỏng vấn'], ['interns', 'Sinh viên đang thực tập'], ['evaluations', 'Đánh giá sinh viên']],
  lecturer: [['students', 'Sinh viên được phân công'], ['internships', 'Theo dõi tiến độ thực tập'], ['diaries', 'Nhật ký thực tập'], ['reports', 'Báo cáo cần duyệt'], ['evaluations', 'Đánh giá cuối kỳ']],
  admin: [['users', 'Quản lý tài khoản'], ['companies', 'Phê duyệt doanh nghiệp'], ['internship-periods', 'Quản lý kỳ thực tập'], ['assignments', 'Phân công giảng viên'], ['content', 'Quản lý nội dung'], ['notifications', 'Quản lý thông báo'], ['reports', 'Báo cáo thống kê'], ['audit', 'Lịch sử thao tác']],
}

function RoutedPage({ role, slug, label }) { return <RolePage title={label} description={`Không gian nghiệp vụ ${label.toLowerCase()} dành cho ${role}. Page này đã có route riêng để phát triển độc lập theo Use Case.`} actions={[['dashboard', 'Quay về Dashboard'], ...pages[role].filter(([item]) => item !== slug).slice(0, 2)].map(([item, text]) => ({ href: item === 'dashboard' ? `/${role}/dashboard` : `/${role}/${item}`, label: text }))} /> }

function RoleRoutes({ role, title }) {
  const studentPages = { profile: <StudentProfilePage />, opportunities: <StudentOpportunitiesPage />, applications: <StudentApplicationsPage />, interviews: <StudentInterviewsPage />, internship: <StudentInternshipPage />, diary: <StudentDiaryPage />, reports: <StudentReportsPage /> }
  const companyPages = { profile: <CompanyProfilePage />, jobs: <CompanyJobsPage />, 'jobs/create': <CompanyJobsPage create />, applications: <CompanyApplicationsPage />, interviews: <CompanyInterviewsPage />, interns: <CompanyInternsPage />, evaluations: <CompanyEvaluationsPage /> }
  const lecturerPages = { students: <LecturerStudentsPage />, internships: <LecturerInternshipsPage />, diaries: <LecturerDiariesPage />, reports: <LecturerReportsPage />, evaluations: <LecturerEvaluationsPage /> }
  const adminPages = { users: <AdminUsersPage />, companies: <AdminCompaniesPage />, 'internship-periods': <AdminPeriodsPage />, assignments: <AdminAssignmentsPage />, content: <AdminContentPage />, notifications: <AdminNotificationsPage />, reports: <AdminReportsPage />, audit: <AuditLogsPage /> }
  return <Route element={<ProtectedRoute role={role} />}><Route element={<RoleLayout role={role} title={title} />}><Route path={`/${role}/dashboard`} element={<DashboardPage />} />{pages[role].map(([slug, label]) => <Route path={`/${role}/${slug}`} element={role === 'student' ? studentPages[slug] : role === 'company' ? companyPages[slug] : role === 'lecturer' ? lecturerPages[slug] : role === 'admin' ? adminPages[slug] : <RoutedPage role={role} slug={slug} label={label} />} key={slug} />)}</Route></Route>
}

function Router() {
  return <BrowserRouter><Routes><Route path="/" element={<App />} /><Route path="/login" element={<LoginPage />} /><Route path="/opportunities" element={<OpportunitiesPage />} /><Route path="/companies" element={<PublicInfoPage type="companies" />} /><Route path="/information" element={<PublicInfoPage type="information" />} /><Route path="/guide" element={<PublicInfoPage type="guide" />} /><Route path="/contact" element={<PublicInfoPage type="contact" />} />{RoleRoutes({ role: 'student', title: 'Khu vực sinh viên' })}{RoleRoutes({ role: 'company', title: 'Khu vực doanh nghiệp' })}{RoleRoutes({ role: 'lecturer', title: 'Khu vực giảng viên' })}{RoleRoutes({ role: 'admin', title: 'Khu vực nhà trường' })}<Route path="*" element={<NotFoundPage />} /></Routes></BrowserRouter>
}

export default Router
