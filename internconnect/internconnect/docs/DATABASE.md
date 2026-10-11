# Import database InternConnect

Thư mục `database/` có đúng ba file. Dùng MySQL **8.0.16 trở lên**, cùng một MySQL server cho hai database.

## Thứ tự import

| Thứ tự | File | Kết quả |
| --- | --- | --- |
| 1 | `database/01_school.sql` | Tạo `internconnect_school`, 21 bảng của nhà trường và hệ thống |
| 2 | `database/02_company.sql` | Tạo `internconnect_company`, 6 bảng tuyển dụng và khóa ngoại liên kết hai database |
| 3 | `database/03_seed.sql` | Thêm dữ liệu mẫu vào cả hai database |

Trong **MySQL Workbench**, chọn **File → Open SQL Script**, mở từng file và chạy **toàn bộ file** theo thứ tự trên. Refresh Schemas để thấy hai database. Không cần chọn database trước vì mỗi file đã có `CREATE DATABASE`/`USE` phù hợp.

Hoặc mở MySQL client rồi chạy:

```sql
SOURCE D:/DOAN/internconnect/internconnect/database/01_school.sql;
SOURCE D:/DOAN/internconnect/internconnect/database/02_company.sql;
SOURCE D:/DOAN/internconnect/internconnect/database/03_seed.sql;
```

Chỉ chạy một lần vào database mới hoặc trống. File không xóa database cũ và không vô hiệu hóa kiểm tra khóa ngoại. Kết quả cuối seed: **8 tài khoản, 6 tin tuyển dụng, 2 hồ sơ ứng tuyển**. Không chạy seed lần hai vì email, mã sinh viên và mã số thuế là duy nhất.

## Cấu hình backend

```dotenv
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_SCHOOL_NAME=internconnect_school
DB_COMPANY_NAME=internconnect_company
```

Backend chọn database nhà trường làm mặc định, dùng tên database doanh nghiệp từ cấu hình trong các truy vấn tuyển dụng. Một kết nối MySQL thực hiện transaction trên cả hai bên, nên đăng ký doanh nghiệp, xét duyệt và workflow thực tập vẫn rollback đồng thời nếu lỗi. Tài khoản backend cần quyền SELECT/INSERT/UPDATE/DELETE trên cả hai database; tài khoản import cần quyền tạo database, bảng và khóa ngoại. `DB_NAME` cũ được hỗ trợ như tên thay thế cho database nhà trường khi chưa có `DB_SCHOOL_NAME`.

## Phân chia dữ liệu

**Nhà trường — `internconnect_school`:** users, students, lecturers, internship_periods, saved_jobs, cvs, lecturer_assignments, internship_records, internship_logs, reports, report_reviews, evaluation_criteria, evaluations, evaluation_details, internship_scores, notifications, refresh_tokens, password_reset_tokens, audit_logs, articles.

**Doanh nghiệp — `internconnect_company`:** companies, company_accounts, jobs, applications, application_events, interviews.

`users` là danh tính đăng nhập dùng chung cho bốn vai trò, lưu tại nhà trường; `company_accounts` liên kết người dùng doanh nghiệp với công ty. Hồ sơ ứng tuyển và lịch phỏng vấn chỉ có một nguồn dữ liệu tại doanh nghiệp. Nhà trường xét duyệt trực tiếp nguồn này, tránh sao chép và lệch trạng thái.

Khóa ngoại kiểm tra cả liên kết giữa hai database: sinh viên/CV/kỳ thực tập của hồ sơ ứng tuyển, doanh nghiệp của tin tuyển dụng và thông tin hồ sơ thực tập. Các liên kết từ bảng nhà trường sang doanh nghiệp được thêm ở cuối file thứ hai, khi tất cả bảng đã tồn tại.

## Tài khoản mẫu

| Vai trò | Email | Mật khẩu |
| --- | --- | --- |
| Nhà trường | admin@internconnect.vn | Admin@123 |
| Sinh viên | sv001@internconnect.vn, sv002@internconnect.vn | Student@123 |
| Giảng viên | gv001@internconnect.vn, gv002@internconnect.vn | Lecturer@123 |
| Doanh nghiệp đã duyệt | company1@internconnect.vn, company2@internconnect.vn | Company@123 |
| Doanh nghiệp chờ duyệt | pending@internconnect.vn | Company@123 |

Tài khoản doanh nghiệp chờ duyệt chưa được phép đăng nhập. Dữ liệu mẫu phục vụ phát triển và trình diễn; mật khẩu được hash bằng bcrypt. CV mẫu chỉ có bản ghi minh họa, cần tải PDF thật lên để thử tải tài liệu. Ngày thực tập và hạn tuyển dụng tính theo ngày import. Hai tin đã duyệt hiển thị cho sinh viên; bốn tin còn lại minh họa bản nháp, chờ duyệt, yêu cầu chỉnh sửa và từ chối.

Sau import và cấu hình `.env`, khởi động lại API bằng `npm.cmd run server`.

## Kiểm thử

Trên hai database phát triển, dùng PowerShell:

```powershell
$env:RUN_DB_TESTS='1'
$env:RUN_API_TESTS='1'
npm.cmd test
```

Kiểm thử có tạo và dọn dữ liệu tạm; bao gồm quyền truy cập, duyệt tin, workflow, khóa ngoại và rollback giữa hai database.

## Account provisioning

See [ACCOUNT_PROVISIONING.md](ACCOUNT_PROVISIONING.md) for the additive account invitation migration and SMTP setup. Existing databases: run `npm.cmd run db:migrate`; do not reimport seed.
