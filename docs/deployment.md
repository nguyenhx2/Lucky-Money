# Deployment Guide — Lucky Money

🌐 **Ngôn ngữ / Language / 言語:** 🇻🇳 Tiếng Việt · [🇬🇧 English](en/deployment.md) · [🇯🇵 日本語](ja/deployment.md)

📚 **Tài liệu khác:** [Kiến trúc](architecture.md) · [Hướng dẫn Admin](admin-guide.md) · [Customization](customization.md)

---

## Yêu Cầu

| Thành phần | Tối thiểu | Khuyến nghị |
|------------|-----------|-------------|
| Node.js | 18.x | 20.x LTS |
| PostgreSQL | 14+ | Neon (serverless) |
| Google OAuth | Bắt buộc | Google Cloud Console |
| Mailgun | Tuỳ chọn | Mailgun EU/US |

---

## Cấu Hình Environment Variables

Tạo file `.env.local` (KHÔNG commit vào git):

```env
# ── Database ──────────────────────────────────────────
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

# ── NextAuth ──────────────────────────────────────────
NEXTAUTH_SECRET="<random-32-byte-string>"
NEXTAUTH_URL="https://yourdomain.com"

# ── Google OAuth ──────────────────────────────────────
NEXT_GOOGLE_CLIENT_ID="xxxx.apps.googleusercontent.com"
NEXT_GOOGLE_CLIENT_SECRET="GOCSPX-xxxx"

# ── Admin ─────────────────────────────────────────────
ADMIN_PASSWORD_HASH="<sha256-hash-của-mật-khẩu>"

# ── Email (tuỳ chọn) ──────────────────────────────────
MAILGUN_API_KEY="key-xxxx"
MAILGUN_DOMAIN="mg.yourdomain.com"
```

### Tạo NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

### Tạo ADMIN_PASSWORD_HASH

```bash
# Node.js
node -e "const c=require('crypto');console.log(c.createHash('sha256').update('MậtKhẩuCủaBạn').digest('hex'))"

# openssl
echo -n "MậtKhẩuCủaBạn" | openssl dgst -sha256
```

---

## Cài Đặt Google OAuth

1. Vào [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Tạo **OAuth 2.0 Client ID** (Web Application)
3. Thêm **Authorized redirect URIs**:
   - Dev: `http://localhost:3000/api/auth/callback/google`
   - Prod: `https://yourdomain.com/api/auth/callback/google`
4. Copy Client ID và Client Secret vào `.env.local`

---

## Cài Đặt Database

### Option A: Neon (Khuyến nghị cho Vercel)

1. Tạo project tại [neon.tech](https://neon.tech)
2. Copy connection string vào `DATABASE_URL`
3. Chạy schema:

```bash
npx prisma db push
```

### Option B: Supabase

1. Tạo project tại [supabase.com](https://supabase.com)
2. Lấy connection string từ **Settings → Database → Connection string → URI**
3. Thêm `?pgbouncer=true` nếu dùng pooler
4. Chạy `npx prisma db push`

### Option C: Railway / Render

1. Tạo PostgreSQL service
2. Copy `DATABASE_URL` từ dashboard
3. Chạy `npx prisma db push`

---

## Deploy lên Vercel (Khuyến Nghị)

### Bước 1: Push lên GitHub

```bash
git add .
git commit -m "initial deploy"
git push origin main
```

### Bước 2: Import vào Vercel

1. Vào [vercel.com/new](https://vercel.com/new)
2. Import từ GitHub repo
3. Framework preset: **Next.js** (tự động nhận diện)

### Bước 3: Cài đặt Environment Variables

Trong **Settings → Environment Variables**, thêm tất cả biến từ `.env.local`.

> **Lưu ý quan trọng**: `NEXTAUTH_URL` phải là domain production của bạn, ví dụ `https://lucky-money.vercel.app`

### Bước 4: Deploy

Nhấn **Deploy** — Vercel tự chạy:
1. `npm install`
2. `npm run build` (Next.js build)
3. `postinstall` script: `prisma generate`

### Cập Nhật Schema Sau Deploy

```bash
# Từ máy local với DATABASE_URL của production
DATABASE_URL="<prod_db_url>" npx prisma db push
```

---

## Deploy Self-Hosted (Docker / VPS)

### Build Production

```bash
npm install
npm run build
```

### Chạy

```bash
npm start
# hoặc
NODE_ENV=production npm start
```

### Với PM2

```bash
npm install -g pm2
pm2 start npm --name "lucky-money" -- start
pm2 save
pm2 startup
```

### Với Docker

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

> Cần thêm `output: 'standalone'` vào `next.config.ts` khi dùng Docker.

---

## Verifikasi Setelah Deploy

```bash
# Check TypeScript
npx tsc --noEmit

# Check database kết nối
npx prisma studio

# Check build  
npm run build
```

### Checklist Trước Khi Go-Live

- [ ] `NEXTAUTH_URL` đúng domain production
- [ ] `NEXTAUTH_SECRET` là chuỗi ngẫu nhiên mạnh (min 32 bytes)
- [ ] Google OAuth redirect URI đã thêm domain production
- [ ] `DATABASE_URL` trỏ đúng production DB
- [ ] `npx prisma db push` đã chạy trên production DB
- [ ] `.env.local` **không** commit vào git
- [ ] Kiểm tra `git log --all -p -- .env*` không có secret lọt

---

## Troubleshooting

### Lỗi: `PrismaClientKnownRequestError`
→ Chưa chạy `npx prisma db push`. Chạy với đúng `DATABASE_URL`.

### Lỗi: `NEXTAUTH_URL` mismatch
→ Cập nhật biến môi trường trong Vercel dashboard và redeploy.

### Lỗi: Google OAuth callback blocked
→ Kiểm tra Authorized redirect URIs trong Google Cloud Console.

### Email không gửi được
→ Kiểm tra `MAILGUN_API_KEY` và `MAILGUN_DOMAIN`. Email chức năng là tuỳ chọn — game vẫn hoạt động bình thường nếu thiếu.

### Prisma types lỗi sau db push
→ Chạy `npx prisma generate` để regenerate client types.

---

## Cập Nhật / Rollback

```bash
# Cập nhật
git pull origin main
npm install
npm run build
npx prisma db push  # nếu schema thay đổi
pm2 restart lucky-money  # nếu dùng PM2

# Rollback trên Vercel
# Dashboard → Deployments → Chọn deployment cũ → Promote to Production
```
