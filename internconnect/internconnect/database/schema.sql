SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS internconnect
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE internconnect;

CREATE TABLE users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(30),
  role ENUM('student','company','lecturer','admin') NOT NULL,
  status ENUM('active','inactive','locked','pending') NOT NULL DEFAULT 'pending',
  last_login_at DATETIME,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

CREATE TABLE students (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  student_code VARCHAR(50) NOT NULL,
  faculty VARCHAR(150), major VARCHAR(150), class_name VARCHAR(100), course VARCHAR(50),
  gpa DECIMAL(4,2), date_of_birth DATE,
  gender ENUM('male','female','other'), address VARCHAR(255), bio TEXT, skills JSON, avatar_url VARCHAR(500),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_students_user (user_id),
  UNIQUE KEY uq_students_code (student_code),
  CONSTRAINT fk_students_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE lecturers (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  lecturer_code VARCHAR(50) NOT NULL,
  faculty VARCHAR(150), department VARCHAR(150), academic_title VARCHAR(100),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_lecturers_user (user_id), UNIQUE KEY uq_lecturers_code (lecturer_code),
  CONSTRAINT fk_lecturers_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE companies (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL, tax_code VARCHAR(50) NOT NULL, email VARCHAR(255) NOT NULL,
  phone VARCHAR(30), website VARCHAR(500), address VARCHAR(255), description TEXT,
  logo_url VARCHAR(500), industry VARCHAR(150), company_size VARCHAR(50),
  status ENUM('pending','approved','rejected','suspended') NOT NULL DEFAULT 'pending',
  rejection_reason TEXT, approved_by BIGINT UNSIGNED, approved_at DATETIME,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_companies_tax_code (tax_code), UNIQUE KEY uq_companies_email (email),
  CONSTRAINT fk_companies_approver FOREIGN KEY (approved_by) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE company_accounts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL, company_id BIGINT UNSIGNED NOT NULL,
  position VARCHAR(100), is_owner BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_company_accounts_user (user_id),
  CONSTRAINT fk_company_accounts_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_company_accounts_company FOREIGN KEY (company_id) REFERENCES companies(id)
) ENGINE=InnoDB;

CREATE TABLE internship_periods (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL, academic_year VARCHAR(20) NOT NULL, semester VARCHAR(30) NOT NULL,
  start_date DATE NOT NULL, end_date DATE NOT NULL, registration_start DATETIME, registration_end DATETIME,
  status ENUM('draft','open','closed','completed') NOT NULL DEFAULT 'draft',
  created_by BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_period_dates CHECK (end_date >= start_date),
  CONSTRAINT fk_period_creator FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE jobs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id BIGINT UNSIGNED NOT NULL, title VARCHAR(200) NOT NULL, description TEXT NOT NULL,
  requirements TEXT, benefits TEXT, location VARCHAR(255),
  work_mode ENUM('onsite','remote','hybrid') NOT NULL DEFAULT 'onsite',
  salary_min DECIMAL(15,2), salary_max DECIMAL(15,2), quantity INT UNSIGNED NOT NULL DEFAULT 1,
  skills JSON, deadline DATE NOT NULL,
  status ENUM('draft','published','closed','expired') NOT NULL DEFAULT 'draft', created_by BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_jobs_id_company (id, company_id),
  CONSTRAINT chk_job_salary CHECK (salary_min IS NULL OR salary_max IS NULL OR salary_max >= salary_min),
  CONSTRAINT fk_jobs_company FOREIGN KEY (company_id) REFERENCES companies(id),
  CONSTRAINT fk_jobs_creator FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_jobs_company (company_id), INDEX idx_jobs_status (status), INDEX idx_jobs_deadline (deadline)
) ENGINE=InnoDB;

CREATE TABLE saved_jobs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, student_id BIGINT UNSIGNED NOT NULL,
  job_id BIGINT UNSIGNED NOT NULL, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_saved_job (student_id, job_id),
  CONSTRAINT fk_saved_jobs_student FOREIGN KEY (student_id) REFERENCES students(id),
  CONSTRAINT fk_saved_jobs_job FOREIGN KEY (job_id) REFERENCES jobs(id)
) ENGINE=InnoDB;

CREATE TABLE cvs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, student_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(150) NOT NULL, file_path VARCHAR(500) NOT NULL, file_name VARCHAR(255) NOT NULL,
  file_size BIGINT UNSIGNED NOT NULL, mime_type VARCHAR(100) NOT NULL, is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_cvs_id_student (id, student_id),
  CONSTRAINT fk_cvs_student FOREIGN KEY (student_id) REFERENCES students(id)
) ENGINE=InnoDB;

