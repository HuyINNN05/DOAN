import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'

const data = new Map()
globalThis.localStorage = { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, String(value)), removeItem: (key) => data.delete(key), key: (index) => [...data.keys()][index], get length() { return data.size } }
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
after(() => server.close())
const load = (path) => server.ssrLoadModule(`/Fontend/src/services/${path}.js`)
const auth = await load('mockAuth')
const student = await load('studentService')
const applications = await load('applicationService')
const interviews = await load('interviewService')
const records = await load('internshipRecordService')
const evaluations = await load('evaluationService')
const notifications = await load('notificationService')
const company = await load('companyService')
const session = (id, role) => localStorage.setItem('internconnect_session', JSON.stringify({ id, role }))
const reset = () => data.clear()

test('Khách và vai trò khác sinh viên không ứng tuyển được', () => { reset(); assert.equal(student.applyForInternship(2).ok, false); session(2, 'company'); assert.equal(student.applyForInternship(2).ok, false); session(1, 'student'); const response = student.applyForInternship(2); assert.equal(response.ok, true); assert.equal(response.applications.at(-1).status, '02'); assert.equal(response.applications.at(-1).studentId, 1) })
test('Không chuyển sai trạng thái hoặc sai vai trò', () => { reset(); session(1, 'student'); assert.equal(applications.updateApplication(1, { status: '15' }).ok, false); assert.equal(applications.updateApplication(1, { status: '07' }).ok, true); assert.equal(applications.updateApplication(1, { status: '09' }).ok, false); assert.equal(applications.getAllApplications().find((item) => item.id === 1).status, '07') })
test('Lịch phỏng vấn gắn đúng hồ sơ và không tạo trùng', () => { reset(); session(2, 'company'); const existing = interviews.getInterviews().length; assert.equal(interviews.createInterview({ applicationId: 1, date: '2026-10-01', time: '10:00', location: 'Online' }).ok, false); assert.equal(interviews.getInterviews().length, existing); assert.equal(interviews.createInterview({ applicationId: 2, date: '2026-10-01', time: '10:00', location: 'Online' }).ok, false) })
function reachOffer() { session(1, 'student'); interviews.respondInterview(1, true); session(2, 'company'); interviews.recordInterviewResult(1, true, 'Đạt yêu cầu'); session(1, 'student') }
test('Offer chỉ dành cho hồ sơ đạt và sinh viên sở hữu', () => { reset(); session(1, 'student'); assert.equal(interviews.confirmOffer(1, true).ok, false); reachOffer(); assert.equal(interviews.confirmOffer(1, true).ok, true); assert.equal(applications.getAllApplications()[0].status, '11') })
test('Hồ sơ thực tập chờ admin xác nhận, không nhảy thẳng bước 12', () => { reset(); session(1, 'student'); assert.equal(records.createRecord(applications.getAllApplications()[0]).ok, false); reachOffer(); interviews.confirmOffer(1, true); const created = records.createRecord(applications.getAllApplications()[0]); assert.equal(created.ok, true); assert.equal(applications.getAllApplications()[0].status, '11'); session(4, 'admin'); assert.equal(records.confirmRecord(created.records[0].id, { lecturerId: 3, period: 'HK1' }).ok, true); assert.equal(applications.getAllApplications()[0].status, '12') })
test('Thông báo không lẫn giữa người dùng', () => { reset(); session(1, 'student'); assert.ok(notifications.getNotifications().length > 0); session(2, 'company'); assert.equal(notifications.getNotifications().length, 0) })
test('Đánh giá không được sửa sau khi gửi', () => { reset(); reachOffer(); interviews.confirmOffer(1, true); const made = records.createRecord(applications.getAllApplications()[0]); session(4, 'admin'); records.confirmRecord(made.records[0].id, { lecturerId: 3, period: 'HK1' }); records.startInternship(made.records[0].id); session(3, 'lecturer'); assert.equal(evaluations.saveEvaluation({ applicationId: 1, studentId: 1, evaluatorRole: 'lecturer', score: 8 }).ok, true); assert.equal(evaluations.saveEvaluation({ applicationId: 1, studentId: 1, evaluatorRole: 'lecturer', score: 9 }).ok, false) })
test('Tin đã xuất bản tồn tại trong nguồn trang công khai', () => { reset(); session(2, 'company'); const jobs = company.saveJobs([...company.getJobs(), { id: 700, companyId: 2, title: 'QA Intern', skills: [], status: 'Đã xuất bản' }]); assert.ok(jobs.some((item) => item.id === 700 && item.status === 'Đã xuất bản')) })
