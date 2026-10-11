-- InternConnect | Demo data for both databases | Development only
-- Requires 01_school.sql and 02_company.sql. Import once on empty tables.
SET NAMES utf8mb4;
USE internconnect_school;

START TRANSACTION;

INSERT INTO users (email,password_hash,full_name,phone,role,status) VALUES
('admin@internconnect.vn','$2b$12$LRdJ24F2BQI8LXSgxCrUg.GN9mNTXuNLXiMA1sb6b2xhb7bG1bW6u','Quản trị InternConnect','0901000001','admin','active'),
('sv001@internconnect.vn','$2b$12$5jvg.a/9ocN0iUS4mQZs9eWVE0f0c94OT06iVLgwI1kSP25oP7lfu','Nguyễn Minh Anh','0902000001','student','active'),
('sv002@internconnect.vn','$2b$12$5jvg.a/9ocN0iUS4mQZs9eWVE0f0c94OT06iVLgwI1kSP25oP7lfu','Trần Hoàng Nam','0902000002','student','active'),
('gv001@internconnect.vn','$2b$12$jiyFmQ7bOAG.PZnImBzKYu0EfY9Bw40AzJMj5d/o3ThxAQox2FIKm','TS. Lê Thu Hà','0903000001','lecturer','active'),
('gv002@internconnect.vn','$2b$12$jiyFmQ7bOAG.PZnImBzKYu0EfY9Bw40AzJMj5d/o3ThxAQox2FIKm','ThS. Phạm Quốc Bảo','0903000002','lecturer','active'),
('company1@internconnect.vn','$2b$12$PovO10M1kMcZAbVnsPu.3upHzRzQ8pkajwitMywJV2RaKM.eIUL9S','Đại diện ABC Tech','0904000001','company','active'),
('company2@internconnect.vn','$2b$12$PovO10M1kMcZAbVnsPu.3upHzRzQ8pkajwitMywJV2RaKM.eIUL9S','Đại diện Nova Digital','0904000002','company','active'),
('pending@internconnect.vn','$2b$12$PovO10M1kMcZAbVnsPu.3upHzRzQ8pkajwitMywJV2RaKM.eIUL9S','Đại diện Pending Co','0904000003','company','pending');

SET @admin=(SELECT id FROM users WHERE email='admin@internconnect.vn');
SET @sv1=(SELECT id FROM users WHERE email='sv001@internconnect.vn');
SET @sv2=(SELECT id FROM users WHERE email='sv002@internconnect.vn');
SET @gv1=(SELECT id FROM users WHERE email='gv001@internconnect.vn');
SET @gv2=(SELECT id FROM users WHERE email='gv002@internconnect.vn');
SET @ca1=(SELECT id FROM users WHERE email='company1@internconnect.vn');
SET @ca2=(SELECT id FROM users WHERE email='company2@internconnect.vn');
SET @cap=(SELECT id FROM users WHERE email='pending@internconnect.vn');

INSERT INTO students(user_id,student_code,faculty,major,class_name,course,gpa,skills) VALUES
(@sv1,'SV001','Công nghệ thông tin','Kỹ thuật phần mềm','D22CQCN01','2022',3.45,JSON_ARRAY('React','Node.js','MySQL')),
(@sv2,'SV002','Công nghệ thông tin','Hệ thống thông tin','D22CQHT01','2022',3.20,JSON_ARRAY('Java','SQL'));
INSERT INTO lecturers(user_id,lecturer_code,faculty,department,academic_title) VALUES
(@gv1,'GV001','Công nghệ thông tin','Kỹ thuật phần mềm','Tiến sĩ'),
(@gv2,'GV002','Công nghệ thông tin','Hệ thống thông tin','Thạc sĩ');

