import defaultStudent from '../data/student.json'
import defaultApplications from '../data/applications.json'

const STUDENT_KEY = 'internconnect_student'
const APPLICATIONS_KEY = 'internconnect_applications'

function read(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback } catch { return fallback }
}

export function getStudent() { return read(STUDENT_KEY, defaultStudent) }
export function saveStudent(student) { localStorage.setItem(STUDENT_KEY, JSON.stringify(student)); return student }
export function getApplications() { return read(APPLICATIONS_KEY, defaultApplications) }
export function applyForInternship(internshipId) {
  const applications = getApplications()
  if (applications.some((item) => item.internshipId === internshipId && item.studentId === 1)) return applications
  const next = [...applications, { id: Date.now(), studentId: 1, internshipId, status: '04', statusLabel: 'Gửi hồ sơ doanh nghiệp', statusHistory: ['01', '02', '03', '04'] }]
  localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(next))
  return next
}
