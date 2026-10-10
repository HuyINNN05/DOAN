# Lời mời phỏng vấn và lỗi 401 — 10/10/2026

Người dùng báo gửi lời mời phía doanh nghiệp nhưng sinh viên không thấy. Kiểm tra database tại thời điểm xử lý: hồ sơ mới ID 41 của SV001, job 3 đang ở trạng thái 05; bảng interviews không có bản ghi. Vì vậy chưa có lời mời thành công để hiển thị. Không tự tạo lịch thay người dùng và không đổi trạng thái hồ sơ này.

Các sửa đổi:

- Form mời phỏng vấn hiển thị lỗi ngay trong popup thay vì nằm phía sau popup. Bắt buộc link họp cho online, địa điểm cho offline; kiểm tra thời gian tương lai, thời lượng 15–480 phút và chặn gửi lặp khi đang xử lý. Chỉ đóng form và báo đã gửi sau API thành công.
- Access token được lưu theo tab trong sessionStorage và khôi phục sau tải lại trang. Refresh token vẫn ở HttpOnly cookie riêng của phiên, không lưu trong JavaScript.
- Trước request API cần đăng nhập, phục hồi phiên nếu chưa có token hoặc token gần hết hạn. Các request đồng thời dùng một refresh promise; 401 đến trễ của request cũ dùng token đã làm mới, tránh xoay refresh thêm lần nữa.
- Với browser hỗ trợ Web Locks, việc refresh cùng định danh phiên ở các tab bị sao chép được tuần tự hóa. Giữ nguyên cơ chế chống refresh-token replay ở backend.
- Không chấp nhận refresh trả về tài khoản khác ID đang hiển thị. Phiên không hợp lệ chuyển về đăng nhập.
- Danh sách lịch tải lại khi focus hoặc quay về tab; debounce tránh hai sự kiện tạo hai đợt request.
- Đăng nhập thành công không còn tiêu hao giới hạn 10 lần thử thất bại/15 phút. Khi vượt giới hạn, backend trả JSON có mã AUTH_RATE_LIMITED thay vì text khiến UI mất thông báo.

Kiểm thử mới: khôi phục token trước request xem phỏng vấn; token sau reload; làm mới token hết hạn; 401 đến trễ không refresh lần hai. Luồng HTTP/MySQL kiểm tra online thiếu link bị từ chối và giữ trạng thái 05, lời mời hợp lệ được tạo, tab sinh viên phục hồi phiên sau tải lại, nhìn thấy và xác nhận lịch.

Kết quả cuối: 57/57 kiểm thử đạt, lint/build thành công; backend đã khởi động lại. Endpoint sinh viên xem lịch trả 200 qua proxy Vite. Danh sách thực tế vẫn trống vì doanh nghiệp chưa gửi thành công một lịch thật; lịch kiểm thử dùng fixture riêng và đã xóa.
