# Kết quả sửa backend — 10/10/2026

## Các lỗi đã sửa

- Xác thực kiểm tra tài khoản trong database trên từng request: tài khoản bị khóa/ngừng hoạt động mất quyền ngay; token cũ bị từ chối sau đổi vai trò hoặc mật khẩu. Khóa tài khoản thu hồi refresh token.
- API chuyển trạng thái không còn bỏ qua thao tác đặt lịch, xác nhận phỏng vấn, kết quả và phản hồi offer. Không xác nhận hai nơi thực tập cho cùng sinh viên trong một kỳ. Bắt đầu thực tập và chuyển sang đánh giá phải có hồ sơ đúng trạng thái.
- Chấm điểm yêu cầu đủ tiêu chí đang hoạt động, không trùng, không có điểm âm/vượt mức hoặc cấu hình trọng số lỗi. Tổng điểm làm tròn hai chữ số.
- Điểm báo cáo không còn mặc định 10. Duyệt báo cáo cuối kỳ cần điểm thực tế 0–10. Báo cáo cũ đã duyệt chưa có điểm được bổ sung một lần trước khi hoàn thành. Tổng điểm giữ tỷ lệ doanh nghiệp 40%, giảng viên 30%, báo cáo 30%.
- Upload kiểm tra MIME, phần mở rộng và cấu trúc định dạng cơ bản; xóa tệp khi nội dung hoặc thao tác lưu thất bại. Việc kiểm tra này không phải quét virus hay phân tích toàn bộ nội dung tài liệu.
- Thêm `GET /api/documents/cvs/:id/download` và `GET /api/documents/reports/:id/download`. CV giới hạn chủ sở hữu, admin và bên có hồ sơ ứng tuyển/phân công liên quan; báo cáo giới hạn chủ sở hữu, admin, giảng viên được phân công. Không mở thư mục uploads công khai; chặn đường dẫn vượt thư mục kể cả symlink.
- Nộp phiên bản báo cáo khóa hồ sơ cha để tránh hai request tạo cùng phiên bản; chỉ cho nộp khi thực tập active/evaluating. Không sửa nhật ký sau hoàn thành; ngày nhật ký nằm trong kỳ thực tập.
- Ngày kỳ thực tập và thời gian đăng ký phải đúng thứ tự. Lịch phỏng vấn mới phải trong tương lai và có địa điểm hoặc URL họp. Lịch bị từ chối có thể đổi lịch để sinh viên phản hồi lại; offer đã từ chối không được chấp nhận lại bằng request thứ hai.
- Đổi giảng viên cập nhật cả hồ sơ thực tập đang chờ/đang thực tập; chặn thay đổi khi đang đánh giá hoặc đã hoàn thành. Không chuyển một bản ghi phân công sang sinh viên/kỳ khác.
- PATCH hồ sơ giữ các trường tùy chọn không được gửi. Tạo/chọn CV mặc định khóa sinh viên để tránh nhiều CV mặc định khi request đồng thời.
- Phân trang dùng số nguyên hữu hạn và trả total/pages cho các danh sách admin. Không xuất bản tin đã hết hạn.
- Xử lý lỗi khóa ngoại và database mất kết nối; không trả response thứ hai khi headers đã gửi. Kiểm tra cổng và secret JWT cho production; mật khẩu bcrypt không vượt 72 byte UTF-8.

## Database và kiểm thử

Kết quả cuối: lint và build thành công; **45/45 kiểm thử đạt**, gồm MySQL và HTTP integration, không có test bị bỏ qua. Backend đã khởi động lại ở cổng 3001; `/api/health` trả `ok`.

Migration bổ sung cột `report_reviews.score` đã áp dụng vào database hiện tại, không import lại seed và không xóa dữ liệu. Database khác chạy:

```powershell
npm.cmd run db:migrate
$env:RUN_DB_TESTS='1'
$env:RUN_API_TESTS='1'
npm.cmd test
```

Runner migration kiểm tra cột trước khi chạy, có thể gọi lại. Kiểm thử mới gồm thu hồi access token, tiêu chí/điểm, ngày, upload giả định dạng, download khác chủ sở hữu và luồng MySQL từ phỏng vấn đến hoàn thành với điểm báo cáo 4, tổng điểm 8.20. Fixture luồng thực tập được xóa trong `finally`.

## Phần còn phụ thuộc cấu hình hoặc phạm vi sản phẩm

- Chưa có SMTP/dịch vụ gửi email. Development vẫn trả reset token cho thử nghiệm; production trả `PASSWORD_RESET_DELIVERY_UNAVAILABLE` để tránh báo thành công giả. Cần tích hợp dịch vụ gửi thư trước khi dùng quên mật khẩu ngoài thực tế.
- Tệp CV/báo cáo trong seed có thể chỉ là đường dẫn minh họa. Endpoint trả 404 nếu tệp vật lý không tồn tại; phải upload tệp thật.
- Chưa bổ sung các tính năng mới như nhập hàng loạt tài khoản, quét virus, lưu tệp trên cloud hoặc hàng đợi email. Các kiểm thử hiện tại không thay thế kiểm thử tải/concurrency trên môi trường production.
- Báo cáo cuối kỳ cũ đã duyệt chưa có điểm phải được giảng viên bổ sung điểm trước khi admin hoàn thành; không tự gán điểm cho dữ liệu cũ.
- Git vẫn có trạng thái merge từ trước; thay đổi lần này không reset/stage/commit thay người dùng.