CREATE TABLE applications (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, student_id BIGINT UNSIGNED NOT NULL,
  job_id BIGINT UNSIGNED NOT NULL, cv_id BIGINT UNSIGNED NOT NULL, internship_period_id BIGINT UNSIGNED NOT NULL,
  status CHAR(2) NOT NULL DEFAULT '02', cover_letter TEXT, applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_application_period (student_id, job_id, internship_period_id),
  UNIQUE KEY uq_application_identity (id, student_id, job_id, internship_period_id),
  CONSTRAINT chk_application_status CHECK (status IN ('01','02','03','04','05','06','07','08','09','10','11','12','13','14','15')),
  CONSTRAINT fk_applications_student FOREIGN KEY (student_id) REFERENCES students(id),
  CONSTRAINT fk_applications_job FOREIGN KEY (job_id) REFERENCES jobs(id),
  CONSTRAINT fk_applications_cv FOREIGN KEY (cv_id) REFERENCES cvs(id),
  CONSTRAINT fk_applications_cv_owner FOREIGN KEY (cv_id, student_id) REFERENCES cvs(id, student_id),
  CONSTRAINT fk_applications_period FOREIGN KEY (internship_period_id) REFERENCES internship_periods(id),
  INDEX idx_applications_student (student_id), INDEX idx_applications_job (job_id), INDEX idx_applications_status (status)
) ENGINE=InnoDB;

CREATE TABLE application_events (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, application_id BIGINT UNSIGNED NOT NULL,
  from_status CHAR(2), to_status CHAR(2) NOT NULL, actor_user_id BIGINT UNSIGNED NOT NULL,
  actor_role ENUM('student','company','lecturer','admin') NOT NULL, action VARCHAR(100) NOT NULL,
  note TEXT, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_application_events_application FOREIGN KEY (application_id) REFERENCES applications(id),
  CONSTRAINT fk_application_events_actor FOREIGN KEY (actor_user_id) REFERENCES users(id),
  INDEX idx_application_events_application (application_id)
) ENGINE=InnoDB;

CREATE TABLE interviews (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, application_id BIGINT UNSIGNED NOT NULL,
  scheduled_at DATETIME NOT NULL, duration_minutes SMALLINT UNSIGNED NOT NULL DEFAULT 60,
  type ENUM('online','offline') NOT NULL, location VARCHAR(255), meeting_url VARCHAR(500), note TEXT,
  status ENUM('scheduled','confirmed','declined','completed','cancelled') NOT NULL DEFAULT 'scheduled',
  student_response ENUM('pending','accepted','declined') NOT NULL DEFAULT 'pending', student_response_note TEXT,
  result ENUM('pending','passed','failed') NOT NULL DEFAULT 'pending', result_note TEXT,
  created_by BIGINT UNSIGNED NOT NULL, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_interviews_application FOREIGN KEY (application_id) REFERENCES applications(id),
  CONSTRAINT fk_interviews_creator FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_interviews_application (application_id)
) ENGINE=InnoDB;

