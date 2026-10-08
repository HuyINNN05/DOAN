-- Chạy sau khi import hai schema và hai bộ seed.
-- Cần cùng một MySQL/MariaDB server và tài khoản có SELECT trên cả hai CSDL.
SELECT r.id AS record_id, sa.full_name AS student_name,
       s.student_code, c.name AS company_name, j.title AS job_title,
       la.full_name AS lecturer_name, p.name AS period_name,
       a.status AS application_status, r.status AS internship_status
FROM internconnect_school.internship_records AS r
JOIN internconnect_school.students AS s ON s.id = r.student_id
JOIN internconnect_school.accounts AS sa ON sa.id = s.account_id
JOIN internconnect_company.applications AS a ON a.id = r.application_id AND a.student_id = r.student_id
JOIN internconnect_company.jobs AS j ON j.id = a.job_id AND j.id = r.job_id
JOIN internconnect_company.companies AS c ON c.id = j.company_id AND c.id = r.company_id
LEFT JOIN internconnect_school.lecturers AS l ON l.id = r.lecturer_id
LEFT JOIN internconnect_school.accounts AS la ON la.id = l.account_id
LEFT JOIN internconnect_school.internship_periods AS p ON p.id = r.period_id;

-- Phát hiện hồ sơ tham chiếu sai giữa hai CSDL. Kết quả phải rỗng với dữ liệu mẫu.
SELECT r.id AS invalid_record_id
FROM internconnect_school.internship_records AS r
LEFT JOIN internconnect_company.applications AS a ON a.id = r.application_id
LEFT JOIN internconnect_company.jobs AS j ON j.id = a.job_id
WHERE a.id IS NULL OR j.id IS NULL OR a.student_id <> r.student_id
   OR j.id <> r.job_id OR j.company_id <> r.company_id;

SELECT a.id AS invalid_application_id
FROM internconnect_company.applications AS a
LEFT JOIN internconnect_school.students AS s ON s.id = a.student_id
LEFT JOIN internconnect_school.cvs AS cv ON cv.id = a.cv_id
WHERE s.id IS NULL OR (a.cv_id IS NOT NULL AND (cv.id IS NULL OR cv.student_id <> a.student_id));
