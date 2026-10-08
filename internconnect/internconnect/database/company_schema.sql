-- CSDL dùng chung cho tất cả doanh nghiệp; company_id phân biệt từng doanh nghiệp.
CREATE DATABASE IF NOT EXISTS internconnect_company CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE internconnect_company;

-- Các ID thuộc nhà trường là tham chiếu logic, được backend kiểm tra.
CREATE TABLE IF NOT EXISTS companies (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  tax_code VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20), representative VARCHAR(150),
  industry VARCHAR(150), address VARCHAR(255), description TEXT, website VARCHAR(500),
  status ENUM('pending','approved','rejected','revision_requested') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS accounts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id BIGINT UNSIGNED NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS jobs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL, description TEXT, requirements TEXT, benefits TEXT,
  location VARCHAR(150), skills JSON, salary VARCHAR(150),
  work_mode ENUM('onsite','hybrid','remote') NOT NULL DEFAULT 'onsite',
  vacancies INT UNSIGNED NOT NULL DEFAULT 1,
  application_deadline DATE,
  status ENUM('draft','published','closed') NOT NULL DEFAULT 'draft',
  published_at DATETIME,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id),
  INDEX idx_jobs_public (status, application_deadline),
  CHECK (vacancies > 0)
) ENGINE=InnoDB;

-- student_id -> school.students.id; cv_id -> school.cvs.id.
-- Bảng này là nguồn duy nhất cho trạng thái hành trình 01–15.
CREATE TABLE IF NOT EXISTS applications (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  job_id BIGINT UNSIGNED NOT NULL,
  student_id BIGINT UNSIGNED NOT NULL,
  cv_id BIGINT UNSIGNED,
  status CHAR(2) NOT NULL DEFAULT '02',
  cover_letter TEXT,
  recruitment_result ENUM('pending','passed','failed') NOT NULL DEFAULT 'pending',
  offer_decision ENUM('pending','accepted','declined') NOT NULL DEFAULT 'pending',
  closure_reason TEXT,
  submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE (student_id, job_id),
  FOREIGN KEY (job_id) REFERENCES jobs(id),
  INDEX idx_applications_status (status),
  CHECK (status IN ('01','02','03','04','05','06','07','08','09','10','11','12','13','14','15'))
) ENGINE=InnoDB;

-- actor_database + actor_account_id xác định tài khoản, tránh trùng ID giữa hai CSDL.
CREATE TABLE IF NOT EXISTS application_status_history (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  application_id BIGINT UNSIGNED NOT NULL,
  from_status CHAR(2), to_status CHAR(2) NOT NULL,
  actor_database ENUM('school','company') NOT NULL,
  actor_account_id BIGINT UNSIGNED NOT NULL,
  actor_role ENUM('student','company','lecturer','admin') NOT NULL,
  action VARCHAR(255) NOT NULL, note TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES applications(id),
  CHECK (from_status IS NULL OR from_status IN ('01','02','03','04','05','06','07','08','09','10','11','12','13','14','15')),
  CHECK (to_status IN ('01','02','03','04','05','06','07','08','09','10','11','12','13','14','15')),
  CHECK ((actor_database = 'company' AND actor_role = 'company') OR
         (actor_database = 'school' AND actor_role IN ('student','lecturer','admin')))
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS interviews (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  application_id BIGINT UNSIGNED NOT NULL,
  scheduled_at DATETIME NOT NULL,
  mode ENUM('online','offline') NOT NULL DEFAULT 'online',
  location VARCHAR(500) NOT NULL,
  status ENUM('pending','confirmed','declined','cancelled','completed') NOT NULL DEFAULT 'pending',
  response_reason TEXT, result_note TEXT, passed BOOLEAN,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES applications(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS offers (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  application_id BIGINT UNSIGNED NOT NULL UNIQUE,
  start_date DATE, end_date DATE, response_deadline DATETIME,
  allowance VARCHAR(150), mentor_name VARCHAR(150), terms TEXT,
  sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  responded_at DATETIME,
  FOREIGN KEY (application_id) REFERENCES applications(id),
  CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
) ENGINE=InnoDB;

-- record_id -> school.internship_records.id; không sao chép nhật ký/báo cáo nhà trường.
CREATE TABLE IF NOT EXISTS company_evaluations (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  record_id BIGINT UNSIGNED NOT NULL UNIQUE,
  application_id BIGINT UNSIGNED NOT NULL UNIQUE,
  evaluator_account_id BIGINT UNSIGNED NOT NULL,
  attitude_score DECIMAL(4,2), skill_score DECIMAL(4,2), attendance_score DECIMAL(4,2),
  total_score DECIMAL(4,2) NOT NULL, comment TEXT,
  submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES applications(id),
  FOREIGN KEY (evaluator_account_id) REFERENCES accounts(id),
  CHECK (total_score BETWEEN 0 AND 10),
  CHECK (attitude_score BETWEEN 0 AND 10),
  CHECK (skill_score BETWEEN 0 AND 10),
  CHECK (attendance_score BETWEEN 0 AND 10)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notifications (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  recipient_account_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL, body TEXT NOT NULL,
  type VARCHAR(100), is_read BOOLEAN NOT NULL DEFAULT FALSE,
  sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recipient_account_id) REFERENCES accounts(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  actor_database ENUM('school','company') NOT NULL,
  actor_account_id BIGINT UNSIGNED,
  action VARCHAR(255) NOT NULL, entity VARCHAR(100) NOT NULL,
  old_value JSON, new_value JSON,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
