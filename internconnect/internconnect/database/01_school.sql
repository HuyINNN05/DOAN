-- InternConnect | School database | MySQL 8.0.16+
-- Import order: 01_school.sql -> 02_company.sql -> 03_seed.sql.
-- Company links are added by 02_company.sql after its tables exist.
SET NAMES utf8mb4;
CREATE DATABASE IF NOT EXISTS internconnect_school CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE internconnect_school;

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
  faculty VARCHAR(150),
  major VARCHAR(150),
  class_name VARCHAR(100),
  course VARCHAR(50),
  gpa DECIMAL(4,2),
  date_of_birth DATE,
  gender ENUM('male','female','other'),
  address VARCHAR(255),
  bio TEXT,
  skills JSON,
  avatar_url VARCHAR(500),
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
  faculty VARCHAR(150),
  department VARCHAR(150),
  academic_title VARCHAR(100),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_lecturers_user (user_id),
  UNIQUE KEY uq_lecturers_code (lecturer_code),
  CONSTRAINT fk_lecturers_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE internship_periods (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  academic_year VARCHAR(20) NOT NULL,
  semester VARCHAR(30) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  registration_start DATETIME,
  registration_end DATETIME,
  status ENUM('draft','open','closed','completed') NOT NULL DEFAULT 'draft',
  created_by BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_period_dates CHECK (end_date >= start_date),
  CONSTRAINT fk_period_creator FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE saved_jobs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id BIGINT UNSIGNED NOT NULL,
  job_id BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_saved_job (student_id, job_id),
  CONSTRAINT fk_saved_jobs_student FOREIGN KEY (student_id) REFERENCES students(id)
) ENGINE=InnoDB;

CREATE TABLE cvs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(150) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT UNSIGNED NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_cvs_id_student (id, student_id),
  CONSTRAINT fk_cvs_student FOREIGN KEY (student_id) REFERENCES students(id)
) ENGINE=InnoDB;

CREATE TABLE lecturer_assignments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  lecturer_id BIGINT UNSIGNED NOT NULL,
  student_id BIGINT UNSIGNED NOT NULL,
  internship_period_id BIGINT UNSIGNED NOT NULL,
  assigned_by BIGINT UNSIGNED NOT NULL,
  assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_assignment_period (student_id, internship_period_id),
  CONSTRAINT fk_assignments_lecturer FOREIGN KEY (lecturer_id) REFERENCES lecturers(id),
  CONSTRAINT fk_assignments_student FOREIGN KEY (student_id) REFERENCES students(id),
  CONSTRAINT fk_assignments_period FOREIGN KEY (internship_period_id) REFERENCES internship_periods(id),
  CONSTRAINT fk_assignments_actor FOREIGN KEY (assigned_by) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE internship_records (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  application_id BIGINT UNSIGNED NOT NULL,
  student_id BIGINT UNSIGNED NOT NULL,
  company_id BIGINT UNSIGNED NOT NULL,
  job_id BIGINT UNSIGNED NOT NULL,
  internship_period_id BIGINT UNSIGNED NOT NULL,
  lecturer_id BIGINT UNSIGNED,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status ENUM('pending','active','evaluating','completed','cancelled') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_internship_application (application_id),
  CONSTRAINT fk_records_student FOREIGN KEY (student_id) REFERENCES students(id),
  CONSTRAINT fk_records_period FOREIGN KEY (internship_period_id) REFERENCES internship_periods(id),
  CONSTRAINT fk_records_lecturer FOREIGN KEY (lecturer_id) REFERENCES lecturers(id),
  INDEX idx_records_student (student_id),
  INDEX idx_records_lecturer (lecturer_id),
  CONSTRAINT chk_record_dates CHECK (end_date >= start_date)
) ENGINE=InnoDB;

CREATE TABLE internship_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  internship_record_id BIGINT UNSIGNED NOT NULL,
  log_date DATE NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  work_hours DECIMAL(5,2),
  status ENUM('draft','submitted','reviewed') NOT NULL DEFAULT 'draft',
  lecturer_feedback TEXT,
  reviewed_by BIGINT UNSIGNED,
  reviewed_at DATETIME,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_logs_record FOREIGN KEY (internship_record_id) REFERENCES internship_records(id),
  CONSTRAINT fk_logs_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id),
  INDEX idx_logs_record_date (internship_record_id, log_date)
) ENGINE=InnoDB;

CREATE TABLE reports (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  internship_record_id BIGINT UNSIGNED NOT NULL,
  report_type ENUM('progress','final') NOT NULL,
  version INT UNSIGNED NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size BIGINT UNSIGNED NOT NULL,
  status ENUM('draft','submitted','revision_required','approved') NOT NULL DEFAULT 'draft',
  submitted_at DATETIME,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_report_version (internship_record_id, report_type, version),
  CONSTRAINT fk_reports_record FOREIGN KEY (internship_record_id) REFERENCES internship_records(id),
  INDEX idx_reports_status (status, submitted_at)
) ENGINE=InnoDB;