CREATE TABLE lecturer_assignments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, lecturer_id BIGINT UNSIGNED NOT NULL,
  student_id BIGINT UNSIGNED NOT NULL, internship_period_id BIGINT UNSIGNED NOT NULL,
  assigned_by BIGINT UNSIGNED NOT NULL, assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_assignment_period (student_id, internship_period_id),
  CONSTRAINT fk_assignments_lecturer FOREIGN KEY (lecturer_id) REFERENCES lecturers(id),
  CONSTRAINT fk_assignments_student FOREIGN KEY (student_id) REFERENCES students(id),
  CONSTRAINT fk_assignments_period FOREIGN KEY (internship_period_id) REFERENCES internship_periods(id),
  CONSTRAINT fk_assignments_actor FOREIGN KEY (assigned_by) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE internship_records (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, application_id BIGINT UNSIGNED NOT NULL,
  student_id BIGINT UNSIGNED NOT NULL, company_id BIGINT UNSIGNED NOT NULL, job_id BIGINT UNSIGNED NOT NULL,
  internship_period_id BIGINT UNSIGNED NOT NULL, lecturer_id BIGINT UNSIGNED,
  start_date DATE NOT NULL, end_date DATE NOT NULL,
  status ENUM('pending','active','evaluating','completed','cancelled') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_internship_application (application_id),
  CONSTRAINT fk_records_application FOREIGN KEY (application_id) REFERENCES applications(id),
  CONSTRAINT fk_records_application_identity FOREIGN KEY (application_id, student_id, job_id, internship_period_id) REFERENCES applications(id, student_id, job_id, internship_period_id),
  CONSTRAINT fk_records_student FOREIGN KEY (student_id) REFERENCES students(id),
  CONSTRAINT fk_records_company FOREIGN KEY (company_id) REFERENCES companies(id),
  CONSTRAINT fk_records_job FOREIGN KEY (job_id) REFERENCES jobs(id),
  CONSTRAINT fk_records_job_company FOREIGN KEY (job_id, company_id) REFERENCES jobs(id, company_id),
  CONSTRAINT fk_records_period FOREIGN KEY (internship_period_id) REFERENCES internship_periods(id),
  CONSTRAINT fk_records_lecturer FOREIGN KEY (lecturer_id) REFERENCES lecturers(id),
  INDEX idx_records_student (student_id), INDEX idx_records_lecturer (lecturer_id)
) ENGINE=InnoDB;

CREATE TABLE internship_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, internship_record_id BIGINT UNSIGNED NOT NULL,
  log_date DATE NOT NULL, title VARCHAR(200) NOT NULL, content TEXT NOT NULL,
  work_hours DECIMAL(5,2), status ENUM('draft','submitted','reviewed') NOT NULL DEFAULT 'draft',
  lecturer_feedback TEXT, reviewed_by BIGINT UNSIGNED, reviewed_at DATETIME,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_logs_record FOREIGN KEY (internship_record_id) REFERENCES internship_records(id),
  CONSTRAINT fk_logs_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE reports (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, internship_record_id BIGINT UNSIGNED NOT NULL,
  report_type ENUM('progress','final') NOT NULL, version INT UNSIGNED NOT NULL,
  file_path VARCHAR(500) NOT NULL, file_name VARCHAR(255) NOT NULL, mime_type VARCHAR(100) NOT NULL,
  file_size BIGINT UNSIGNED NOT NULL,
  status ENUM('draft','submitted','revision_required','approved') NOT NULL DEFAULT 'draft',
  submitted_at DATETIME, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_report_version (internship_record_id, report_type, version),
  CONSTRAINT fk_reports_record FOREIGN KEY (internship_record_id) REFERENCES internship_records(id)
) ENGINE=InnoDB;

CREATE TABLE report_reviews (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, report_id BIGINT UNSIGNED NOT NULL,
  lecturer_id BIGINT UNSIGNED NOT NULL, decision ENUM('approved','revision_required') NOT NULL,
  feedback TEXT, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_report_reviews_report FOREIGN KEY (report_id) REFERENCES reports(id),
  CONSTRAINT fk_report_reviews_lecturer FOREIGN KEY (lecturer_id) REFERENCES lecturers(id)
) ENGINE=InnoDB;

