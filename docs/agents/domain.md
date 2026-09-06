# Tài liệu miền

Cách các kỹ năng kỹ thuật sử dụng tài liệu miền của kho mã nguồn này.

## Trước khi khám phá, hãy đọc các tệp sau

- `CONTEXT.md` ở thư mục gốc, hoặc
- `CONTEXT-MAP.md` ở thư mục gốc nếu tồn tại: tệp này trỏ đến một `CONTEXT.md` cho mỗi ngữ cảnh.
- `docs/adr/`: đọc các ADR liên quan đến khu vực bạn sắp làm việc.

Nếu các tệp này chưa tồn tại, hãy tiếp tục mà không thông báo. Không cần nêu việc thiếu tệp hoặc đề xuất tạo chúng trước. Kỹ năng `/domain-modeling` sẽ tạo chúng khi các thuật ngữ hoặc quyết định thực sự được xác định.

## Cấu trúc tệp

Đây là kho mã nguồn đơn ngữ cảnh:

```text
/
├── CONTEXT.md
├── docs/adr/
│   ├── 0001-example-decision.md
│   └── 0002-another-decision.md
└── src/
```

## Sử dụng thuật ngữ trong bảng chú giải

Khi đầu ra của bạn đề cập đến một khái niệm miền (trong tiêu đề vấn đề, đề xuất tái cấu trúc, giả thuyết hoặc tên kiểm thử), hãy dùng thuật ngữ được định nghĩa trong `CONTEXT.md`. Không tự ý đổi sang từ đồng nghĩa mà bảng chú giải chủ động tránh dùng.

Nếu khái niệm bạn cần chưa có trong bảng chú giải, đó là dấu hiệu cho thấy bạn đang dùng ngôn ngữ dự án chưa định nghĩa hoặc đang có một khoảng trống thực sự; hãy ghi nhận để `/domain-modeling` xử lý.

## Nêu các xung đột với ADR

Nếu đầu ra của bạn mâu thuẫn với một ADR hiện có, hãy nêu rõ thay vì âm thầm ghi đè:

> Mâu thuẫn với ADR-0007, nhưng đáng xem xét lại vì...