# 🧧 Lucky Money — Hái Lộc Đầu Xuân

🌐 **Ngôn ngữ / Language / 言語:** 🇻🇳 Tiếng Việt · [🇬🇧 English](README.en.md) · [🇯🇵 日本語](README.ja.md)

> **Ứng dụng rút lì xì Tết số** dành cho công ty và nhóm nhỏ.  
> Người chơi đăng nhập bằng Google, chọn bao lì xì ngẫu nhiên, nhận tiền may mắn kèm thiệp Tết và email chúc mừng — trong không khí Tết truyền thống.

<p align="center">
  <img src="public/images/plum-flower.webp" alt="Plum Flower" width="160" />
  <img src="public/images/fireworks-2.webp" alt="Fireworks" width="160" />
  <img src="public/images/new-year-greeting.webp" alt="New Year Greeting" width="160" />
</p>

---

## 📚 Tài Liệu / Documentation / ドキュメント

| Tài liệu | 🇻🇳 Tiếng Việt | 🇬🇧 English | 🇯🇵 日本語 |
|----------|---------------|-------------|----------|
| 🏗 Kiến trúc / Architecture | [docs/architecture.md](docs/architecture.md) | [docs/en/architecture.md](docs/en/architecture.md) | — |
| 🔄 System Flow | [docs/system-flow.md](docs/system-flow.md) | [docs/en/system-flow.md](docs/en/system-flow.md) | [docs/ja/system-flow.md](docs/ja/system-flow.md) |
| 👤 Hướng dẫn User / User Guide | [docs/user-guide.md](docs/user-guide.md) | [docs/en/user-guide.md](docs/en/user-guide.md) | [docs/ja/user-guide.md](docs/ja/user-guide.md) |
| ⚙️ Hướng dẫn Admin / Admin Guide | [docs/admin-guide.md](docs/admin-guide.md) | [docs/en/admin-guide.md](docs/en/admin-guide.md) | [docs/ja/admin-guide.md](docs/ja/admin-guide.md) |
| 🚀 Deployment Guide | [docs/deployment.md](docs/deployment.md) | — | — |
| 🎨 Customization | [docs/customization.md](docs/customization.md) | — | — |

---

## ✨ Tính Năng Nổi Bật

| | Tính năng |
|--|-----------|
| 🔐 | Google SSO — chỉ email được duyệt mới tham gia |
| 🎋 | Grid bao lì xì hoạt ảnh trên cành tre |
| 💸 | Phân phối VND thông minh với mệnh giá tuỳ chỉnh |
| 🃏 | Thiệp Tết ngẫu nhiên + lời chúc |
| � | Email tự động qua Mailgun |
| ⏱ | Countdown giờ bắt đầu |
| 🎵 | Nhạc Tết + waveform visualizer |
| 🎰 | **Bonus Round** — lượt thưởng bí mật cho người được chọn |
| 🔄 | **Auto-Retry** — % người dùng được rút thêm tự động |
| 💰 | **Quỹ Donate** — dùng tiền đóng góp làm ngân sách |
| 🌄 | Background xoay tự động với morph crossfade |

---

## 🚀 Quick Start

```bash
# 1. Clone & install
git clone https://github.com/nguyen-hoang-ntq/Lucky-Money.git
cd Lucky-Money
npm install

# 2. Cấu hình môi trường
cp .env.example .env.local
# Chỉnh sửa .env.local — xem docs/deployment.md

# 3. Tạo database schema
npx prisma db push

# 4. Chạy dev server
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000)

---

## � Tech Stack

| Lớp | Công nghệ |
|-----|-----------|
| Framework | Next.js 15 (App Router) |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth.js (Google OAuth) |
| Animation | Framer Motion |
| Email | Mailgun |
| Hosting | Vercel |

---

## 🔑 Biến Môi Trường Bắt Buộc

| Biến | Mô tả |
|------|-------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | URL ứng dụng (prod: domain thật) |
| `NEXT_GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `NEXT_GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret |
| `ADMIN_PASSWORD_HASH` | SHA-256 hash mật khẩu admin |

Biến tuỳ chọn: `MAILGUN_API_KEY`, `MAILGUN_DOMAIN`  
→ Chi tiết: [docs/deployment.md](docs/deployment.md)

---

## 🔒 Bảo Mật

- Admin: SHA-256 hashed password, không lưu plain-text
- Claim: PostgreSQL `Serializable` isolation — chống double-claim
- Email whitelist: chỉ email được duyệt mới vào được
- Secrets: Mailgun & admin hash là server-side only, không expose ra client

---

## 📄 License

[MIT License](LICENSE)

---

<p align="center">
  <strong>🧧 Chúc Mừng Năm Mới — Happy Lunar New Year! 🧧</strong><br/>
  <sub>Built with ❤️ by <a href="https://www.ntq.technology/">NTQ Technology</a> — Tết Bính Ngọ 2026 🐴</sub>
</p>