CREATE TABLE evaluation_criteria (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, name VARCHAR(150) NOT NULL, description TEXT,
  evaluator_type ENUM('company','lecturer') NOT NULL, max_score DECIMAL(6,2) NOT NULL,
  weight DECIMAL(6,3) NOT NULL, active BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

CREATE TABLE evaluations (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, internship_record_id BIGINT UNSIGNED NOT NULL,
  evaluator_user_id BIGINT UNSIGNED NOT NULL, evaluator_role ENUM('company','lecturer') NOT NULL,
  total_score DECIMAL(6,2) NOT NULL, comment TEXT, submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_evaluation_role (internship_record_id, evaluator_role),
  CONSTRAINT fk_evaluations_record FOREIGN KEY (internship_record_id) REFERENCES internship_records(id),
  CONSTRAINT fk_evaluations_user FOREIGN KEY (evaluator_user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE evaluation_details (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, evaluation_id BIGINT UNSIGNED NOT NULL,
  criteria_id BIGINT UNSIGNED NOT NULL, score DECIMAL(6,2) NOT NULL, comment TEXT,
  UNIQUE KEY uq_evaluation_criteria (evaluation_id, criteria_id),
  CONSTRAINT fk_evaluation_details_evaluation FOREIGN KEY (evaluation_id) REFERENCES evaluations(id),
  CONSTRAINT fk_evaluation_details_criteria FOREIGN KEY (criteria_id) REFERENCES evaluation_criteria(id)
) ENGINE=InnoDB;

CREATE TABLE internship_scores (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, internship_record_id BIGINT UNSIGNED NOT NULL,
  company_score DECIMAL(6,2), lecturer_score DECIMAL(6,2), report_score DECIMAL(6,2),
  final_score DECIMAL(6,2), classification VARCHAR(50), calculated_at DATETIME, confirmed_by BIGINT UNSIGNED,
  UNIQUE KEY uq_internship_score (internship_record_id),
  CONSTRAINT fk_scores_record FOREIGN KEY (internship_record_id) REFERENCES internship_records(id),
  CONSTRAINT fk_scores_confirmer FOREIGN KEY (confirmed_by) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE notifications (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, recipient_user_id BIGINT UNSIGNED NOT NULL,
  type VARCHAR(100) NOT NULL, title VARCHAR(255) NOT NULL, message TEXT NOT NULL,
  entity_type VARCHAR(100), entity_id BIGINT UNSIGNED, is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at DATETIME, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_recipient FOREIGN KEY (recipient_user_id) REFERENCES users(id),
  INDEX idx_notifications_recipient (recipient_user_id), INDEX idx_notifications_read (is_read)
) ENGINE=InnoDB;

CREATE TABLE refresh_tokens (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, user_id BIGINT UNSIGNED NOT NULL,
  token_hash CHAR(64) NOT NULL, family_id CHAR(36) NOT NULL, expires_at DATETIME NOT NULL,
  revoked_at DATETIME, replaced_by_hash CHAR(64), created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_refresh_token_hash (token_hash),
  CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_refresh_tokens_user (user_id), INDEX idx_refresh_tokens_family (family_id)
) ENGINE=InnoDB;

CREATE TABLE password_reset_tokens (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, user_id BIGINT UNSIGNED NOT NULL,
  token_hash CHAR(64) NOT NULL, expires_at DATETIME NOT NULL, used_at DATETIME,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_password_reset_hash (token_hash),
  CONSTRAINT fk_password_reset_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE audit_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, actor_user_id BIGINT UNSIGNED,
  action VARCHAR(150) NOT NULL, entity_type VARCHAR(100) NOT NULL, entity_id BIGINT UNSIGNED,
  old_values JSON, new_values JSON, ip_address VARCHAR(45), user_agent VARCHAR(500),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_actor FOREIGN KEY (actor_user_id) REFERENCES users(id),
  INDEX idx_audit_actor (actor_user_id), INDEX idx_audit_created (created_at)
) ENGINE=InnoDB;

CREATE TABLE articles (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL, body LONGTEXT NOT NULL,
  status ENUM('draft','published','archived') NOT NULL DEFAULT 'draft', created_by BIGINT UNSIGNED NOT NULL,
  published_at DATETIME, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_articles_slug (slug),
  CONSTRAINT fk_articles_creator FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;
