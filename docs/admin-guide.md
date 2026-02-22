# Hướng Dẫn Admin — Lucky Money

🌐 **Ngôn ngữ / Language / 言語:** 🇻🇳 Tiếng Việt · [🇬🇧 English](en/admin-guide.md) · [🇯🇵 日本語](ja/admin-guide.md)

📚 **Tài liệu khác:** [Hướng dẫn User](user-guide.md) · [System Flow](system-flow.md) · [Kiến trúc](architecture.md) · [Deployment](deployment.md)

---

Hướng dẫn dành cho **quản trị viên** sử dụng Admin Panel.

---

## Truy Cập Admin Panel

Nhấn **`Ctrl + Shift + G`** (Windows/Linux) hoặc **`Cmd + Shift + G`** (macOS) để mở.

Nhập **mật khẩu admin** (SHA-256 hash được cấu hình trong `.env.local`).

> Nếu muốn đóng mà không đăng nhập, nhấn **✕** hoặc **"Huỷ"**.

---

## Tab: Setup (Cài Đặt Phiên)

### Tạo Phiên Mới

| Trường | Mô tả |
|--------|-------|
| **Ngân sách** | Tổng tiền lì xì (VND), có phân tách ngàn |
| **Số lượng** | Số bao lì xì |
| **Bắt đầu lúc** | Thời điểm phiên mở cửa (countdown) |
| **Lượt tối đa** | Số lần rút tối đa mỗi người |
| **Retry %** | % người chơi được cấp lượt thêm tự động |
| **Bonus Round** | Bật/tắt lượt thưởng bí mật |
| **Bonus %** | % ngân sách dành cho lượt thưởng |
| **Nhạc tự động** | Bật: phát khi user có thao tác. Tắt: user phải bấm play |

### Nguồn Ngân Sách

- **Nhập tay**: Admin điền số tiền trực tiếp
- **Từ quỹ Donate**: Tổng VND từ danh sách DonateContributor

### Mệnh Giá

Thêm / xoá mệnh giá (VND) và trọng số (weight). Weight cao hơn = xuất hiện nhiều hơn.

### Redistribute

Tạo lại các bao chưa được rút — không ảnh hưởng bao đã rút. Dùng khi muốn thay đổi phân phối giữa chừng.

---

## Tab: History (Lịch Sử)

Xem toàn bộ bao đã được rút:

- **Card view**: Ảnh thiệp, tên người rút, số tiền
- **Table view**: Danh sách dạng bảng, sort theo thời gian
- **Thống kê**: Tổng đã phát, số bao còn lại, phân phối mệnh giá
- **Gửi email lại**: Nút gửi email kết quả thủ công cho từng người

---

## Tab: Retry (Lượt Thêm)

Cấp thêm lượt rút cho người chơi cụ thể:

1. Nhập email người cần cấp
2. Nhấn **"Cấp Retry"**
3. Danh sách bên dưới hiển thị tất cả retry grants hiện tại

> Toast thông báo nếu email đã có lượt rồi (không cấp trùng).

**Cấp Bonus Round:**
1. Nhập email vào ô Bonus  
2. Nhấn **"Cấp Bonus"**

> Mỗi email chỉ có 1 lượt bonus (unique constraint).

---

## Tab: Simulate (Giả Lập)

Dùng để **test** luồng claim mà không cần dùng tài khoản thật:

1. Nhập email giả (sẽ được tag `[Test]` trong DB)
2. Chọn bao từ danh sách
3. Nhấn **"Giả lập"**

> Không gửi email thật khi simulate.

---

## Tab: Background (Nền)

- Chọn 1 trong các background preset có sẵn
- **Auto-rotate**: Chọn interval (giây) — 0 = tắt tự động xoay

---

## Tab: Emails (Whitelist)

**Thêm email:**
- Nhập từng email hoặc dán nhiều email (cách nhau bằng dấu phẩy/xuống dòng/dấu chấm phẩy)
- Tuỳ chọn gắn nhãn (tên người dùng)

**Xoá email:**
- Nhấn ✕ trên từng dòng hoặc dùng **"Xoá hết"**

**Tìm kiếm:**
- Ô search lọc danh sách theo email hoặc nhãn

---

## Tab: Donate (Quỹ Donate)

### Quản Lý Người Đóng Góp

| Trường | Bắt buộc | Mô tả |
|--------|----------|-------|
| Tên | ✅ | Tên hiển thị |
| Email | ✅ | Email định danh (unique) |
| Số tiền (VNĐ) | ✅ | VND đóng góp, có phân tách ngàn |
| Ghi chú | ❌ | Tuỳ chọn |

### Cài Đặt Hiển Thị

| Toggle | Mô tả |
|--------|-------|
| **Hiển thị danh sách donate** | Cho phép user thường xem DonateBadge |
| **Hiển thị thống kê contributor** | Cho phép contributor xem winners & prize stats |

### Dùng Quỹ Donate Làm Ngân Sách

Nhấn **"Dùng quỹ donate làm budget"** → Chuyển sang tab Setup với `budgetSource = 'donate'`.

---

## Thông Báo Toast

Tất cả thao tác admin đều có toast feedback:

| Màu | Ý nghĩa |
|-----|---------|
| 🟢 Xanh | Thành công |
| 🔴 Đỏ | Lỗi (có message cụ thể) |
| 🟡 Vàng | Thông tin |

Các lỗi có message thân thiện theo HTTP status:
- **409** Conflict → "đã tồn tại rồi!"
- **404** Not Found → "không tìm thấy!"  
- **403** Forbidden → "không có quyền!"
- Lỗi khác → "thử lại nhé!"

---

## Tips & Best Practices

1. **Tạo phiên trước giờ sự kiện** — test phiên với Simulate tab trước
2. **Đặt countdown** bằng `startAt` để người dùng thấy đồng hồ đếm ngược
3. **Whitelist email trước** — bulk paste từ danh sách nhân viên
4. **Backup**: Dùng History tab export trước khi xoá phiên
5. **Bonus round**: Cấp cho VIP hoặc random draw trước sự kiện
6. **Nhạc tự động OFF** → Phù hợp môi trường văn phòng yên tĩnh

---

📚 **Đọc tiếp:** [System Flow](system-flow.md) · [Kiến trúc](architecture.md) · [Deployment](deployment.md)
