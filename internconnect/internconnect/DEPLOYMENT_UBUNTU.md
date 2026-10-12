# Triển khai InternConnect trên Ubuntu

Thư mục chạy lệnh là `<repo>/internconnect/internconnect`, nơi có package.json và compose.prod.yaml. Không chạy Compose ở thư mục cha. Production dùng file **standalone** compose.prod.yaml, không ghép compose.yaml development. Script không pull Git, không quản lý MySQL, không seed/migration và không xóa volume.

## 1. Kiểm tra trên Windows PowerShell

```powershell
cd D:\DOAN\internconnect\internconnect
npm.cmd run build
npm.cmd run lint
$env:RUN_DB_TESTS='0'; $env:RUN_API_TESTS='0'
npm.cmd test
git status --short
git diff --check
git diff
```

DB/API integration tests ghi fixture và có cleanup dữ liệu: chỉ bật RUN_DB_TESTS/RUN_API_TESTS trên DB thử nghiệm riêng, tuyệt đối không bật trên hai DB hiện có. Đọc DEPLOYMENT_REPORT.md trước khi commit. Tại root repo có hai tài liệu đang bị xóa từ trước; không stage chúng nếu không chủ ý.

```powershell
git branch --show-current
git remote -v
cd D:\DOAN
git add .gitignore internconnect/internconnect/.gitattributes internconnect/internconnect/.gitignore internconnect/internconnect/.dockerignore internconnect/internconnect/.env.example internconnect/internconnect/.env.production.example internconnect/internconnect/Dockerfile.prod internconnect/internconnect/compose.prod*.yaml internconnect/internconnect/docker/nginx.conf internconnect/internconnect/docker/proxy_params internconnect/internconnect/scripts/*production* internconnect/internconnect/server/config/env.js internconnect/internconnect/server/app.js internconnect/internconnect/server/middleware/errorMiddleware.js internconnect/internconnect/server/services/authService.js internconnect/internconnect/tests/production.test.mjs internconnect/internconnect/DEPLOYMENT*.md
git diff --cached --check
git diff --cached --stat
git diff --cached
git commit -m "Prepare safe Ubuntu production deployment"
git push origin <branch-da-kiem-tra>
```

Thay `<branch-da-kiem-tra>` bằng branch thật. Người dùng tự chạy commit/push sau review; không dùng force push. Kiểm tra remote đúng https://github.com/HuyINNN05/DOAN.git.

## 2. Khảo sát Ubuntu trước mọi thay đổi

```bash
cd <repo>/internconnect/internconnect
git branch --show-current
git status --short
git remote -v
git rev-parse HEAD
docker info
docker compose version
docker compose ls
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Ports}}'
docker volume ls
docker network ls
sudo ss -lntp
sudo systemctl status mysql --no-pager
```

Cần Compose hỗ trợ !override (2.24.4 trở lên). Xác minh tên project cũ bằng label container; tránh docker inspect toàn bộ container vì có thể hiển thị secrets:

```bash
docker inspect <container-cu> --format '{{index .Config.Labels "com.docker.compose.project"}}'
docker inspect <api-cu> --format '{{json .Mounts}}'
docker inspect <mysql-cu> --format '{{json .Mounts}}'
docker inspect <mysql-cu> --format '{{json .NetworkSettings.Networks}}'
```

Ghi lại project cũ, container DB, image/version DB, tên volume MySQL, volume/path uploads, network và DNS alias DB. Production không đổi hoặc gắn lại volume MySQL: tiếp tục dùng MySQL đang chạy. Không dừng cả stack cũ vì DB có thể nằm trong đó. Chọn project ứng dụng production riêng, ví dụ `internconnect-prod`, kiểm tra không trùng stack khác. Khi chuyển sang production, chỉ dừng API/frontend cũ sau khi stack mới đã được kiểm tra để tránh cùng ghi uploads. Không dùng down trên stack chứa DB.

Xác minh đủ hai database, quyền cross-schema của tài khoản ứng dụng, schema hiện tại và số lượng dữ liệu cũ. Pool mặc định ở school, truy vấn company dùng tên schema đầy đủ trên cùng MySQL server. Dùng mysql login-path hoặc `mysql -u <user> -p` để nhập password tương tác, không đưa password vào tham số hay in ra terminal:

