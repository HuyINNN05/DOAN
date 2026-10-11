-- InternConnect | Company database | MySQL 8.0.16+
-- Requires 01_school.sql on the same MySQL server.
-- Shared login identities stay in internconnect_school.users.
SET NAMES utf8mb4;
CREATE DATABASE IF NOT EXISTS internconnect_company CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE internconnect_company;

CREATE TABLE companies (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  tax_code VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(30),
  website VARCHAR(500),
  address VARCHAR(255),
  description TEXT,
  logo_url VARCHAR(500),
  industry VARCHAR(150),
  company_size VARCHAR(50),
  status ENUM('pending','approved','rejected','suspended') NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  approved_by BIGINT UNSIGNED,
  approved_at DATETIME,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_companies_tax_code (tax_code),
  UNIQUE KEY uq_companies_email (email),
  CONSTRAINT fk_companies_approver FOREIGN KEY (approved_by) REFERENCES internconnect_school.users(id)
) ENGINE=InnoDB;

CREATE TABLE company_accounts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  company_id BIGINT UNSIGNED NOT NULL,
  position VARCHAR(100),
  is_owner BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_company_accounts_user (user_id),
  CONSTRAINT fk_company_accounts_user FOREIGN KEY (user_id) REFERENCES internconnect_school.users(id),
  CONSTRAINT fk_company_accounts_company FOREIGN KEY (company_id) REFERENCES internconnect_company.companies(id)
) ENGINE=InnoDB;

CREATE TABLE jobs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  benefits TEXT,
  location VARCHAR(255),
  work_mode ENUM('onsite','remote','hybrid') NOT NULL DEFAULT 'onsite',
  salary_min DECIMAL(15,2),
  salary_max DECIMAL(15,2),
  quantity INT UNSIGNED NOT NULL DEFAULT 1,
  skills JSON,
  deadline DATE NOT NULL,
  status ENUM('draft','published','closed','expired') NOT NULL DEFAULT 'draft',
  created_by BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  review_status ENUM('draft','pending','approved','rejected','changes_requested') NOT NULL DEFAULT 'draft',
  pending_revision JSON,
  review_note TEXT,
  reviewed_by BIGINT UNSIGNED,
  reviewed_at DATETIME,
  UNIQUE KEY uq_jobs_id_company (id, company_id),
  CONSTRAINT chk_job_salary CHECK (salary_min IS NULL OR salary_max IS NULL OR salary_max >= salary_min),
  CONSTRAINT fk_jobs_company FOREIGN KEY (company_id) REFERENCES internconnect_company.companies(id),
  CONSTRAINT fk_jobs_creator FOREIGN KEY (created_by) REFERENCES internconnect_school.users(id),
  INDEX idx_jobs_company (company_id),
  INDEX idx_jobs_status (status),
  INDEX idx_jobs_deadline (deadline),
  INDEX idx_jobs_review_status (review_status),
  CONSTRAINT fk_jobs_reviewer FOREIGN KEY (reviewed_by) REFERENCES internconnect_school.users(id),
  CONSTRAINT chk_job_quantity CHECK (quantity > 0),
  CONSTRAINT chk_job_salary_nonnegative CHECK ((salary_min IS NULL OR salary_min >= 0) AND (salary_max IS NULL OR salary_max >= 0)),
  INDEX idx_jobs_public (status, deadline, created_at)
) ENGINE=InnoDB;

