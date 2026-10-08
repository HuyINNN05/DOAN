-- DỮ LIỆU MẪU: chỉ import vào CSDL demo mới, sau company_schema.sql và school_seed.sql.
-- Không dùng file này làm migration cho dữ liệu đang vận hành.
USE internconnect_company;
START TRANSACTION;

INSERT INTO companies (id, name, tax_code, email, industry, address, status) VALUES
  (2, 'Doanh nghiệp Công nghệ Demo A', 'DEMO-TAX-002', 'company-a@example.test', 'Công nghệ thông tin', 'Hà Nội', 'approved'),
  (5, 'Doanh nghiệp Công nghệ Demo B', 'DEMO-TAX-005', 'company-b@example.test', 'Phần mềm', 'Đà Nẵng', 'pending');

-- Chưa có mật khẩu đăng nhập. Backend cần tạo hash thật và kích hoạt tài khoản.
INSERT INTO accounts (id, company_id, email, password_hash, full_name, active) VALUES
  (2, 2, 'company-a@example.test', '!DEMO_ACCOUNT_DISABLED!', 'Nhân sự doanh nghiệp A', FALSE),
  (5, 5, 'company-b@example.test', '!DEMO_ACCOUNT_DISABLED!', 'Nhân sự doanh nghiệp B', FALSE);

INSERT INTO jobs (id, company_id, title, location, skills, status) VALUES
  (1, 2, 'Frontend Developer Intern', 'Hà Nội', '["ReactJS", "JavaScript", "HTML/CSS"]', 'published'),
  (2, 5, 'Backend Developer Intern', 'Đà Nẵng', '["Node.js", "SQL"]', 'draft');

INSERT INTO applications (id, job_id, student_id, status, recruitment_result, offer_decision) VALUES
  (1, 1, 1, '13', 'passed', 'accepted');

-- Lịch sử rút gọn của bộ demo, không mô phỏng đầy đủ các bước trước đó.
INSERT INTO application_status_history
  (application_id, from_status, to_status, actor_database, actor_account_id, actor_role, action) VALUES
  (1, '12', '13', 'school', 4, 'admin', 'Bắt đầu thực tập - dữ liệu mẫu');

INSERT INTO interviews (id, application_id, scheduled_at, mode, location, status, passed) VALUES
  (1, 1, '2026-09-15 10:00:00', 'online', 'Phỏng vấn trực tuyến demo', 'completed', TRUE);
INSERT INTO offers (application_id, start_date, end_date, mentor_name) VALUES
  (1, '2026-09-21', '2026-12-31', 'Người hướng dẫn demo');

COMMIT;
