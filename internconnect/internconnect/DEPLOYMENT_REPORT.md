# Báo cáo chuẩn hóa triển khai — 12/10/2026

## Khảo sát và cấu trúc trước/sau

Repo root D:\DOAN, ứng dụng ở internconnect/internconnect, wrapper npm ở internconnect/package.json. Frontend giữ tên thư mục Fontend. Đã kiểm tra danh sách source/config/test được Git theo dõi, router, API client, routes/controllers/services, DB/config, auth/upload, Docker, SQL và scripts; bỏ qua dependency/build/cache/dữ liệu runtime.

Trước: compose.yaml có MySQL 8.4 và init/seed cho volume trống, API development và Vite 5173; override local-db trỏ host và bind uploads. Không có Nginx production. Hai volume development phụ thuộc project name. File init không phù hợp dùng để thay stack DB hiện có.

Sau: stack production standalone chỉ có Nginx + API. React build thành static assets trong image Nginx; Nginx loopback 127.0.0.1:NGINX_PORT (mặc định 8080) → API 3001 trên network app → MySQL **hiện có**. Mode host dùng Linux host gateway; mode Docker nối external network DB cũ. Không khởi tạo database hoặc mount lại volume MySQL, tránh tác động version/volume/seed. Upload bind vào directory cũ hoặc volume external đúng tên. Cloudflared trên host Ubuntu → HTTP loopback Nginx; người dùng ngoài → HTTPS Cloudflare. Không thay UI/API contract.

| Phân loại | Phát hiện | Xử lý |
| --- | --- | --- |
| Bắt buộc | Development dùng Vite, chưa có Nginx | Thêm Dockerfile multistage và Compose production riêng |
| Bắt buộc | DB Ubuntu chưa biết host/Docker, volume phụ thuộc project | Hai override DB, không quản lý DB, xác minh trước deploy |
| Bắt buộc | Uploads cũ cần giữ đúng nguồn | Bind không tự tạo path hoặc volume external; backup + kiểm tra download cũ |
| Bắt buộc | Express chưa trust proxy, rate limit có thể thấy IP Nginx | TRUST_PROXY_HOPS=1 trong production, mặc định development 0; Nginx chuẩn hóa IP/HTTPS |
| Bắt buộc | URL mail phụ thuộc origin thật | Giữ APP_PUBLIC_URL runtime; hướng dẫn cập nhật khi có URL Tunnel |
| Nên sửa | Chỉ ignore .env, có thể lộ env production/backup | Mở rộng Git/Docker ignore ở app và repo root |
| Nên sửa | Secrets mặc định và log lỗi có thể chứa SQL/input | Production chặn placeholder/empty password; log lỗi nội bộ chỉ name; validation không in giá trị env |
| Giữ nguyên | Axios /api + credentials; Vite proxy development | Đã phù hợp same-origin; không sửa frontend |
| Giữ nguyên | JWT refresh rotation, cookies, tab sessions, RBAC | Production cookie đã Secure/HttpOnly/SameSite=Lax; giữ contract và auth logic |
| Giữ nguyên | Download /api/documents kiểm tra quyền/realpath | Proxy qua API, không expose thư mục uploads trực tiếp |
| Giữ nguyên | Pool school và truy vấn company cross-schema | Giữ DB_SCHOOL_NAME/DB_COMPANY_NAME, cùng server và transaction |
| Giữ nguyên | SQL seed/migration nghiệp vụ | Không sửa/chạy; không có startup migration/seed production |

Frontend entry index.html → Fontend/src/main.jsx → BrowserRouter trong router/index.jsx. API modules dùng Axios /api, phân trang/tìm kiếm giữ query strings. Backend app.js gắn auth/jobs/public/content/students/company/admin/lecturer/applications/interviews/notifications/documents/account provisioning; không có URL API tuyệt đối tới IP riêng trong browser code. Ảnh Unsplash là nội dung public, giữ nguyên. Link activation/reset dùng APP_PUBLIC_URL và token trong fragment. Vite không được cấp backend secrets; frontend Docker build chỉ copy source/config/package, không copy .env.

## File thêm

Đường dẫn dưới đây tương đối với thư mục app, trừ dòng repo root:

- Repo root `.gitignore`: bỏ cache/tạm/env/uploads/dependencies/build khỏi Git.
- `.gitattributes`: LF cho shell/Docker/YAML/Nginx khi chuyển Windows → Linux.
- `Dockerfile.prod`: frontend build, API chạy UID 1000, Nginx static.
- `compose.prod.yaml`: app stack standalone, healthchecks/restart/network/loopback/persistent uploads.
- `compose.prod.host-db.yaml`: host-gateway Linux.
- `compose.prod.docker-db.yaml`: external network DB hiện có.
- `compose.prod.upload-volume.yaml`: external upload volume có tên xác minh, !override tránh merge sai mount.
- `docker/nginx.conf`, `docker/proxy_params`: SPA, URI/query/multipart, cache, timeout, proxy headers, healthz, dotfile blocking.
- `.env.production.example`: mẫu không chứa credential thật, URL public cấu hình runtime.
- `scripts/production-common.sh`, `scripts/preflight-production.sh`, `scripts/check-production.py`, `scripts/deploy-production.sh`: kiểm tra config/storage/network, deploy app sau xác nhận backup, không đụng DB.
- `tests/production.test.mjs`: từ chối config nguy hiểm, log không lộ secret, Express IP/HTTPS theo một hop.
- `DEPLOYMENT_UBUNTU.md`, `DEPLOYMENT_CHECKLIST.md`, `DEPLOYMENT_REPORT.md`: hướng dẫn, checklist và kết quả.

