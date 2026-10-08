# Hai cơ sở dữ liệu InternConnect

`internconnect_school` chứa dữ liệu nhà trường. `internconnect_company` chứa dữ liệu của tất cả doanh nghiệp, phân biệt bằng `company_id`; không tạo một CSDL riêng cho mỗi công ty.

## Phân chia dữ liệu

| CSDL | Dữ liệu sở hữu |
| --- | --- |
| Nhà trường | Tài khoản sinh viên/giảng viên/admin, hồ sơ sinh viên, CV, kỳ thực tập, phân công, hồ sơ thực tập, nhật ký, báo cáo, điểm giảng viên, điểm tổng kết, bài viết, lịch sử duyệt doanh nghiệp |
| Doanh nghiệp | Công ty, tài khoản nhân sự, tin tuyển dụng, đơn ứng tuyển, lịch sử trạng thái 01–15, phỏng vấn, đề nghị thực tập, đánh giá doanh nghiệp |

Mỗi bên có thông báo và nhật ký thao tác của mình. Nhà trường có quyền xử lý ứng tuyển và phê duyệt doanh nghiệp qua backend dù dữ liệu đó nằm trong CSDL doanh nghiệp.

## Liên kết

| Trường tham chiếu | Bản ghi đích |
| --- | --- |
| company.applications.student_id | school.students.id |
| company.applications.cv_id | school.cvs.id |
| school.internship_records.application_id | company.applications.id |
| school.internship_records.company_id | company.companies.id |
| school.internship_records.job_id | company.jobs.id |
| company.company_evaluations.record_id | school.internship_records.id |
| school.company_reviews.company_id | company.companies.id |

`school` và `company` trong bảng trên là cách viết tắt của hai tên CSDL. ID tài khoản, ID sinh viên và ID công ty là các định danh riêng; không suy ra chúng bằng cách so sánh số ID. Session backend phải chứa nguồn tài khoản và ID hồ sơ/vai trò tương ứng.

Giữ cách liên kết logic đã có trong `school.sql`: khóa ngoại bên trong từng CSDL, backend kiểm tra tham chiếu giữa hai CSDL. Vì vậy SQL tự nó chưa ngăn được tham chiếu sai xuyên CSDL. Backend cần xác nhận sinh viên/CV tồn tại, CV thuộc sinh viên, công ty sở hữu tin tuyển dụng, giảng viên được phân công và người đánh giá thuộc đúng công ty.

`applications.status` là nguồn trạng thái hành trình 01–15. `internship_records.status` chỉ biểu diễn giai đoạn hồ sơ thực tập. `offers` chứa điều khoản; quyết định nhận/từ chối nằm ở `applications.offer_decision`. Điểm doanh nghiệp nằm ở `company_evaluations`; `internship_scores` là kết quả tổng hợp do nhà trường công bố.

## Import trên môi trường demo mới

SQL dùng cú pháp MySQL/MariaDB. Dùng engine InnoDB và phiên bản hỗ trợ thực thi CHECK (MySQL 8.0.16+ hoặc MariaDB 10.2.1+). Import theo thứ tự qua phpMyAdmin hoặc MySQL client:

1. `school.sql`: tạo CSDL và bảng nhà trường.
2. `company_schema.sql`: tạo CSDL và bảng doanh nghiệp.
3. `school_seed.sql`: dữ liệu mẫu nhà trường.
4. `company.sql`: dữ liệu mẫu doanh nghiệp khớp ID với nhà trường.
5. `linked_queries.sql`: truy vấn kết hợp và kiểm tra tham chiếu.

Trong MySQL client, từ thư mục gốc dự án:

```sql
SOURCE database/school.sql;
SOURCE database/company_schema.sql;
SOURCE database/school_seed.sql;
SOURCE database/company.sql;
SOURCE database/linked_queries.sql;
```

Seed chỉ dành cho CSDL demo mới; không chạy lại trên CSDL đã có dữ liệu. Các file không xóa dữ liệu. `CREATE TABLE IF NOT EXISTS` không nâng cấp cấu trúc bảng đã tồn tại. Tài khoản seed bị khóa, không có mật khẩu sử dụng được; backend cần thiết lập hash trước khi kích hoạt. Dữ liệu SQL demo độc lập với JSON/localStorage đang dùng ở frontend.

## Kết nối ứng dụng

Luồng cần triển khai: React → API backend → hai CSDL. Không đặt mật khẩu CSDL vào biến `VITE_*` hoặc mã React.

Nếu hai CSDL cùng server, backend có thể dùng một kết nối với quyền phù hợp trên cả hai, truy vấn bằng tên đầy đủ như `internconnect_school.students`. Các thao tác như xác nhận nơi thực tập, duyệt công ty và hoàn thành thực tập phải cập nhật hai bên trong cùng transaction, trên cùng kết nối InnoDB. Hai connection/pool riêng không tự tạo thành một transaction chung.

Nếu đặt trên hai server khác nhau, backend cần hai kết nối, ghép dữ liệu qua ID và cơ chế đồng bộ có retry/idempotency; không dùng trực tiếp các JOIN trong `linked_queries.sql`.

Backend còn cần xác thực, phân quyền theo `company_id`, kiểm tra chuyển trạng thái, khóa đánh giá sau khi gửi và API thay thế các service localStorage. Hiện repository chưa có backend; thêm các file SQL không tự chuyển frontend sang dữ liệu thật.

Tham khảo cơ chế transaction trong [tài liệu MySQL](https://dev.mysql.com/doc/refman/8.0/en/commit.html).

## Kiểm tra trên máy phát triển

Đã import ngày 2026-10-08 vào dịch vụ XAMPP tại `127.0.0.1` (MariaDB 10.4.32):

- Nhà trường: 16 bảng; doanh nghiệp: 10 bảng; tất cả dùng InnoDB.
- Truy vấn kết hợp trả về sinh viên demo, doanh nghiệp A, vị trí Frontend Developer Intern và giảng viên demo ở bước `13`.
- Hai truy vấn kiểm tra tham chiếu trả về 0 dòng lỗi.
- CSDL từ chối tin tuyển dụng có công ty không tồn tại, trạng thái ứng tuyển `99` và đơn ứng tuyển trùng sinh viên/tin.

Chưa chạy kiểm thử trực tiếp trên MySQL 8. Tài khoản SQL demo chưa dùng được với đăng nhập localStorage của frontend.
