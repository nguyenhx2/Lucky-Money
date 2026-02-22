# Hướng Dẫn Sử Dụng — Lucky Money

🌐 **Ngôn ngữ / Language / 言語:** 🇻🇳 Tiếng Việt · [🇬🇧 English](en/user-guide.md) · [🇯🇵 日本語](ja/user-guide.md)

📚 **Tài liệu khác:** [Hướng dẫn Admin](admin-guide.md) · [System Flow](system-flow.md) · [Kiến trúc](architecture.md) · [Deployment](deployment.md)

---

Hướng dẫn dành cho **người tham gia** (user thường).

---

## Bắt Đầu

### 1. Truy Cập

Mở trình duyệt và vào địa chỉ do admin cung cấp.  
Hỗ trợ: Chrome, Safari, Firefox — cả desktop lẫn mobile.

### 2. Đăng Nhập

Nhấn **"Đăng nhập với Google"** và chọn tài khoản Google của bạn.

> **Lưu ý:** Chỉ các email được admin duyệt trước mới có thể tham gia. Nếu bạn thấy màn hình "Không được phép", liên hệ admin để được thêm vào danh sách.

---

## Rút Lì Xì

### Giao Diện Chính

Sau khi đăng nhập, bạn sẽ thấy màn hình chính với:

- 🎋 **Grid bao lì xì** treo trên cành tre — các bao lắc lư nhẹ
- 🎵 **Nhạc Tết** tự động phát (hoặc nhấn ▶ ở góc dưới trái)
- 🧧 **Nút rút** — nhấn vào bao bất kỳ để chọn

### Cách Rút

1. **Nhấn vào một bao lì xì** bất kỳ trên màn hình
2. Chờ hiệu ứng mở bao (1-2 giây)
3. **Kết quả hiện ra** — số tiền may mắn + lời chúc Tết + thiệp
4. Nhấn **"Đóng"** hoặc vuốt xuống để về màn hình chính

### Đếm Ngược

Nếu phiên chưa bắt đầu, bạn sẽ thấy đồng hồ đếm ngược. Hãy chờ tới giờ admin thiết lập!

---

## Tính Năng Đặc Biệt

### 🎰 Lượt Thưởng Bí Mật (Bonus Round)

Một số người chơi may mắn được admin chọn sẽ nhận được **lượt rút thứ 2 bí mật** sau khi rút lì xì thường. Nếu bạn được chọn:

1. Sau khi xem kết quả, xuất hiện nút **"Rút Thêm"** màu tím
2. Nhấn vào để nhận lượt thưởng đặc biệt
3. Kết quả hiện theo hiệu ứng **3D flip card** màu tím huyền bí

### 🔄 Lượt Rút Thêm (Retry)

Admin có thể cấp thêm lượt cho một số người. Nếu bạn được cấp:
- Sau khi rút xong, xuất hiện nút **"Rút Thêm"**
- Nhấn để vào lại màn hình bao lì xì và chọn thêm

### 💰 Quỹ Donate (DonateBadge)

Nếu phiên dùng nguồn quỹ từ đóng góp, bạn sẽ thấy:
- **Nút tròn vàng** ở góc màn hình — nhấn để xem quỹ
- Hiển thị tổng quỹ, danh sách người đóng góp
- Nếu bạn trong danh sách contributor: xem thêm thống kê giải và danh sách trúng thưởng

---

## Xem Kết Quả Đã Rút

Nếu đã rút đủ lượt, màn hình chuyển sang **"AlreadyPicked"** — hiển thị:
- Tổng số tiền đã nhận
- Flip card xem lại lì xì thường và bonus (nếu có)
- Lời chúc Tết và thiệp

---

## Nhạc Tết

| Nút | Chức năng |
|-----|-----------|
| ▶ / ⏸ | Phát / Dừng nhạc |
| 🔇 / 🔊 | Tắt / Bật âm |

> Trên mobile, nhạc cần một thao tác chạm để phát lần đầu (yêu cầu của trình duyệt).

---

## Câu Hỏi Thường Gặp

**Q: Tôi nhấn vào bao nhưng người khác lấy mất?**  
A: Hệ thống ngăn 2 người rút cùng 1 bao (race-safe). Bao đó sẽ tự ẩn và bạn cần chọn bao khác.

**Q: Tôi không thấy bao nào?**  
A: Có thể tất cả bao đã được rút hết, hoặc phiên chưa bắt đầu (xem đồng hồ đếm ngược).

**Q: Email chúc mừng của tôi đâu?**  
A: Email được gửi tự động sau khi rút. Kiểm tra hộp thư rác nếu không thấy trong hộp thư thường.

**Q: Tôi bị báo "Không được phép truy cập"?**  
A: Email của bạn chưa có trong danh sách. Liên hệ admin để được thêm vào.

---

📚 **Đọc tiếp:** [Hướng dẫn Admin](admin-guide.md) · [System Flow](system-flow.md)