CREATE TABLE report_reviews (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  report_id BIGINT UNSIGNED NOT NULL,
  lecturer_id BIGINT UNSIGNED NOT NULL,
  decision ENUM('approved','revision_required') NOT NULL,
  feedback TEXT,
  score DECIMAL(4,2),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_report_review_score CHECK (score IS NULL OR (score >= 0 AND score <= 10)),
  CONSTRAINT fk_report_reviews_report FOREIGN KEY (report_id) REFERENCES reports(id),
  CONSTRAINT fk_report_reviews_lecturer FOREIGN KEY (lecturer_id) REFERENCES lecturers(id)
) ENGINE=InnoDB;

CREATE TABLE evaluation_criteria (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  evaluator_type ENUM('company','lecturer') NOT NULL,
  max_score DECIMAL(6,2) NOT NULL,
  weight DECIMAL(6,3) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

CREATE TABLE evaluations (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  internship_record_id BIGINT UNSIGNED NOT NULL,
  evaluator_user_id BIGINT UNSIGNED NOT NULL,
  evaluator_role ENUM('company','lecturer') NOT NULL,
  total_score DECIMAL(6,2) NOT NULL,
  comment TEXT,
  submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_evaluation_role (internship_record_id, evaluator_role),
  CONSTRAINT fk_evaluations_record FOREIGN KEY (internship_record_id) REFERENCES internship_records(id),
  CONSTRAINT fk_evaluations_user FOREIGN KEY (evaluator_user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE evaluation_details (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  evaluation_id BIGINT UNSIGNED NOT NULL,
  criteria_id BIGINT UNSIGNED NOT NULL,
  score DECIMAL(6,2) NOT NULL,
  comment TEXT,
  UNIQUE KEY uq_evaluation_criteria (evaluation_id, criteria_id),
  CONSTRAINT fk_evaluation_details_evaluation FOREIGN KEY (evaluation_id) REFERENCES evaluations(id),
  CONSTRAINT fk_evaluation_details_criteria FOREIGN KEY (criteria_id) REFERENCES evaluation_criteria(id)
) ENGINE=InnoDB;

CREATE TABLE internship_scores (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  internship_record_id BIGINT UNSIGNED NOT NULL,
  company_score DECIMAL(6,2),
  lecturer_score DECIMAL(6,2),
  report_score DECIMAL(6,2),
  final_score DECIMAL(6,2),
  classification VARCHAR(50),
  calculated_at DATETIME,
  confirmed_by BIGINT UNSIGNED,
  UNIQUE KEY uq_internship_score (internship_record_id),
  CONSTRAINT fk_scores_record FOREIGN KEY (internship_record_id) REFERENCES internship_records(id),
  CONSTRAINT fk_scores_confirmer FOREIGN KEY (confirmed_by) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE notifications (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  recipient_user_id BIGINT UNSIGNED NOT NULL,
  type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  entity_type VARCHAR(100),
  entity_id BIGINT UNSIGNED,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at DATETIME,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_recipient FOREIGN KEY (recipient_user_id) REFERENCES users(id),
  INDEX idx_notifications_recipient (recipient_user_id),
  INDEX idx_notifications_read (is_read),
  INDEX idx_notifications_inbox (recipient_user_id, is_read, created_at)
) ENGINE=InnoDB;

CREATE TABLE refresh_tokens (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  token_hash CHAR(64) NOT NULL,
  family_id CHAR(36) NOT NULL,
  expires_at DATETIME NOT NULL,
  revoked_at DATETIME,
  replaced_by_hash CHAR(64),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_refresh_token_hash (token_hash),
  CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_refresh_tokens_user (user_id),
  INDEX idx_refresh_tokens_family (family_id)
) ENGINE=InnoDB;

CREATE TABLE password_reset_tokens (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  token_hash CHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_password_reset_hash (token_hash),
  CONSTRAINT fk_password_reset_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE audit_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  actor_user_id BIGINT UNSIGNED,
  action VARCHAR(150) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id BIGINT UNSIGNED,
  old_values JSON,
  new_values JSON,
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_actor FOREIGN KEY (actor_user_id) REFERENCES users(id),
  INDEX idx_audit_actor (actor_user_id),
  INDEX idx_audit_created (created_at),
  INDEX idx_audit_entity (entity_type, entity_id)
) ENGINE=InnoDB;

CREATE TABLE articles (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  body LONGTEXT NOT NULL,
  status ENUM('draft','published','archived') NOT NULL DEFAULT 'draft',
  created_by BIGINT UNSIGNED NOT NULL,
  published_at DATETIME,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_articles_slug (slug),
  CONSTRAINT fk_articles_creator FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE account_invitations (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  token_hash CHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  delivery_status ENUM('pending','sent','failed','not_configured') NOT NULL DEFAULT 'pending',
  delivery_code VARCHAR(100) NULL,
  attempted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  sent_at DATETIME NULL,
  created_by BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_account_invitation_user (user_id),
  UNIQUE KEY uq_account_invitation_token (token_hash),
  CONSTRAINT fk_account_invitation_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_account_invitation_actor FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB;

SELECT 'School structure created; import 02_company.sql next' AS import_result;
