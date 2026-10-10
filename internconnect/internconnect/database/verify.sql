USE internconnect;

SELECT VERSION() AS mysql_version, DATABASE() AS active_database,
       @@character_set_database AS database_charset,
       @@collation_database AS database_collation;

SELECT COUNT(*) AS table_count
FROM information_schema.tables
WHERE table_schema = 'internconnect' AND table_type = 'BASE TABLE';

SELECT COUNT(*) AS foreign_key_count
FROM information_schema.referential_constraints
WHERE constraint_schema = 'internconnect';

SELECT
  (SELECT COUNT(*) FROM internconnect.users) AS users,
  (SELECT COUNT(*) FROM internconnect.students) AS students,
  (SELECT COUNT(*) FROM internconnect.lecturers) AS lecturers,
  (SELECT COUNT(*) FROM internconnect.companies) AS companies,
  (SELECT COUNT(*) FROM internconnect.jobs) AS jobs,
  (SELECT COUNT(*) FROM internconnect.applications) AS applications,
  (SELECT COUNT(*) FROM internconnect.lecturer_assignments) AS assignments,
  (SELECT COUNT(*) FROM internconnect.evaluation_criteria) AS evaluation_criteria;

SELECT role, status, COUNT(*) AS total
FROM internconnect.users
GROUP BY role, status
ORDER BY role, status;

SELECT id, student_id, job_id, internship_period_id, status
FROM internconnect.applications
ORDER BY id;

SELECT 'OK' AS verification_result
WHERE (SELECT COUNT(*) FROM internconnect.users) >= 8
  AND (SELECT COUNT(*) FROM internconnect.students) >= 2
  AND (SELECT COUNT(*) FROM internconnect.lecturers) >= 2
  AND (SELECT COUNT(*) FROM internconnect.companies WHERE status = 'approved') >= 2
  AND (SELECT COUNT(*) FROM internconnect.companies WHERE status = 'pending') >= 1
  AND (SELECT COUNT(*) FROM internconnect.applications) >= 2;