```sql
SHOW DATABASES;
SHOW GRANTS FOR CURRENT_USER;
SELECT COUNT(*) FROM internconnect_school.users;
SELECT COUNT(*) FROM internconnect_company.companies;
SELECT file_path FROM internconnect_school.cvs LIMIT 5;
SELECT file_path FROM internconnect_school.reports LIMIT 5;
```

Đường dẫn upload thông thường là `uploads/<uuid>` và được resolve từ /app. Nếu dữ liệu cũ có đường dẫn tuyệt đối Windows, hoặc thư mục khác `uploads/`, kiểm tra từng file trước chuyển đổi; không sửa hàng loạt DB. Dừng rollout nếu download file cũ không hoạt động.

## 3. Backup database và uploads

Tạm ngừng ghi bằng cách dừng **chỉ API cũ** với đúng project/file development đã xác minh; giữ MySQL chạy. Ghi lại lệnh phục hồi API cũ. Không backup DB/upload khi vẫn có ghi nếu cần snapshot đồng bộ. Các bảng của dự án dùng InnoDB; --single-transaction không bảo vệ thay đổi DDL hoặc bảng nontransactional.

**Host MySQL** (Ubuntu):

```bash
umask 077
backup_dir="$HOME/internconnect-backups/$(date +%Y%m%d-%H%M%S)"
mkdir -p "$backup_dir"
mysql_config_editor set --login-path=internconnect-backup --host=127.0.0.1 --user=<backup-user> --password
mysqldump --login-path=internconnect-backup --single-transaction --routines --events --triggers --no-tablespaces --databases internconnect_school internconnect_company > "$backup_dir/databases.sql"
# Chỉ tiếp tục khi mysqldump exit code 0; không gzip một dump thất bại.
gzip "$backup_dir/databases.sql"
gzip -t "$backup_dir/databases.sql.gz"
tar -C <uploads-path-thuc-te> -czf "$backup_dir/uploads.tar.gz" .
tar -tzf "$backup_dir/uploads.tar.gz" >/dev/null
```

**Docker MySQL hiện có**: login-path trên host không dùng được trong container. Dump tương tác vào file tạm trong container (không đưa password vào command). Thay container thật và user thật:

```bash
docker exec -it <mysql-cu> sh -c 'umask 077; mysqldump -u <backup-user> -p --single-transaction --routines --events --triggers --no-tablespaces --databases internconnect_school internconnect_company > /tmp/internconnect-predeploy.sql'
# Chỉ copy khi lệnh dump thành công.
docker cp <mysql-cu>:/tmp/internconnect-predeploy.sql "$backup_dir/databases.sql"
gzip "$backup_dir/databases.sql"
gzip -t "$backup_dir/databases.sql.gz"
```

Nếu uploads nằm trong volume, đọc volume đã xác minh, không tạo volume mới:

```bash
docker volume inspect <uploads-volume-cu>
docker run --rm --mount type=volume,src=<uploads-volume-cu>,dst=/source,readonly --mount type=bind,src="$backup_dir",dst=/backup alpine sh -c 'tar -C /source -czf /backup/uploads.tar.gz .'
tar -tzf "$backup_dir/uploads.tar.gz" >/dev/null
```

Không đặt backups trong repo. Kiểm tra dung lượng, checksum, thử restore vào MySQL thử nghiệm riêng; không restore đè production. Dump SQL có dữ liệu cá nhân, giữ quyền truy cập hạn chế. Bản backup uploads phải khớp thời điểm dump. Chỉ xác nhận DEPLOY_BACKUP_CONFIRMED sau khi đã kiểm tra backup thật.

## 4. Cập nhật source và cấu hình production

Working tree Ubuntu phải sạch; xử lý thay đổi cũ thủ công, không reset/stash tự động. Ghi lại commit hiện tại và image API/frontend cũ để rollback, rồi:

```bash
git pull --ff-only origin <branch-da-kiem-tra>
cp .env.production.example .env.production
chmod 600 .env.production
nano .env.production
```

