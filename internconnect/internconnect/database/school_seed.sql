-- DỮ LIỆU MẪU: chỉ import vào CSDL demo mới, sau school.sql.
-- Các tài khoản bị khóa cho đến khi backend đặt password_hash thật.
USE internconnect_school;
START TRANSACTION;

INSERT INTO accounts (id, email, password_hash, full_name, role, active) VALUES
  (1, 'student@example.test', '!DEMO_ACCOUNT_DISABLED!', 'Sinh viên Demo', 'student', FALSE),
  (3, 'lecturer@example.test', '!DEMO_ACCOUNT_DISABLED!', 'Giảng viên Demo', 'lecturer', FALSE),
  (4, 'admin@example.test', '!DEMO_ACCOUNT_DISABLED!', 'Quản trị nhà trường', 'admin', FALSE);
INSERT INTO students (id, account_id, student_code, class_name, major) VALUES
  (1, 1, 'SV-DEMO-001', '74DCTT22', 'Công nghệ thông tin');
INSERT INTO lecturers (id, account_id, lecturer_code, faculty) VALUES
  (3, 3, 'GV-DEMO-003', 'Khoa Công nghệ thông tin');
INSERT INTO internship_periods (id, name, academic_year, start_date, end_date, status) VALUES
  (1, 'Thực tập học kỳ 1', '2026-2027', '2026-09-01', '2027-01-31', 'open');

-- application_id=1, company_id=2, job_id=1 khớp với company.sql.
INSERT INTO internship_records
  (id, application_id, student_id, company_id, job_id, period_id, lecturer_id, start_date, end_date, status) VALUES
  (1, 1, 1, 2, 1, 1, 3, '2026-09-21', '2026-12-31', 'active');
INSERT INTO internship_logs (record_id, entry_date, work_content, status) VALUES
  (1, '2026-09-22', 'Tìm hiểu dự án và xây dựng giao diện React.', 'submitted');
INSERT INTO company_reviews (company_id, reviewer_account_id, decision, reason) VALUES
  (2, 4, 'approved', 'Phê duyệt doanh nghiệp demo A');

COMMIT;
