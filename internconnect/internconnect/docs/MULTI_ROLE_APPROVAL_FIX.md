# Sửa lỗi nhiều tab và chuyển hồ sơ nhà trường → doanh nghiệp

Ảnh lỗi hiển thị sinh viên trong UI nhưng API `/students/me/applications` trả 403 `FORBIDDEN`. UI lưu người dùng trong sessionStorage (riêng từng tab), còn refresh cookie trước đây là `refreshToken` (dùng chung các tab). Đăng nhập admin/doanh nghiệp ở tab khác ghi đè cookie; khi tab sinh viên tải lại/làm mới token, nó nhận token khác vai trò trong khi UI giữ tên sinh viên.

Đã sửa:

Kết quả kiểm tra: 54/54 kiểm thử đạt với MySQL/API, lint/build thành công. Sau khởi động lại, API danh sách sinh viên, hồ sơ doanh nghiệp và nhật ký admin đều trả 200 qua proxy Vite. Lỗi SQL nhật ký admin từ thay đổi trước cũng đã được sửa và kiểm thử.

- Mỗi lần đăng nhập tạo định danh phiên riêng trong sessionStorage. Refresh token vẫn nằm trong HttpOnly cookie, với tên riêng theo phiên; không đưa refresh token vào JavaScript/storage.
- Request mang định danh phiên và ID người dùng mong đợi. Backend chỉ làm mới đúng cookie; không fallback sang cookie tài khoản ở tab khác. Access token/refresh token khác người dùng mong đợi bị từ chối trước khi đổi quyền.
- Khi phiên cũ không thể phục hồi, xóa thông tin UI cũ và chuyển về đăng nhập. Tab admin đăng xuất không làm mất refresh cookie của tab sinh viên/doanh nghiệp.
- Nhà trường có nút “Duyệt và gửi doanh nghiệp”: thực hiện 02→03→04 trong cùng transaction, ghi đủ sự kiện và thông báo cho doanh nghiệp. Gọi lại ở 04 không tạo thông báo trùng. API chuyển từng bước trước đây vẫn được giữ.
- Danh sách hồ sơ/phỏng vấn tải lại khi quay lại tab, để doanh nghiệp thấy cập nhật vừa được nhà trường duyệt. Các form chỉnh sửa không tự tải lại khi focus.

Kiểm thử HTTP mới mô phỏng một browser dùng chung cookie jar với ba tab student/admin/company: login, refresh đúng vai trò, từ chối refresh sai người dùng, sinh viên gửi hồ sơ, admin duyệt một lần, doanh nghiệp thấy hồ sơ 04, tiếp nhận 05, tạo phỏng vấn 06, sinh viên nhìn thấy lịch và admin logout không ảnh hưởng hai tab còn lại. Fixture được xóa sau kiểm thử.

Hồ sơ hiện có trong database đã ở bước 04, thuộc ABC Technology và Nova Digital; không sửa/xóa các hồ sơ này. Người dùng cần tải lại các tab và đăng nhập lại một lần để tạo phiên tách biệt mới, sau đó dùng đúng tài khoản doanh nghiệp sở hữu tin tuyển dụng.
