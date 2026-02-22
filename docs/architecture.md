# Kiến Trúc Hệ Thống — Lucky Money

🌐 **Ngôn ngữ / Language / 言語:** 🇻🇳 Tiếng Việt · [🇬🇧 English](en/architecture.md) · [🇯🇵 日本語](ja/architecture.md)

📚 **Tài liệu khác:** [System Flow](system-flow.md) · [Hướng dẫn Admin](admin-guide.md) · [Hướng dẫn User](user-guide.md) · [Deployment](deployment.md) · [Customization](customization.md)

---

## Tổng Quan

Lucky Money là ứng dụng **rút lì xì Tết số** được xây dựng trên nền tảng **Next.js 15 App Router**, vận hành trên Vercel và sử dụng PostgreSQL (Neon) làm cơ sở dữ liệu.

---

## Tech Stack

| Lớp | Công nghệ | Ghi chú |
|-----|-----------|---------|
| **Framework** | Next.js 15 (App Router) | SSR + CSR hybrid |
| **Ngôn ngữ** | TypeScript | Strict mode |
| **Database** | PostgreSQL + Prisma ORM | Neon serverless |
| **Auth** | NextAuth.js (Google OAuth 2.0) | JWT sessions |
| **Email** | Mailgun REST API | Tuỳ chọn |
| **Styling** | Tailwind CSS | Custom globals.css |
| **Animation** | Framer Motion | GPU-accelerated |
| **Audio** | Web Audio API | Analyser + waveform |
| **Hosting** | Vercel | Edge-ready |
| **Audio Effect** | canvas-confetti | Result celebrations |

---

## Cấu Trúc Thư Mục

```
Lucky-Money/
├── prisma/
│   └── schema.prisma          # Database schema (8 models)
├── public/
│   ├── assets/
│   │   ├── li-xi/             # Ảnh bao lì xì (WebP)
│   │   ├── thiep/             # Thiệp Tết (WebP)
│   │   └── audio/             # Nhạc nền Tết (MP3)
│   ├── background/            # Ảnh nền trang (WebP)
│   └── images/                # Ảnh trang trí
└── src/
    ├── app/
    │   ├── api/               # API Routes (Next.js)
    │   │   ├── admin/auth/    # Xác thực admin password
    │   │   ├── allowed-emails/ # Whitelist email CRUD
    │   │   ├── auth/          # NextAuth handlers
    │   │   ├── denominations/ # Mệnh giá lì xì CRUD
    │   │   ├── donate/        # Hệ thống quỹ donate
    │   │   └── game/          # Core game logic
    │   ├── globals.css        # Animations, utilities
    │   ├── layout.tsx         # Root layout + fonts
    │   └── page.tsx           # Main game page
    ├── components/            # React components
    └── lib/                   # Utilities và config
```

---

## Database Schema

### `GameSession` — Phiên trò chơi
```prisma
id               String    -- CUID
budget           Int       -- Tổng ngân sách (VND)
quantity         Int       -- Số lượng bao lì xì
isActive         Boolean   -- Phiên đang hoạt động
startAt          DateTime? -- Giờ bắt đầu (countdown)
maxPicksPerUser  Int       -- Số lượt rút tối đa mỗi người
autoplayMusic    Boolean   -- Tự động phát nhạc
bgKey            String    -- Background theme key
bgRotateInterval Int       -- Interval xoay nền (giây, 0=tắt)
bonusEnabled     Boolean   -- Bật lượt thưởng bí mật
bonusBudgetPercent Int     -- % ngân sách bonus
retryPercent     Int       -- % user được thêm lượt
emailEnabled     Boolean   -- Bật gửi email
budgetSource     String    -- "manual" | "donate"
```

### `Envelope` — Bao lì xì
```prisma
amount          Int       -- Giá trị (VND)
isOpened        Boolean   -- Đã được rút chưa
imageUrl        String?   -- Ảnh bao lì xì
wish            String?   -- Lời chúc Tết
thiepUrl        String?   -- Ảnh thiệp Tết
claimedByEmail  String?   -- Email người rút
claimedAt       DateTime? -- Thời điểm rút
isBonusEnvelope Boolean   -- Là bao bonus
```

### `RetryGrant` — Lượt rút thêm
```prisma
userEmail      String   -- Email được cấp
used           Boolean  -- Đã dùng chưa
isAutoAssigned Boolean  -- Tự động cấp (theo retryPercent)
```