INSERT INTO internconnect_company.companies(name,tax_code,email,phone,address,industry,company_size,status,approved_by,approved_at) VALUES
('ABC Technology','0109999999','contact@abc.vn','0281111111','TP. Hồ Chí Minh','Phần mềm','100-499','approved',@admin,NOW()),
('Nova Digital','0108888888','contact@nova.vn','0282222222','Hà Nội','Công nghệ','50-99','approved',@admin,NOW()),
('Pending Company','0107777777','contact@pending.vn','0283333333','Đà Nẵng','Dịch vụ','10-49','pending',NULL,NULL);
SET @c1=(SELECT id FROM internconnect_company.companies WHERE tax_code='0109999999'); SET @c2=(SELECT id FROM internconnect_company.companies WHERE tax_code='0108888888'); SET @cp=(SELECT id FROM internconnect_company.companies WHERE tax_code='0107777777');
INSERT INTO internconnect_company.company_accounts(user_id,company_id,position,is_owner) VALUES (@ca1,@c1,'HR Manager',TRUE),(@ca2,@c2,'Recruiter',TRUE),(@cap,@cp,'Giám đốc',TRUE);

INSERT INTO internship_periods(name,academic_year,semester,start_date,end_date,registration_start,registration_end,status,created_by)
VALUES(CONCAT('Thực tập năm học ',YEAR(CURRENT_DATE),'-',YEAR(CURRENT_DATE)+1),CONCAT(YEAR(CURRENT_DATE),'-',YEAR(CURRENT_DATE)+1),'1',DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY),DATE_ADD(CURRENT_DATE, INTERVAL 120 DAY),DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY),DATE_ADD(CURRENT_DATE, INTERVAL 90 DAY),'open',@admin);
SET @period=LAST_INSERT_ID();
INSERT INTO internconnect_company.jobs(company_id,title,description,requirements,location,work_mode,salary_min,salary_max,quantity,skills,deadline,status,created_by,review_status,reviewed_by,reviewed_at) VALUES
(@c1,'React Developer Intern','Phát triển giao diện sản phẩm.','Kiến thức React và REST API.','TP. Hồ Chí Minh','hybrid',3000000,5000000,3,JSON_ARRAY('React','JavaScript'),DATE_ADD(CURRENT_DATE, INTERVAL 90 DAY),'published',@ca1,'approved',@admin,NOW()),
(@c2,'Backend Node.js Intern','Xây dựng REST API.','Kiến thức Node.js và MySQL.','Hà Nội','onsite',4000000,6000000,2,JSON_ARRAY('Node.js','MySQL'),DATE_ADD(CURRENT_DATE, INTERVAL 90 DAY),'published',@ca2,'approved',@admin,NOW());
SET @job1=(SELECT id FROM internconnect_company.jobs WHERE title='React Developer Intern');
SET @job2=(SELECT id FROM internconnect_company.jobs WHERE title='Backend Node.js Intern');
SET @student1=(SELECT id FROM students WHERE student_code='SV001'); SET @student2=(SELECT id FROM students WHERE student_code='SV002');
SET @lecturer1=(SELECT id FROM lecturers WHERE lecturer_code='GV001');
SET @lecturer2=(SELECT id FROM lecturers WHERE lecturer_code='GV002');
INSERT INTO cvs(student_id,name,file_path,file_name,file_size,mime_type,is_default) VALUES
(@student1,'CV chính','seed/cv-sv001.pdf','cv-sv001.pdf',102400,'application/pdf',TRUE),
(@student2,'CV chính','seed/cv-sv002.pdf','cv-sv002.pdf',102400,'application/pdf',TRUE);
SET @cv1=(SELECT id FROM cvs WHERE student_id=@student1 LIMIT 1);
SET @cv2=(SELECT id FROM cvs WHERE student_id=@student2 LIMIT 1);
INSERT INTO internconnect_company.applications(student_id,job_id,cv_id,internship_period_id,status,cover_letter) VALUES
(@student1,@job1,@cv1,@period,'04','Mong muốn được học hỏi tại doanh nghiệp.'),
(@student2,@job2,@cv2,@period,'02','Mong muốn phát triển kỹ năng backend.');
SET @app1=LAST_INSERT_ID();
SET @app2=(SELECT id FROM internconnect_company.applications WHERE student_id=@student2 AND job_id=@job2 AND internship_period_id=@period);
INSERT INTO internconnect_company.application_events(application_id,from_status,to_status,actor_user_id,actor_role,action,note) VALUES
(@app1,'01','02',@sv1,'student','APPLY','Sinh viên ứng tuyển'),(@app1,'02','03',@admin,'admin','CONFIRM','Nhà trường xác nhận'),(@app1,'03','04',@admin,'admin','FORWARD','Gửi hồ sơ đến doanh nghiệp');
INSERT INTO internconnect_company.application_events(application_id,from_status,to_status,actor_user_id,actor_role,action,note) VALUES
(@app2,'01','02',@sv2,'student','APPLY','Sinh viên ứng tuyển');
INSERT INTO lecturer_assignments(lecturer_id,student_id,internship_period_id,assigned_by) VALUES
(@lecturer1,@student1,@period,@admin),(@lecturer2,@student2,@period,@admin);
INSERT INTO notifications(recipient_user_id,type,title,message,entity_type,entity_id) VALUES (@sv1,'application','Hồ sơ đã được gửi','Hồ sơ đã được gửi đến doanh nghiệp.','application',@app1);
INSERT INTO evaluation_criteria(name,description,evaluator_type,max_score,weight,active) VALUES
('Thái độ và kỷ luật','Tinh thần trách nhiệm và tuân thủ quy định','company',10,0.30,TRUE),
('Năng lực chuyên môn','Khả năng hoàn thành công việc chuyên môn','company',10,0.50,TRUE),
('Giao tiếp và hợp tác','Khả năng làm việc cùng đồng nghiệp','company',10,0.20,TRUE),
('Tiến độ thực tập','Mức độ hoàn thành kế hoạch thực tập','lecturer',10,0.30,TRUE),
('Chất lượng nhật ký','Nội dung và tính đều đặn của nhật ký','lecturer',10,0.20,TRUE),
('Chất lượng báo cáo','Cấu trúc, nội dung và kết quả báo cáo','lecturer',10,0.50,TRUE);

