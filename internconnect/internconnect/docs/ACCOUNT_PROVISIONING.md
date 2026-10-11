# Cấp tài khoản sinh viên và giảng viên

Admin mở **Quản lý tài khoản** (`/admin/users`). Chức năng tra cứu và đổi trạng thái được giữ, bổ sung tạo một người, nhập danh sách, theo dõi email và gửi lại.

## Database

Database đang sử dụng: chạy từ thư mục dự án:

```powershell
npm.cmd run db:migrate
```

Migration chỉ tạo bảng `account_invitations` trong database nhà trường, không xóa hoặc thay đổi dữ liệu tài khoản/hồ sơ cũ. Có thể chạy lại. SQL migration ở `scripts/migrations/001_account_invitations.sql`; runner ở `scripts/migrate-account-provisioning.mjs`.

Import mới vẫn dùng ba file `database/01_school.sql`, `02_company.sql`, `03_seed.sql`; cấu trúc nhà trường đã có bảng mới (**21 bảng nhà trường, 6 bảng doanh nghiệp**). Không import lại seed lên database đang dùng.

## Email SMTP

Thêm cấu hình thật vào `.env` (không commit thông tin đăng nhập):

```dotenv
SMTP_HOST=smtp.your-school.example
SMTP_PORT=587
SMTP_SECURE=false
SMTP_REQUIRE_TLS=true
SMTP_USER=your_smtp_user
SMTP_PASSWORD=your_smtp_password
SMTP_FROM=accounts@your-school.example
APP_PUBLIC_URL=https://internconnect.your-school.example
ACCOUNT_ACTIVATION_HOURS=24
SCHOOL_EMAIL_DOMAINS=your-school.example,students.your-school.example
```

