CREATE DATABASE IF NOT EXISTS internconnect_school CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE internconnect_school;

-- Dữ liệu thuộc Nhà trường. Các ID từ CSDL doanh nghiệp là tham chiếu logic,
-- được API kiểm tra; không tạo khóa ngoại xuyên CSDL.
CREATE TABLE IF NOT EXISTS accounts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  role ENUM('student','lecturer','admin') NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS students (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  account_id BIGINT UNSIGNED NOT NULL UNIQUE,
  student_code VARCHAR(50) NOT NULL UNIQUE,
  class_name VARCHAR(100), faculty VARCHAR(150), major VARCHAR(150), academic_year VARCHAR(50),
  phone VARCHAR(20), address VARCHAR(255), career_goal TEXT, skills TEXT, experience TEXT,
  education TEXT, personal_projects TEXT,
  FOREIGN KEY (account_id) REFERENCES accounts(id)
);

CREATE TABLE IF NOT EXISTS lecturers (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  account_id BIGINT UNSIGNED NOT NULL UNIQUE,
  lecturer_code VARCHAR(50) NOT NULL UNIQUE,
  faculty VARCHAR(150), degree VARCHAR(100), phone VARCHAR(20),
  FOREIGN KEY (account_id) REFERENCES accounts(id)
);

CREATE TABLE IF NOT EXISTS internship_periods (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL, academic_year VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL, end_date DATE NOT NULL, report_deadline DATE,
  status ENUM('draft','open','closed') NOT NULL DEFAULT 'draft',
  CHECK (end_date >= start_date)
);

CREATE TABLE IF NOT EXISTS cvs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id BIGINT UNSIGNED NOT NULL,
  file_name VARCHAR(255) NOT NULL, file_path VARCHAR(500) NOT NULL,
  mime_type VARCHAR(100), analysis_status ENUM('pending','done','failed') NOT NULL DEFAULT 'pending',
  uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id)
);

CREATE TABLE IF NOT EXISTS cv_analyses (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  cv_id BIGINT UNSIGNED NOT NULL UNIQUE,
  match_score DECIMAL(5,2), skill_keywords TEXT, extracted_experience TEXT, suggested_jobs TEXT,
  processed_at DATETIME, FOREIGN KEY (cv_id) REFERENCES cvs(id)
);

CREATE TABLE IF NOT EXISTS internship_records (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  application_id BIGINT UNSIGNED NOT NULL UNIQUE,
  student_id BIGINT UNSIGNED NOT NULL,
  company_id BIGINT UNSIGNED NOT NULL,
  job_id BIGINT UNSIGNED NOT NULL,
  period_id BIGINT UNSIGNED,
  lecturer_id BIGINT UNSIGNED,
  start_date DATE, end_date DATE, company_mentor VARCHAR(150),
  status ENUM('pending','confirmed','active','completed','cancelled') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (period_id) REFERENCES internship_periods(id),
  FOREIGN KEY (lecturer_id) REFERENCES lecturers(id)
);

CREATE TABLE IF NOT EXISTS internship_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  record_id BIGINT UNSIGNED NOT NULL, entry_date DATE NOT NULL,
  work_content TEXT NOT NULL, results TEXT, difficulties TEXT,
  status ENUM('draft','submitted','reviewed') NOT NULL DEFAULT 'draft', lecturer_feedback TEXT,
  FOREIGN KEY (record_id) REFERENCES internship_records(id)
);

CREATE TABLE IF NOT EXISTS reports (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  record_id BIGINT UNSIGNED NOT NULL, title VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL, version INT UNSIGNED NOT NULL DEFAULT 1,
  status ENUM('submitted','approved','revision_requested') NOT NULL DEFAULT 'submitted',
  feedback TEXT, submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (record_id, version), FOREIGN KEY (record_id) REFERENCES internship_records(id)
);

CREATE TABLE IF NOT EXISTS evaluation_criteria (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL, description TEXT, weight DECIMAL(5,2) NOT NULL,
  evaluator_role ENUM('company','lecturer') NOT NULL, active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS lecturer_evaluations (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  record_id BIGINT UNSIGNED NOT NULL UNIQUE,
  lecturer_id BIGINT UNSIGNED NOT NULL, comment TEXT,
  attitude_score DECIMAL(4,2), skill_score DECIMAL(4,2), attendance_score DECIMAL(4,2),
  total_score DECIMAL(4,2), submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (record_id) REFERENCES internship_records(id),
  FOREIGN KEY (lecturer_id) REFERENCES lecturers(id),
  CHECK (total_score BETWEEN 0 AND 10)
);

CREATE TABLE IF NOT EXISTS internship_scores (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  record_id BIGINT UNSIGNED NOT NULL UNIQUE,
  company_score DECIMAL(4,2), lecturer_score DECIMAL(4,2), report_score DECIMAL(4,2),
  final_score DECIMAL(4,2), grade VARCHAR(50), published_at DATETIME,
  FOREIGN KEY (record_id) REFERENCES internship_records(id),
  CHECK (final_score BETWEEN 0 AND 10)
);

CREATE TABLE IF NOT EXISTS notifications (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  recipient_account_id BIGINT UNSIGNED NOT NULL, title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL, type VARCHAR(100), is_read BOOLEAN NOT NULL DEFAULT FALSE,
  sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recipient_account_id) REFERENCES accounts(id)
);

CREATE TABLE IF NOT EXISTS articles (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL, category VARCHAR(100) NOT NULL, body TEXT NOT NULL,
  status ENUM('draft','published') NOT NULL DEFAULT 'draft',
  published_at DATETIME
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  actor_id BIGINT UNSIGNED, actor_role VARCHAR(30), action VARCHAR(255) NOT NULL,
  entity VARCHAR(100) NOT NULL, old_value JSON, new_value JSON,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