Chỉ cp khi file chưa tồn tại; không ghi đè env production. Giữ DB_PASSWORD, DB_USER và hai tên schema đang dùng. Giữ JWT secrets nếu đã đủ mạnh để không vô hiệu phiên hiện có; nếu secret yếu/default thì thay mới và dự kiến người dùng phải đăng nhập lại. Không bật seed/migration. SMTP và APP_PUBLIC_URL cấu hình lúc biết URL thật.

### Chế độ host MySQL

Đặt DB_HOST=host.docker.internal, DB_PORT/USER/PASSWORD thật. Dùng compose.prod.host-db.yaml. MySQL chỉ bind 127.0.0.1 sẽ không nhận kết nối từ bridge Docker. Xác minh IP bridge, bind-address hiện tại, user grants và firewall trước điều chỉnh; cho phép subnet Docker cần thiết, không mở 3306 ra Internet hay grant `%` tùy tiện. NAT VM không cần port forwarding để chạy Tunnel; Ubuntu cần kết nối outbound đến Cloudflare. Không cung cấp IP riêng trong source.

### Chế độ Docker MySQL hiện có

Đặt EXISTING_DB_NETWORK bằng network đang chứa DB và DB_HOST bằng DNS alias thực tế, dùng compose.prod.docker-db.yaml. DB phải nằm trên user-defined network có DNS. Nếu chưa có network phù hợp, lập kế hoạch kết nối network có kiểm soát sau xác minh; không tái tạo DB. Nếu stack DB cũ đang publish 3306 công khai, cần sửa cấu hình stack đó sau khảo sát để gỡ public binding hoặc giới hạn loopback; stack mới không tự sửa DB cũ.

### Uploads

Bind mode: UPLOADS_HOST_PATH là đường dẫn Ubuntu tuyệt đối **đã tồn tại**, không phải uploads mới. `create_host_path: false` chặn tạo thư mục rỗng. Node chạy UID/GID 1000; kiểm tra quyền đọc/ghi và ACL, không chmod 777. Có thể cấp ACL tối thiểu cho UID 1000 sau backup; không tự chown dữ liệu cũ.

Volume mode: thêm compose.prod.upload-volume.yaml, đặt EXISTING_UPLOADS_VOLUME đúng tên volume cũ, vẫn đặt UPLOADS_HOST_PATH vì file base cần nội suy. Volume external không được tạo tự động. Kiểm tra quyền UID 1000 bên trong volume; preflight chỉ kiểm tra tồn tại volume, chưa xác minh quyền bên trong.

## 5. Preflight, build và chạy

Ví dụ đã xác minh project ứng dụng là internconnect-prod, host DB, bind uploads:

```bash
bash scripts/preflight-production.sh host internconnect-prod bind
DEPLOY_BACKUP_CONFIRMED=yes bash scripts/deploy-production.sh host internconnect-prod bind
docker compose --project-name internconnect-prod --env-file .env.production -f compose.prod.yaml -f compose.prod.host-db.yaml ps
docker compose --project-name internconnect-prod --env-file .env.production -f compose.prod.yaml -f compose.prod.host-db.yaml logs --tail=100 api nginx
```

Docker DB/volume uploads: thay `host` bằng `docker`, `bind` bằng `volume` khi gọi scripts. Mọi lệnh Compose thủ công phải dùng `--project-name`, `--env-file`, `-f compose.prod.yaml -f compose.prod.docker-db.yaml` và thêm `-f compose.prod.upload-volume.yaml` nếu volume mode. Không ghép file development. Script không tự pull code hoặc kiểm chứng nội dung backup, cần người vận hành xác nhận. Không chạy docker compose config không có --quiet nếu chia sẻ output vì config chứa secrets.

APP_IMAGE_TAG nên đặt bằng commit đã kiểm tra (ví dụ kết quả `git rev-parse --short HEAD`) trước build để giữ image cũ rollback. `git pull` không cập nhật container: cần build và up như trên.

Kiểm tra NGINX_PORT thật trong .env.production (mặc định 8080):

```bash
curl --fail http://127.0.0.1:8080/healthz
curl --fail http://127.0.0.1:8080/api/health
curl --fail http://127.0.0.1:8080/login
curl --fail 'http://127.0.0.1:8080/api/jobs?page=1&limit=1'
```

