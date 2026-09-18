# Công cụ theo dõi công việc: Markdown cục bộ

Các vấn đề và đặc tả của kho mã nguồn này được lưu dưới dạng tệp Markdown trong `.scratch/`.

## Quy ước

- Mỗi tính năng dùng một thư mục: `.scratch/<feature-slug>/`
- Đặc tả nằm tại `.scratch/<feature-slug>/spec.md`
- Các vấn đề triển khai được lưu thành một tệp cho mỗi ticket tại `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, đánh số từ `01`, không gộp vào một tệp ticket duy nhất
- Nhận xét và lịch sử trao đổi được nối vào cuối tệp dưới tiêu đề `## Comments`

## Khi một kỹ năng yêu cầu "đăng lên công cụ theo dõi công việc"

Tạo một tệp mới trong `.scratch/<feature-slug>/` (tạo thư mục nếu cần).

## Khi một kỹ năng yêu cầu "lấy ticket liên quan"

Đọc tệp tại đường dẫn được tham chiếu. Thông thường người dùng sẽ cung cấp trực tiếp đường dẫn hoặc số vấn đề.

## Thao tác lập lộ trình

Được sử dụng bởi `/wayfinder`. Bản đồ là một tệp có một tệp con cho mỗi ticket.

- Bản đồ: `.scratch/<effort>/map.md` (phần nội dung Notes / Decisions-so-far / Fog).
- Ticket con: `.scratch/<effort>/issues/NN-<slug>.md`, đánh số từ `01`, với câu hỏi trong phần nội dung. Dòng `Type:` ghi loại ticket (`research`/`prototype`/`grilling`/`task`); dòng `Status:` ghi `claimed`/`resolved`.
- Phụ thuộc: đặt dòng `Blocked by: NN, NN` gần đầu tệp. Ticket không bị chặn khi mọi tệp mà nó liệt kê đều ở trạng thái `resolved`.
- Phạm vi xử lý: quét `.scratch/<effort>/issues/` để tìm các tệp đang mở, không bị chặn và chưa được nhận; ưu tiên số nhỏ nhất.
- Nhận ticket: đặt `Status: claimed` và lưu trước khi bắt đầu công việc.
- Hoàn tất: thêm câu trả lời dưới tiêu đề `## Answer`, đặt `Status: resolved`, sau đó thêm liên kết ngữ cảnh (tóm tắt và đường dẫn) vào phần Decisions-so-far trong `map.md`.