-- Review workflow examples. Only approved jobs are visible to students.
INSERT INTO internconnect_company.jobs(company_id,title,description,requirements,location,work_mode,quantity,skills,deadline,status,created_by,review_status,review_note,reviewed_by,reviewed_at) VALUES
(@c1,'Frontend Intern - Bản nháp','Tin mẫu đang được doanh nghiệp soạn thảo.','HTML, CSS và JavaScript.','TP. Hồ Chí Minh','hybrid',2,JSON_ARRAY('HTML','CSS'),DATE_ADD(CURRENT_DATE, INTERVAL 90 DAY),'draft',@ca1,'draft',NULL,NULL,NULL),
(@c1,'QA Intern - Chờ duyệt','Thực tập kiểm thử phần mềm và viết test case.','Có kiến thức kiểm thử cơ bản.','TP. Hồ Chí Minh','onsite',2,JSON_ARRAY('Testing'),DATE_ADD(CURRENT_DATE, INTERVAL 90 DAY),'draft',@ca1,'pending',NULL,NULL,NULL),
(@c2,'Data Intern - Yêu cầu chỉnh sửa','Thực tập phân tích dữ liệu và xây dựng báo cáo.','SQL và tư duy phân tích.','Hà Nội','hybrid',1,JSON_ARRAY('SQL'),DATE_ADD(CURRENT_DATE, INTERVAL 90 DAY),'draft',@ca2,'changes_requested','Bổ sung người hướng dẫn và lịch làm việc cụ thể.',@admin,NOW()),
(@c2,'Marketing Intern - Từ chối','Tin mẫu minh họa kết quả xét duyệt của nhà trường.','Kiến thức marketing cơ bản.','Hà Nội','onsite',1,JSON_ARRAY('Marketing'),DATE_ADD(CURRENT_DATE, INTERVAL 90 DAY),'draft',@ca2,'rejected','Nội dung chưa phù hợp với ngành thực tập đang tiếp nhận.',@admin,NOW());

COMMIT;

SELECT (SELECT COUNT(*) FROM internconnect_school.users) AS demo_users,
       (SELECT COUNT(*) FROM internconnect_company.jobs) AS demo_jobs,
       (SELECT COUNT(*) FROM internconnect_company.applications) AS demo_applications;
