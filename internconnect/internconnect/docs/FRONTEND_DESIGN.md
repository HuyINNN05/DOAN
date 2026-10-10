# Thiết kế frontend InternConnect

Cập nhật: 10/10/2026.

## Mục tiêu

Tập trung vào nhiệm vụ thực tế: tìm cơ hội, theo dõi hồ sơ, xử lý công việc và đọc thông tin. Hệ thống sử dụng giao diện sáng, xanh navy cho nội dung và xanh ngọc cho hành động; màu trạng thái thành công/cảnh báo/lỗi được giữ riêng.

## Những vấn đề đã xử lý

- Thay các lớp CSS ghi đè và `!important` bằng token chung và bố cục có trách nhiệm rõ ràng.
- Header sticky nằm trong luồng trang; menu thu gọn trên thiết bị nhỏ.
- Trang Thông tin: tìm kiếm có hỗ trợ tiếng Việt không dấu, lọc nội dung, đọc bài viết qua URL, ngày đăng, cẩm nang nền tảng và đường dẫn hỗ trợ.
- Doanh nghiệp: tìm kiếm, lọc lĩnh vực và xem hồ sơ chi tiết.
- Hướng dẫn: bốn vai trò, các bước có đường dẫn thao tác, câu hỏi thường gặp.
- Liên hệ: chọn kênh hỗ trợ, soạn email bằng ứng dụng email của thiết bị.
- Trang chủ: tìm kiếm cơ hội, vị trí tuyển dụng thật, hành trình thực tập và hướng dẫn theo vai trò.
- Cơ hội: chi tiết công việc trong modal, mức hỗ trợ, hình thức làm việc, lưu cơ hội, phân trang.
- Giữ vị trí tuyển dụng được chọn khi chuyển qua đăng nhập và ứng tuyển.
- Dashboard bốn vai trò: số liệu, công việc tiếp theo, thao tác nhanh; tên người dùng từ phiên đăng nhập.
- Hồ sơ ứng tuyển: sáu mốc dễ hiểu, trạng thái hiện tại và bước tiếp theo.
- Nhật ký/báo cáo: không hiển thị biểu mẫu khi chưa có hồ sơ; kiểm tra giai đoạn thực tập trước khi mở thao tác.
- Quản trị tài khoản: tìm kiếm, lọc vai trò/trạng thái, phân trang, trạng thái bằng tiếng Việt.
- Báo cáo quản trị: số liệu và biểu đồ thay nội dung JSON kỹ thuật.
- Đăng nhập, tài khoản, thông báo và biểu mẫu nghiệp vụ sử dụng cùng hệ thống giao diện.
- Modal dùng chung: Escape, giữ focus, trả focus về thao tác mở và khóa cuộn nền.
- Các trạng thái đang tải, lỗi và không có dữ liệu được trình bày nhất quán.

## Nội dung và giới hạn

- Thông báo chính thức lấy từ `/api/content/public`; không tạo thông báo hoặc dữ liệu nhà trường giả để lấp giao diện.
- Cẩm nang nền tảng là hướng dẫn tĩnh, được trình bày riêng với thông báo của nhà trường.
- API bài viết chưa có trường danh mục. Bộ lọc hiện phân loại theo tiêu đề: Hướng dẫn, Quy định và Thông báo. Khi bổ sung danh mục vào backend, thay logic phân loại bằng dữ liệu danh mục thật.
- Biểu mẫu liên hệ mở ứng dụng email, không giả lập gửi email thành công.
- Các chức năng nghiệp vụ chưa có backend hoàn chỉnh vẫn cần được triển khai riêng: gửi email đặt lại mật khẩu, đọc/tải tài liệu có phân quyền, quy trình chấm điểm đầy đủ.

## Kiểm tra

- ESLint và Vite build.
- 37 kiểm thử unit/API/database, gồm metadata phân trang danh sách cơ hội.
- Chrome: 32 route nghiệp vụ của bốn vai trò ở desktop; kiểm tra dashboard và trang đại diện của mỗi vai trò ở mobile 390px.
- Các trang công khai trên desktop và mobile; không có tràn ngang ở các trang đã kiểm tra.
- Kiểm tra tương tác: tìm bài viết không dấu, bộ lọc, trang chi tiết, kết quả rỗng; dùng fixture chỉ trong trình duyệt, không ghi vào database.
- Kiểm tra với dữ liệu thật: xem chi tiết cơ hội, đóng modal bằng Escape, đăng nhập và giữ vị trí đang ứng tuyển.

## Các tệp nền tảng

- `Fontend/src/index.css`: token, trang công khai, thành phần dùng chung.
- `Fontend/src/dashboard-theme.css`: sidebar, topbar, biểu mẫu và không gian nghiệp vụ.
- `Fontend/src/components/ui/PageUI.jsx`: layout, hero và trạng thái dữ liệu.
- `Fontend/src/components/ui/Modal.jsx`: modal và thao tác bàn phím.
- `Fontend/src/utils/display.js`: nhãn, ngày tháng, mức hỗ trợ và tìm kiếm tiếng Việt.
