# Rà soát logic backend — 10/10/2026

Ưu tiên phản hồi người dùng: lỗi khi sinh viên ứng tuyển. Kiểm tra với backend và proxy Vite đang chạy, sau đó bổ sung fixture riêng cho kiểm thử API/MySQL.

| Lỗi xác định | Bằng chứng / ảnh hưởng | Sửa |
|---|---|---|
| Gửi lại hồ sơ đã tồn tại | SV001 → job 1, CV 1, kỳ 1 trả 409 `DUPLICATE_DATA`; form vẫn cho gửi | Trả `APPLICATION_ALREADY_EXISTS` kèm ID hồ sơ; form đọc hồ sơ đã ứng tuyển, chặn gửi lại theo vị trí + kỳ và có link xem hồ sơ |
| Hai request ứng tuyển đồng thời đọc dữ liệu cũ | Kiểm thử ban đầu nhận lỗi trùng chung dù đã có bước khóa sinh viên, do consistent read dùng snapshot cũ | Dùng locking read cho CV, kỳ, hồ sơ trùng và nơi thực tập đã xác nhận; hai request chỉ tạo một hồ sơ và một sự kiện |
| Lưu tin không tồn tại báo thành công | `INSERT IGNORE` bỏ qua lỗi khóa ngoại, kiểm thử mong từ chối nhưng không nhận lỗi | Xác minh tin đã xuất bản, doanh nghiệp được duyệt và chưa hết hạn; chỉ bỏ qua việc lưu trùng bằng upsert |
| Xóa CV mặc định khiến không còn CV mặc định | Code xóa không chọn CV thay thế | Khóa sinh viên/CV trong transaction và chọn CV còn lại làm mặc định |
| Đổi lịch đã xác nhận vẫn coi sinh viên đồng ý | Giữ `confirmed` và application 07 sau khi đổi giờ/địa điểm | Đưa lịch về scheduled/pending, hồ sơ về 06, ghi sự kiện đổi lịch và thông báo để sinh viên xác nhận lại |
| Nhập kết quả trước giờ phỏng vấn | Kiểm thử lịch ngày mai vẫn nhập kết quả được | Trả `INTERVIEW_NOT_STARTED` trước giờ bắt đầu |
| Từ chối offer không phản ánh trên danh sách | FE đã đọc `offer_decision` nhưng API chưa trả trường này | API trả quyết định từ sự kiện đã lưu; giữ từ chối và chặn phản hồi lần hai |
| Không đạt phỏng vấn vẫn hiện gửi offer / bước tiếp theo chờ offer | Danh sách chỉ dựa vào mã trạng thái 09 | Trả `interview_result`, ẩn nút offer nếu không đạt, hướng dẫn sinh viên tìm vị trí khác |
| Không thể mở đánh giá từ giao diện giảng viên | Backend có 13→14 nhưng giao diện thiếu thao tác | Thêm endpoint và nút mở đánh giá theo hồ sơ được phân công; nút chấm điểm chỉ bật khi đang evaluating và chưa chấm |
| Kỳ completed mở lại được; kỳ đã hết vẫn đăng ký được nếu thiếu registration_end | Chuyển trạng thái không kiểm tra nguồn, truy vấn kỳ chỉ xét cửa sổ đăng ký | Thêm quy tắc chuyển trạng thái; loại kỳ đã qua end_date; chặn ứng tuyển khi đã có nơi thực tập trong kỳ |
| Kích hoạt tài khoản doanh nghiệp pending bỏ qua duyệt doanh nghiệp | Admin đổi user status không kiểm tra company status | Chặn active trước khi doanh nghiệp được phê duyệt |
| Phân trang công khai nhận số thập phân/Infinity | Route jobs dùng parser riêng, có thể truyền LIMIT/OFFSET không hợp lệ xuống MySQL | Dùng helper số nguyên hữu hạn; có kiểm thử HTTP |
| Skills và ngày bị trả sai kiểu | MariaDB trả JSON dạng chuỗi; SQL DATE bị chuyển sang UTC ngày hôm trước | Chuẩn hóa skills thành mảng; trả cột DATE dưới dạng YYYY-MM-DD, giữ nguyên xử lý DATETIME |

## Kiểm chứng và giới hạn

Kết quả cuối: **52/52 kiểm thử đạt**, không bỏ qua test; lint/build thành công. Backend đã khởi động lại. Kiểm tra qua proxy `127.0.0.1:5173`: health 200, ứng tuyển trùng trả 409 `APPLICATION_ALREADY_EXISTS`, ngày hết hạn giữ nguyên `2026-12-31`.

- Tái hiện lỗi trước khi sửa: lưu tin không tồn tại báo thành công; kết quả phỏng vấn trước giờ vẫn được chấp nhận; lỗi thông báo trùng hồ sơ qua proxy; lỗi duplicate khi gửi hai request đồng thời.
- Ứng tuyển mới qua HTTP với fixture hợp lệ trả 201. Không tái hiện được lỗi 500 cho request ứng tuyển mới trong môi trường hiện tại. CV không thuộc sinh viên trả 403, thiếu trường trả 422, đã ứng tuyển trả 409 có thông báo cụ thể.
- Kiểm thử dùng fixture riêng và xóa trong finally; không ứng tuyển thử thêm trên tài khoản thật của người dùng. Giữ dữ liệu hồ sơ đang có.
- Kiểm thử luồng MySQL gồm đổi lịch/xác nhận lại, kiểm tra thời gian phỏng vấn, quyết định offer, mở đánh giá và tổng điểm thực tế. Lint/build và toàn bộ kiểm thử được chạy sau sửa.
- Email đặt lại mật khẩu vẫn cần dịch vụ gửi thư như đã nêu ở BACKEND_FIXES.md. Kiểm tra này chưa phải kiểm thử tải production và không chứng minh không còn lỗi ngoài những trường hợp đã bao phủ.
