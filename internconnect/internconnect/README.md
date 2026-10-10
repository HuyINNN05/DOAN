# InternConnect

Hệ thống quản lý thực tập cho sinh viên, doanh nghiệp, giảng viên và nhà trường.
Frontend React/Vite gọi REST API Express; MySQL là nguồn dữ liệu nghiệp vụ duy
nhất. Backend chịu trách nhiệm JWT, RBAC, ownership và workflow 01–15.

## Công nghệ và kiến trúc

- React 19, Vite, Tailwind CSS.
- Node.js, Express, Zod, Multer.
- MySQL 8, schema hợp nhất tại `database/schema.sql`.
- JWT access token và refresh token xoay vòng trong HttpOnly cookie.
- Backend tách `config`, `controllers`, `services`, `repositories`, `routes`,
  `middleware`; transaction bao quanh các thao tác nghiệp vụ nhiều bước.

## Cài đặt và database

Yêu cầu Node.js 22+, npm và MySQL 8.

```bash
npm install
copy .env.example .env
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

Sửa `.env` theo MySQL trên máy. Hai JWT secret phải khác nhau và có ít nhất 32
ký tự. Không commit `.env`.

## Chạy và kiểm tra

```bash
npm run server
npm run dev
npm run lint
npm test
npm run build
```

Frontend mặc định ở `http://localhost:5173`; API ở `http://localhost:3001`.
Để chạy database integration tests trên database thử nghiệm:

```bash
set RUN_DB_TESTS=1
set RUN_API_TESTS=1
npm test
```

## Cấu trúc chính

```text
Fontend/src/          React app (giữ tên cũ để tránh phá lịch sử)
server/               Express REST API
database/schema.sql   Unified schema, FK, constraint và index
database/seed.sql     Development seed
tests/                Workflow, security, schema, DB integration
uploads/              Runtime files, không commit
```

## Tài khoản seed

| Vai trò | Email | Mật khẩu |
| --- | --- | --- |
| Admin | `admin@internconnect.vn` | `Admin@123` |
| Sinh viên | `sv001@internconnect.vn` | `Student@123` |
| Giảng viên | `gv001@internconnect.vn` | `Lecturer@123` |
| Doanh nghiệp | `company1@internconnect.vn` | `Company@123` |

## Role và workflow

- Student: profile/CV, job, application, interview, offer, diary, report.
- Company: profile, job, candidate, interview, offer, intern evaluation.
- Lecturer: chỉ sinh viên được phân công, diary/report/evaluation.
- Admin: user, company, application, period, assignment, content, audit.

```text
01 → 02 → 03 → 04 → 05 → 06 → 07 → 08 → 09 → 10 → 11 → 12 → 13 → 14 → 15
```

Backend kiểm tra current status, target status, actor role, ownership và điều
kiện nghiệp vụ. Status event, notification, audit, internship record và điểm
cuối kỳ được ghi trong transaction. Frontend không phải lớp authorization.

## Upload và production

CV/report hỗ trợ PDF/DOC/DOCX; ảnh hỗ trợ JPEG/PNG/WebP. Backend kiểm tra MIME,
kích thước, ownership và dùng tên UUID. Khi production phải dùng HTTPS, CORS
whitelist, secret ngẫu nhiên và email provider cho reset password. Không commit
`node_modules`, `dist`, `.env` hoặc `uploads`.

## Ghi chú Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