### `BonusGrant` — Lượt thưởng bí mật
```prisma
userEmail     String  -- Email được cấp
used          Boolean -- Đã dùng chưa
bonusAmount   Int?    -- Giá trị đã nhận
bonusWish     String? -- Lời chúc bonus
-- UNIQUE: (sessionId, userEmail)
```

### `Denomination` — Mệnh giá tuỳ chỉnh
```prisma
amount    Int  -- Giá trị (VND)
weight    Int  -- Tỷ lệ xuất hiện (weighted random)
sessionId String? -- Null = global default
```

### `AllowedEmail` — Danh sách email được phép
```prisma
email  String @unique
label  String? -- Tên hiển thị / ghi chú
```

### `DonateContributor` — Người đóng góp quỹ
```prisma
name      String
email     String @unique
amount    Int    -- VND đóng góp
note      String?
```

### `DonateSettings` — Cài đặt hiển thị quỹ (Singleton)
```prisma
id                  "singleton"
showPublicView      Boolean -- Hiển thị với user thường
showContributorView Boolean -- Hiển thị stats với contributor
```

---

## API Routes

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `GET` | `/api/game` | Lấy phiên hiện tại + envelopes |
| `POST` | `/api/game` | Tạo phiên mới |
| `PATCH` | `/api/game` | Cập nhật cài đặt phiên |
| `DELETE` | `/api/game` | Xoá phiên |
| `POST` | `/api/game/claim` | Rút bao lì xì (race-safe) |
| `POST` | `/api/game/bonus-claim` | Rút lượt thưởng bí mật |
| `POST` | `/api/game/redistribute` | Tạo lại bao chưa rút |
| `POST/DELETE` | `/api/game/retry` | Cấp / xoá lượt rút thêm |
| `POST/DELETE` | `/api/game/bonus-grant` | Cấp / xoá lượt thưởng |
| `POST` | `/api/game/send-email` | Gửi email kết quả thủ công |
| `GET/POST/DELETE` | `/api/allowed-emails` | Quản lý whitelist email |
| `GET/POST/DELETE` | `/api/denominations` | Quản lý mệnh giá |
| `POST` | `/api/admin/auth` | Xác thực mật khẩu admin |
| `GET/POST/PUT/DELETE` | `/api/donate` | CRUD donors (admin) |
| `GET` | `/api/donate/public` | Thông tin quỹ (người dùng) |
| `GET/PATCH` | `/api/donate/settings` | Cài đặt hiển thị quỹ |

---

## Components Chính

| Component | Vai trò |
|-----------|---------|
| `page.tsx` | Orchestrator: session state, polling, effects |
| `AdminOverlay.tsx` | Admin panel 7 tabs (Setup/History/Retry/Simulate/Background/Emails/Donate) |
| `EnvelopeGrid.tsx` | Grid bao lì xì trên bamboo poles |
| `EnvelopeCard.tsx` | Từng bao lì xì (animation, state) |
| `ResultModal.tsx` | Hiển thị kết quả rút + cơ hội bonus |
| `AlreadyPicked.tsx` | Đã rút rồi — hiển thị kết quả + 3D flip card |
| `TetAudioPlayer.tsx` | Music player + Web Audio waveform visualizer |
| `DonateBadge.tsx` | Nút floating mở DonateModal |
| `DonateModal.tsx` | Modal xem quỹ donate, stats, winners |
| `TetToast.tsx` | Toast notification system (SVG icons) |
| `Countdown.tsx` | Đếm ngược tới giờ bắt đầu |
| `LoginGate.tsx` | Màn hình khi chưa đăng nhập |

---

## Security

- **Admin auth**: SHA-256 hash so sánh — password không lưu dạng thô
- **Claim race condition**: PostgreSQL `Serializable` isolation → không thể 2 người rút cùng 1 bao
- **Email whitelist**: Chỉ email được duyệt mới tham gia được
- **Server-side only**: Mailgun API key, admin hash chỉ ở server
- **Test mode**: Simulate claims được tag `[Test]` trong DB

---

📚 **Đọc tiếp:** [System Flow](system-flow.md) · [Deployment](deployment.md) · [Hướng dẫn Admin](admin-guide.md)
