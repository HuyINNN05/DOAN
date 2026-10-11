# Chạy InternConnect bằng Docker Compose

Cấu hình này dùng cho phát triển trên máy cá nhân, gồm React/Vite, Express API
và MySQL 8.4. Cần cài Docker Desktop và bật Linux containers.

## Giữ database và tài khoản hiện có trên máy

Nếu bạn đã dùng MySQL/XAMPP trước khi cài Docker và muốn giữ toàn bộ tài khoản,
mật khẩu, dữ liệu nghiệp vụ và file upload hiện có, dùng chế độ sau:

```powershell
npm run docker:local
```

Frontend và API chạy trong Docker; API kết nối MySQL trên máy qua
`host.docker.internal`, đọc `DB_PORT`, `DB_USER`, `DB_PASSWORD`,
`DB_SCHOOL_NAME`, `DB_COMPANY_NAME` từ `.env`. MySQL/XAMPP trên máy phải
tiếp tục chạy và cho phép kết nối từ Docker Desktop. Thư mục `uploads` trên
máy được gắn trực tiếp vào API để các file đã tải lên tiếp tục dùng được.

Chế độ này cập nhật trực tiếp database hiện có. Nó không nhập lại seed và
không sao chép hay xóa dữ liệu. Database MySQL riêng trong Docker, nếu đã tạo,
vẫn được giữ; API chuyển sang dùng database trên máy.

Sau khi sửa mã nguồn, tiếp tục chạy `npm run docker:local` để build lại đúng
chế độ này. Dừng bằng `npm run docker:local:down`. Lệnh `npm run docker:up`
chuyển API về database riêng trong Docker, nên danh sách tài khoản có thể khác.

## Tạo database riêng trong Docker

Trong PowerShell, tại thư mục có `compose.yaml` và `package.json`:

```powershell
# Chỉ sao chép nếu chưa có .env; giữ lại cấu hình hiện có.
if (!(Test-Path .env)) { Copy-Item .env.example .env }
docker compose up -d --build
docker compose ps
```

- Frontend: http://localhost:5173
- API và kiểm tra kết nối database: http://localhost:3001/api/health
- Tài khoản mẫu: xem phần tài khoản seed trong README.

Compose đọc JWT và SMTP từ `.env`, dùng `DB_PASSWORD` làm mật khẩu MySQL
cho tài khoản `internconnect`. Host database trong container được đặt thành `db`;
tên hai database giữ cố định theo các file SQL. MySQL không mở cổng ra máy chủ,
nên không xung đột với MySQL đang cài trên máy. Đây là database riêng, không tự
nhập dữ liệu từ MySQL hiện có của bạn.

Ba file `database/01_school.sql`, `02_company.sql`, `03_seed.sql` tự chạy theo
thứ tự khi volume database còn trống. File `docker/04_grants.sql` cấp quyền
cho API trên database doanh nghiệp. API đợi database sẵn sàng; frontend đợi
API kết nối được cả hai database.

Database nằm trong volume `mysql_data`, file upload nằm trong volume `uploads`.
Các volume vẫn được giữ khi dừng hoặc tạo lại container. Sau khi khởi tạo,
thay `DB_PASSWORD` trong `.env` không tự đổi mật khẩu tài khoản trong MySQL.

```powershell
docker compose logs -f
docker compose down
# Sau khi sửa mã nguồn, build lại để cập nhật container:
docker compose up -d --build
```

Cũng có thể dùng `npm run docker:up`, `npm run docker:down` và
`npm run docker:logs`. Cấu hình hiện tại sao chép mã vào image khi build.

Để truy cập MySQL trong container:

```powershell
docker compose exec db mysql -u internconnect -p
```

Nếu cần khởi tạo lại toàn bộ dữ liệu thử nghiệm, lệnh sau **xóa cả database
và file upload trong các volume**. Chỉ chạy khi đã sao lưu dữ liệu cần giữ:

```powershell
docker compose down -v
docker compose up -d --build
```

Nếu Docker báo không kết nối được `docker_engine`, mở Docker Desktop và đợi
engine chạy rồi thử lại. Nếu cổng 5173 hoặc 3001 đang được dùng, dừng tiến
trình frontend/API chạy trực tiếp trước khi khởi động Compose.
