import defaultStudent from '../data/student.json'
import defaultApplications from '../data/applications.json'
import { getSession } from './mockAuth'
import internships from '../data/internships.json'
import { getJobs } from './companyService'

const STUDENT_KEY = 'internconnect_student'; const APPLICATIONS_KEY = 'internconnect_applications'
function read(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) || fallback } catch { return fallback } }
export function getStudent() { return read(STUDENT_KEY, defaultStudent) }
export function saveStudent(student) { localStorage.setItem(STUDENT_KEY, JSON.stringify(student)); return student }
export function getApplications() { return read(APPLICATIONS_KEY, defaultApplications) }
export function applyForInternship(internshipId) {
  const session = getSession(); const applications = getApplications()
  if (!session || session.role !== 'student') return { ok: false, error: 'Chỉ sinh viên đã đăng nhập mới được ứng tuyển', applications }
  const opportunity = [...internships, ...getJobs().filter((job) => job.status === 'Đã xuất bản')].find((item) => item.id === internshipId)
  if (!opportunity) return { ok: false, error: 'Cơ hội không còn nhận ứng tuyển', applications }
  if (applications.some((item) => item.internshipId === internshipId && item.studentId === session.id)) return { ok: false, error: 'Bạn đã ứng tuyển cơ hội này', applications }
  const next = [...applications, { id: Date.now(), studentId: session.id, internshipId, status: '02', statusHistory: [{ fromStatus: '01', toStatus: '02', actorId: session.id, actorRole: 'student', action: 'Ứng tuyển', note: '', createdAt: new Date().toISOString() }] }]
  localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(next)); return { ok: true, applications: next }
}
