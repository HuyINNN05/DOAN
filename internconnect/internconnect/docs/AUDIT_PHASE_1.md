# InternConnect - Phase 1 Audit

Audit date: 2026-10-08

## Summary

The repository is a React/Vite prototype with a minimal Node HTTP server and two
MySQL databases. Most business modules still use JSON fixtures and localStorage.
The production target requires a unified database, Express REST API, JWT auth,
server-side RBAC/ownership enforcement, uploads, transactions, and integration
tests.

## Findings

| Module | Current implementation | Problem | Severity | Proposed solution | Main files |
| --- | --- | --- | --- | --- | --- |
| Authentication | In-memory token map and frontend localStorage | Sessions disappear on restart; no refresh/revocation; sensitive token in localStorage | Critical | JWT access token, rotated refresh token in HttpOnly cookie, hashed token persistence | `server/index.js`, `Fontend/src/services/mockAuth.js` |
| Database | Separate school/company databases | Cross-domain IDs have no foreign keys and can become inconsistent | Critical | One `internconnect` schema with real FKs and transactions | `database/school.sql`, `database/company.sql` |
| Authorization | A few inline role checks | Missing reusable RBAC and ownership checks; IDOR risk | Critical | Authentication, role, and resource-ownership middleware/repositories | `server/index.js` |
| Application workflow | Frontend status map and localStorage mutations | Client controls business transitions; history and notification writes are not atomic | Critical | Backend application state service with transactions and event history | `Fontend/src/constants/internshipStatuses.js`, services |
| Business data | JSON fixtures and localStorage | Multiple sources of truth and data loss | Critical | Migrate module-by-module to REST API backed by MySQL | `Fontend/src/data`, `Fontend/src/services` |
| Backend structure | One native HTTP file | No separation of concerns; only login/jobs/apply endpoints | High | Express app with config/controllers/services/repositories/routes/middleware | `server/index.js`, `server/db.js` |
| Validation | Ad-hoc checks | Invalid IDs, dates, status, files, and pagination can reach persistence | High | Central Zod schemas plus upload validation | `server` |
| File upload | UI stores filenames only | No CV/report persistence, MIME/size/ownership checks | High | Multer plus FileStorageService and randomized filenames | student/report UI and new backend upload module |
| Company registration | Demo/local data | No real pending/approval activation flow | High | Transactional registration and admin approval endpoints | `AuthFeaturePages.jsx`, admin pages |
| Notifications/audit | Frontend localStorage; partial SQL tables | Can be forged; not transactional | High | Server-created notifications/audit records in domain transactions | services/database |
| Tests | Eight frontend business tests | Six fail; no API/database/IDOR/upload tests | High | Unit and integration suites for auth, workflow, ownership, transactions | `tests/business.test.mjs` |
| UI dialogs | Browser prompt/confirm | Weak UX/accessibility and cannot validate structured input | Medium | Form modal, confirm dialog, toast, inline errors | company/lecturer/admin pages |
| Frontend architecture | Very large role page files | Mixed UI and business logic, difficult to test | Medium | Split by page/component/hook/API after module migration | `*FeaturePages.jsx` |
| Encoding | Mojibake visible in source/output | Vietnamese labels and errors are corrupted | Medium | Normalize source files to UTF-8 during touched-module migration | repository-wide |
| Responsive/accessibility | Partial responsive utility classes | Tables/modals and keyboard/focus behavior are not comprehensively tested | Medium | Responsive and accessibility pass at 375/768/1024/1440 widths | frontend |
| Documentation | Default Vite README | A new developer cannot configure or run the full system | Medium | Rewrite setup, architecture, workflow, roles, demo accounts | `README.md`, `.env.example` |
| Repository hygiene | `dist` and dependency artifacts exist locally | Build artifacts can be accidentally committed | Low | Update `.gitignore`; keep runtime uploads/dist/node_modules untracked | `.gitignore` |

## Baseline verification

- `npm run build`: PASS, with a JavaScript chunk-size warning.
- `npm run lint`: FAIL, 2 unused-variable errors.
- `npm test`: FAIL, 2 passed and 6 failed.

## Migration order

Database and backend foundations must land before replacing frontend mock modules.
Each frontend module remains operational until its REST replacement is tested.
The implementation order follows the role prompt phases and prioritizes data
integrity, security, business rules, API integration, UI, tests, then docs.