SMTP cổng 587 dùng STARTTLS với `SMTP_SECURE=false`; cổng 465 dùng `SMTP_SECURE=true`. SMTP relay nội bộ không yêu cầu đăng nhập có thể để trống user/password. `SMTP_REQUIRE_TLS=false` chỉ phù hợp máy chủ thử nghiệm cục bộ không hỗ trợ TLS. Không vô hiệu hóa kiểm tra chứng chỉ. Xem [tài liệu SMTP của Nodemailer](https://nodemailer.com/smtp).

`APP_PUBLIC_URL` phải là địa chỉ frontend mà người nhận email truy cập được. `ACCOUNT_ACTIVATION_HOURS` từ 1 đến 168 giờ, mặc định 24. `SCHOOL_EMAIL_DOMAINS` giới hạn tên miền email khi cấu hình; để trống chỉ kiểm tra định dạng email, vì dự án không có tên miền trường cố định.

Khởi động lại API sau khi sửa cấu hình. Nếu thiếu SMTP host/from hoặc URL frontend, tài khoản vẫn được tạo nhưng Admin thấy **Email chưa cấu hình**. Nếu SMTP từ chối/lỗi kết nối, thấy **Gửi email thất bại**. Chỉ đánh dấu gửi được khi SMTP chấp nhận người nhận; điều này chưa bảo đảm thư vào inbox. Admin dùng **Gửi lại email** sau khi sửa cấu hình. Gửi lại làm vô hiệu liên kết trước.

Luồng quên mật khẩu dùng cùng SMTP, giữ token reset riêng có hạn 30 phút. Không còn trả token development trong API. Khi chưa cấu hình email, API báo 503 đồng nhất với mọi email. Khi đã cấu hình, phản hồi chỉ xác nhận tiếp nhận yêu cầu, không tiết lộ tài khoản tồn tại hoặc khẳng định thư đã gửi; kết quả gửi được ghi vào audit không chứa secrets.

## Trạng thái và bảo mật

- Tạo user và hồ sơ đúng vai trò trong cùng transaction. Email chỉ gửi sau commit.
- Tài khoản mới ở `pending` (**chờ kích hoạt**), có password hash của giá trị ngẫu nhiên riêng; không dùng mật khẩu seed hay mật khẩu mặc định. Không trả giá trị này cho Admin.
- Liên kết `/activate-account#token=…` chứa token ngẫu nhiên, database chỉ lưu SHA-256. Fragment không đi vào request URL của server; frontend xóa fragment khỏi lịch sử sau khi đọc.
- Chỉ token đã gửi, còn hạn, chưa dùng, thuộc tài khoản pending mới hợp lệ. Khóa tài khoản ngăn kích hoạt. Không thể bật active bằng thao tác đổi trạng thái khi chưa đặt mật khẩu.
- Khi kích hoạt: bcrypt mật khẩu, chuyển active, dùng token một lần và thu hồi các phiên/token reset cũ. Không ghi token hoặc mật khẩu vào audit.
- Chỉ Admin được tạo, xem trước, import và gửi lại. Không tự ghi đè email/mã hiện có. Ràng buộc UNIQUE bảo vệ cả các request đồng thời.
- Nếu tiến trình gửi bị gián đoạn, dòng còn “đang xử lý”; sau một phút Admin có thể gửi lại. Khi chưa lưu được kết quả email, phản hồi báo chưa xác nhận được trạng thái thay vì báo gửi thành công.

## Danh sách CSV

Chỉ nhận **CSV UTF-8**, tối đa **1 MB / 100 dòng dữ liệu**. Hỗ trợ dấu phẩy hoặc chấm phẩy, BOM và ô có ngoặc kép. Excel: **Save As → CSV UTF-8**; không đọc `.xlsx` trực tiếp. Nút **Tải file mẫu** tạo file có header và hai ví dụ.

Header bắt buộc: `role,fullName,email`; thêm `studentCode` hoặc `lecturerCode` theo vai trò. Nếu file có cả hai vai trò, để trống mã/trường không áp dụng.

| Vai trò | Trường bắt buộc | Trường tùy chọn |
| --- | --- | --- |
| student | role, fullName, email, studentCode | phone, faculty, major, className, course |
| lecturer | role, fullName, email, lecturerCode | phone, faculty, department, academicTitle |

Admin chọn file, **Kiểm tra / xem trước**, rồi **Tạo tài khoản hợp lệ**. Xem trước không ghi dữ liệu. Server kiểm tra lại file và dữ liệu khi import; không tin kết quả preview từ client. Dòng lỗi độc lập với dòng hợp lệ; kết quả giữ số dòng vật lý, thông tin lỗi và trạng thái email. Summary có tổng số dòng, số tạo, số lỗi, email gửi được và chưa gửi/xác nhận được. Import lại cùng danh sách báo trùng, không tạo bản sao hoặc gửi lại thư tự động.

File được đọc trong bộ nhớ, không lưu xuống disk. Tra cứu tài khoản hỗ trợ họ tên/email/mã, vai trò và trạng thái; danh sách có trạng thái email và nút gửi lại cho tài khoản đang chờ kích hoạt.

## API

| API | Mục đích |
| --- | --- |
| POST /api/admin/users | JSON tạo một student/lecturer |
| POST /api/admin/users/import/preview | Multipart `file`, kiểm tra CSV |
| POST /api/admin/users/import | Multipart `file`, tạo các dòng hợp lệ |
| POST /api/admin/users/:id/resend-activation | Gửi lại liên kết |
| POST /api/auth/activate-account | JSON token/password, người nhận tự kích hoạt |

Tạo tài khoản trả HTTP 201 khi user/hồ sơ đã commit; trường `delivery` báo riêng sent/failed/not_configured/unknown, không gộp thành thông báo email thành công. Kết quả import không chứa token/mật khẩu.

## Kiểm thử

```powershell
$env:RUN_DB_TESTS='1'
$env:RUN_API_TESTS='1'
npm.cmd test
npm.cmd run lint
npm.cmd run build
```

Kiểm thử gồm CSV dùng chung frontend/backend, client không refresh phiên cho lỗi kích hoạt công khai, SMTP server thử nghiệm cục bộ, tạo student/lecturer, trùng dữ liệu, rollback, import hỗn hợp, gửi lỗi/chưa cấu hình, xoay token, hết hạn/đã dùng, khóa tài khoản, quyền Admin và không lộ secrets. Không gửi email tới nhà cung cấp thật trong kiểm thử. Chạy integration trên database phát triển/thử nghiệm.

## Các file triển khai

| Nhóm | File thêm / cập nhật |
| --- | --- |
| Admin UI | `Fontend/src/pages/admin/AdminUsersPage.jsx`, `AccountProvisioningPanel.jsx`, `Fontend/src/api/adminApi.js` |
| Kích hoạt và đặt lại mật khẩu | `Fontend/src/pages/ActivateAccountPage.jsx`, `AuthFeaturePages.jsx`, `Fontend/src/router/index.jsx`, `Fontend/src/api/client.js` |
| API và validation | `server/routes/accountProvisioningRoutes.js`, `server/routes/authRoutes.js`, `server/validation/accountProvisioning.js`, `server/app.js` |
| Nghiệp vụ và email | `server/services/accountProvisioningService.js`, `accountMailService.js`, `adminService.js`, `authService.js` |
| CSV dùng chung | `shared/accountCsv.js` |
| Database | `scripts/migrations/001_account_invitations.sql`, `scripts/migrate-account-provisioning.mjs`, `database/01_school.sql` |
| Cấu hình | `server/config/env.js`, `.env.example`, `package.json`, `package-lock.json` (thêm Nodemailer) |
| Kiểm thử | `tests/account-provisioning.test.mjs`, `account-provisioning.integration.test.mjs`, `account-smtp.test.mjs`, `api-client.test.mjs`, `schema.test.mjs` |
| Tài liệu | `README.md`, `docs/DATABASE.md`, tài liệu này |

Không chỉnh sửa dữ liệu seed và không hoàn tác các thay đổi có sẵn của các tính năng khác.