/healthz kiểm tra Nginx, /api/health kiểm tra API và hai schema. HTTP local chỉ dùng kiểm tra đọc: cookie production Secure cần HTTPS để login/refresh đầy đủ. File upload mặc định 5 MiB; Nginx chấp nhận 6 MiB gồm multipart. Nếu tăng MAX_UPLOAD_BYTES, tăng client_max_body_size và build lại Nginx. Không phục vụ uploads công khai: dùng /api/documents/.../download kiểm tra quyền như trước.

## 6. Cloudflare Quick Tunnel sau khi app chạy ổn

Không cần VPS/VPN/tên miền. Cài cloudflared đúng kiến trúc Ubuntu theo [Downloads chính thức](https://developers.cloudflare.com/tunnel/downloads/). Ví dụ Ubuntu amd64:

```bash
dpkg --print-architecture
curl -fL https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o /tmp/cloudflared.deb
sudo dpkg -i /tmp/cloudflared.deb
cloudflared --version
# Thay 8080 bằng NGINX_PORT thật.
cloudflared tunnel --url http://127.0.0.1:8080
```

Giữ terminal Tunnel mở. Dùng URL HTTPS vừa được in, đặt APP_PUBLIC_URL và CORS_ORIGIN bằng origin đó trong .env.production; không thêm dấu slash cuối CORS origin. Recreate **chỉ API**, không cần build frontend:

```bash
docker compose --project-name internconnect-prod --env-file .env.production -f compose.prod.yaml -f compose.prod.host-db.yaml up -d --no-deps --wait api
```

Thay file DB và thêm file uploads override theo mode thật. Sau đó thử điện thoại 4G theo checklist. URL đổi mỗi lần tạo Quick Tunnel; link email cũ sẽ hỏng dù token còn hiệu lực: cập nhật env rồi gửi lại link. Quick Tunnel không có cam kết uptime, tối đa 200 request đồng thời và không hỗ trợ SSE; phù hợp demo/kiểm thử. Dùng hostname ổn định sau này nếu cần dịch vụ lâu dài. [Giới hạn Quick Tunnel](https://developers.cloudflare.com/tunnel/get-started/quick-tunnels/).

Nginx dùng Docker DNS resolver, cập nhật IP API sau recreate; chờ tối đa khoảng 10 giây nếu thấy 502 tạm thời lúc đổi container.

Nginx nhận CF-Connecting-IP và X-Forwarded-Proto từ cloudflared rồi chuẩn hóa XFF thành một client IP; Express chỉ tin 1 hop Nginx. Điều này giả định listener loopback chỉ được gọi bởi cloudflared hoặc người vận hành tin cậy trên host. Không mở listener ra LAN/Internet, không cho workload không tin cậy vào app network. Nếu thay topology phải đánh giá lại headers/trust. [Express proxy](https://expressjs.com/en/guide/behind-proxies/).

## 7. Rollback ứng dụng

Trước deploy giữ commit, hai image tag/digest cũ, env cũ trong thư mục bảo mật ngoài Git. Không prune image. Nếu rollout thất bại, stack có thể đã đổi API trong khi Nginx cũ vẫn chạy; rollback cả hai image.

- Nếu đã có bản production cũ: đổi APP_IMAGE_TAG về tag đã giữ, khôi phục env cần thiết và chạy đúng Compose files với `up -d --no-deps --no-build --pull never --wait api nginx`. Không rebuild tag cũ bằng source mới.
- Nếu lần đầu chuyển từ development: dừng **chỉ api nginx của project production** bằng đúng Compose files và `stop api nginx`; khởi động lại API/frontend cũ bằng đúng cấu hình/project đã ghi ở bước khảo sát. Giữ DB chạy.
- Nếu source cần rollback, checkout commit cũ trong worktree riêng hoặc revert commit có review; không reset branch. Chọn đúng thư mục khi chạy Compose để bind path không đổi.
- Không khôi phục dump đè DB để rollback code. Không chạy down -v, prune volume, seed hoặc migration tự động. Sau rollback kiểm tra dữ liệu cũ và file cũ lại.

Volume external dùng đúng tên hiện có, không phụ thuộc project name. [Docker external volumes](https://docs.docker.com/reference/compose-file/volumes/).