CREATE TABLE applications (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id BIGINT UNSIGNED NOT NULL,
  job_id BIGINT UNSIGNED NOT NULL,
  cv_id BIGINT UNSIGNED NOT NULL,
  internship_period_id BIGINT UNSIGNED NOT NULL,
  status CHAR(2) NOT NULL DEFAULT '02',
  cover_letter TEXT,
  applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_application_period (student_id, job_id, internship_period_id),
  UNIQUE KEY uq_application_identity (id, student_id, job_id, internship_period_id),
  CONSTRAINT chk_application_status CHECK (status IN ('01','02','03','04','05','06','07','08','09','10','11','12','13','14','15')),
  CONSTRAINT fk_applications_student FOREIGN KEY (student_id) REFERENCES internconnect_school.students(id),
  CONSTRAINT fk_applications_job FOREIGN KEY (job_id) REFERENCES internconnect_company.jobs(id),
  CONSTRAINT fk_applications_cv FOREIGN KEY (cv_id) REFERENCES internconnect_school.cvs(id),
  CONSTRAINT fk_applications_cv_owner FOREIGN KEY (cv_id, student_id) REFERENCES internconnect_school.cvs(id, student_id),
  CONSTRAINT fk_applications_period FOREIGN KEY (internship_period_id) REFERENCES internconnect_school.internship_periods(id),
  INDEX idx_applications_student (student_id),
  INDEX idx_applications_job (job_id),
  INDEX idx_applications_status (status),
  INDEX idx_applications_period_status (internship_period_id, status)
) ENGINE=InnoDB;

CREATE TABLE application_events (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  application_id BIGINT UNSIGNED NOT NULL,
  from_status CHAR(2),
  to_status CHAR(2) NOT NULL,
  actor_user_id BIGINT UNSIGNED NOT NULL,
  actor_role ENUM('student','company','lecturer','admin') NOT NULL,
  action VARCHAR(100) NOT NULL,
  note TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_application_events_application FOREIGN KEY (application_id) REFERENCES internconnect_company.applications(id),
  CONSTRAINT fk_application_events_actor FOREIGN KEY (actor_user_id) REFERENCES internconnect_school.users(id),
  INDEX idx_application_events_application (application_id)
) ENGINE=InnoDB;

CREATE TABLE interviews (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  application_id BIGINT UNSIGNED NOT NULL,
  scheduled_at DATETIME NOT NULL,
  duration_minutes SMALLINT UNSIGNED NOT NULL DEFAULT 60,
  type ENUM('online','offline') NOT NULL,
  location VARCHAR(255),
  meeting_url VARCHAR(500),
  note TEXT,
  status ENUM('scheduled','confirmed','declined','completed','cancelled') NOT NULL DEFAULT 'scheduled',
  student_response ENUM('pending','accepted','declined') NOT NULL DEFAULT 'pending',
  student_response_note TEXT,
  result ENUM('pending','passed','failed') NOT NULL DEFAULT 'pending',
  result_note TEXT,
  created_by BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_interviews_application FOREIGN KEY (application_id) REFERENCES internconnect_company.applications(id),
  CONSTRAINT fk_interviews_creator FOREIGN KEY (created_by) REFERENCES internconnect_school.users(id),
  INDEX idx_interviews_application (application_id),
  INDEX idx_interviews_schedule (status, scheduled_at)
) ENGINE=InnoDB;

-- Complete foreign keys from school records to company-owned data.
ALTER TABLE internconnect_school.saved_jobs ADD CONSTRAINT fk_saved_jobs_job FOREIGN KEY (job_id) REFERENCES internconnect_company.jobs(id);
ALTER TABLE internconnect_school.internship_records ADD CONSTRAINT fk_records_application FOREIGN KEY (application_id) REFERENCES internconnect_company.applications(id);
ALTER TABLE internconnect_school.internship_records ADD CONSTRAINT fk_records_application_identity FOREIGN KEY (application_id, student_id, job_id, internship_period_id) REFERENCES internconnect_company.applications(id, student_id, job_id, internship_period_id);
ALTER TABLE internconnect_school.internship_records ADD CONSTRAINT fk_records_company FOREIGN KEY (company_id) REFERENCES internconnect_company.companies(id);
ALTER TABLE internconnect_school.internship_records ADD CONSTRAINT fk_records_job FOREIGN KEY (job_id) REFERENCES internconnect_company.jobs(id);
ALTER TABLE internconnect_school.internship_records ADD CONSTRAINT fk_records_job_company FOREIGN KEY (job_id, company_id) REFERENCES internconnect_company.jobs(id, company_id);

SELECT 'Company structure and cross-database links created; import 03_seed.sql next' AS import_result;
