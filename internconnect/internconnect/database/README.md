# Import MySQL 8

Các file được thiết kế cho MySQL 8.0.16 trở lên vì schema sử dụng `CHECK` constraint.

## Import database mới

1. Nếu đã có database thử nghiệm cũ và không cần giữ dữ liệu, xóa nó trước:

   ```sql
   DROP DATABASE IF EXISTS internconnect;
   ```

2. Chạy lần lượt bằng MySQL Workbench:

   - `schema.sql`
   - `seed.sql`
   - `verify.sql`

3. Kết quả `verify.sql` phải có dòng `verification_result = OK`.

Không chạy `seed.sql` hai lần trên cùng database vì email, mã sinh viên và mã số thuế là duy nhất.

## Command line

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
mysql -u root -p < database/verify.sql
```

Sau khi import, tạo `.env` từ `.env.example`, sửa `DB_USER` và `DB_PASSWORD`, rồi chạy database integration test:

```powershell
$env:RUN_DB_TESTS="1"
npm test
```