## File sửa

- `.env.example`: thêm TRUST_PROXY_HOPS=0 cho development trực tiếp.
- `.gitignore`, `.dockerignore`: env variants và backup archives.
- `server/config/env.js`: số hop proxy có giới hạn, chặn production placeholders/DB password trống/CORS wildcard; thông báo lỗi env chỉ nêu tên trường.
- `server/app.js`: áp dụng trust proxy trước middleware/rate limiter.
- `server/middleware/errorMiddleware.js`, `server/services/authService.js`: log lỗi nội bộ không in object lỗi/SQL/message có thể chứa dữ liệu nhạy cảm.

Không sửa compose development, package/lockfile, schema/seed, upload files, nội dung DB hoặc nghiệp vụ/frontend. Hai DOCX bị xóa và thư mục .tmp đã có trước thao tác này được giữ nguyên; .tmp được ignore thêm, không bị xóa. Không commit, push hoặc truy cập Ubuntu.

## Kiểm thử thực tế

| Kiểm tra | Kết quả |
| --- | --- |
| npm.cmd run build | Đạt; Vite 8.2.2 build 2008 modules |
| npm.cmd run lint | Đạt, exit code 0 |
| npm.cmd test, RUN_DB_TESTS=0/RUN_API_TESTS=0 | 81 tests: 58 đạt, 23 skipped, 0 lỗi |
| Compose production host/bind | Đạt parse/resolve JSON và kiểm tra services/ports/mount |
| Compose production host/volume | Đạt, upload mount không merge sai; external volume |
| Compose production docker/bind | Đạt, external DB network |
| Compose production docker/volume | Đạt, external DB network + upload volume |
| Compose development và local-db config --quiet | Đạt cả hai |
| Git Bash -n cho ba script shell | Đạt |
| git diff --check | Đạt |

Compose config dùng `.env.production.example` và biến giả phục vụ validation; **không** xác minh network/volume/credentials thật. Docker CLI báo không đọc được user Docker config; config validation vẫn exit 0. Docker daemon không chạy (named pipe docker_engine không có). WSL Bash bị access denied; đã dùng Git Bash để kiểm tra cú pháp shell.

Chưa chạy: Docker image build/runtime, Nginx -t, Python preflight runtime trên Ubuntu (Python không có trong PATH Windows), MySQL integration tests, healthcheck DB thật, backup/restore thật, login/refresh/logout qua HTTPS, upload/download dữ liệu cũ, SMTP activation/reset, Cloudflare Tunnel/4G. Có lệnh và checklist tương ứng trong tài liệu. Unit test proxy xác nhận Express xử lý một hop, chưa xác nhận headers Cloudflare trên hệ thống thật.

## Git và dữ liệu nhạy cảm

Đã đối chiếu git ls-files và tên file trong git log --all: không thấy `.env` thật, uploads hoặc backups từng được theo dõi; `.env.example` có theo dõi là mẫu. Có SQL/schema/seed demo và một số file SQL cũ trong lịch sử. Tài khoản demo có mật khẩu đã công khai trong seed/README/test: nếu Ubuntu còn dùng chúng cần đổi mật khẩu trước mở Tunnel. Không rewrite history, không rotate credential thật tự động. Kiểm tra tên file lịch sử không phải chứng nhận rằng mọi blob/tài liệu Git đều sạch secrets hay dữ liệu cá nhân; nếu phát hiện secret thật trong SQL/tài liệu cũ, rotate secret liên quan và xử lý lịch sử bằng quy trình riêng được duyệt.

## Rủi ro và xác minh bắt buộc trên Ubuntu

- Chọn nhầm DB_HOST/DNS alias có thể kết nối server khác; so sánh schema, số lượng bản ghi và tài khoản cũ trước tiếp tục.
- Volume/network external vẫn cần đúng tên; bind path có thể tồn tại nhưng không đúng dữ liệu. Preflight không chứng minh dữ liệu và backup hoàn chỉnh.
- Upload stored path tuyệt đối Windows không tương thích tự động Linux; kiểm tra file cũ, không tự rewrite DB. Quyền UID/GID 1000 cần xác minh; kiểm tra ACL riêng nếu có.
- MySQL host loopback-only cần thiết kế bind/firewall/grants cho bridge; DB Docker cũ có port public cần xử lý tại stack cũ sau khảo sát.
- API cũ và mới cùng ghi có thể làm backup không đồng bộ; tạm ngừng ghi lúc backup, không dừng DB.
- Script không tự rollback khi API đã thay mà bước Nginx thất bại; giữ tag/image/env và rollback cả hai service bằng hướng dẫn.
- API image giữ dependencies dev vì zod đang nằm trong devDependencies nhưng cần runtime; chưa tối ưu footprint để tránh đổi package/lockfile ngoài phạm vi.
- Nginx tin CF headers vì cổng host chỉ loopback và app network tin cậy; thay topology cần cấu hình trust lại.
- Quick Tunnel hostname đổi khiến email links/session origin cũ không dùng được. Cookie Secure cần public HTTPS; login qua HTTP loopback chưa là kiểm thử auth production.

Review/push trên Windows và triển khai tiếp trên Ubuntu theo DEPLOYMENT_UBUNTU.md; mọi lệnh Compose chỉ rõ project/files. [Quick Tunnel chính thức](https://developers.cloudflare.com/tunnel/get-started/quick-tunnels/) xác nhận URL tạm, không cam kết uptime; [Express](https://expressjs.com/en/guide/behind-proxies/) yêu cầu trust phù hợp topology; [Docker](https://docs.docker.com/reference/compose-file/volumes/) quy định external volume phải có sẵn.
