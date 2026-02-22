# Customization Guide — Lucky Money

🌐 **Ngôn ngữ / Language / 言語:** 🇻🇳 Tiếng Việt · [🇬🇧 English](en/customization.md) · [🇯🇵 日本語](ja/customization.md)

📚 **Tài liệu khác:** [Kiến trúc](architecture.md) · [Hướng dẫn Admin](admin-guide.md) · [Hướng dẫn User](user-guide.md) · [Deployment](deployment.md) · [System Flow](system-flow.md)

---

---

## 🧧 Bao Lì Xì Hiện Có

| li-xi-binh-ngo | li-xi-binh-ngo-1 | li-xi-binh-ngo-3 | li-xi-binh-ngo-8 | minh-hoa-4 | minh-hoa-9 | minh-hoa-10 |
|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| ![](../public/assets/li-xi/li-xi-binh-ngo.webp) | ![](../public/assets/li-xi/li-xi-binh-ngo-1.webp) | ![](../public/assets/li-xi/li-xi-binh-ngo-3.webp) | ![](../public/assets/li-xi/li-xi-binh-ngo-8.webp) | ![](../public/assets/li-xi/li-xi-minh-hoa-tet-2026-4.webp) | ![](../public/assets/li-xi/li-xi-minh-hoa-tet-2026-9.webp) | ![](../public/assets/li-xi/li-xi-minh-hoa-tet-2026-10.webp) |

---

## 🃏 Thiệp Tết Hiện Có

| thiep-4 | thiep-5 | truyen-thong-2 | truyen-thong-3 | thiep7 | thiep8 | thiep9 |
|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| ![](../public/assets/thiep/thiep-chuc-tet-4.webp) | ![](../public/assets/thiep/thiep-chuc-tet-5.webp) | ![](../public/assets/thiep/thiep-chuc-tet-truyen-thong-2.webp) | ![](../public/assets/thiep/thiep-chuc-tet-truyen-thong-3.webp) | ![](../public/assets/thiep/thiep-chuc-tet7.webp) | ![](../public/assets/thiep/thiep-chuc-tet8.webp) | ![](../public/assets/thiep/thiep-chuc-tet9.webp) |

---



Hướng dẫn tuỳ chỉnh giao diện, nội dung và hành vi của ứng dụng.

---

## Ảnh Bao Lì Xì

- Đặt ảnh vào `public/assets/li-xi/` (định dạng **WebP**, ~200×300px)
- Cập nhật mảng `LIXI_IMAGES` trong `src/components/FloatingLiXi.tsx`
- Cập nhật mảng `ENVELOPE_IMAGES` trong `src/lib/distribute.ts`

---

## Thiệp Tết

- Đặt ảnh vào `public/assets/thiep/` (định dạng **WebP**)
- Cập nhật mảng `THIEP_IMAGES` trong `src/lib/distribute.ts`

---

## Background Nền

- Đặt ảnh vào `public/background/` (định dạng **WebP**)
- Thêm entry vào `src/lib/backgrounds.ts`:

```typescript
{
  key: 'my-bg',
  label: 'Tên hiển thị',
  src: '/background/my-bg.webp',
  overlay: 'bg-black/40',       // Tailwind opacity overlay
  headerBg: 'bg-black/10',      // Header tint khi scroll
}
```

---

## Nhạc Nền

- Thêm file MP3 vào `public/assets/audio/`
- Cập nhật đường dẫn trong `src/components/TetAudioPlayer.tsx`:

```typescript
const audio = new Audio('/assets/audio/ten-file.mp3')
```

---

## Lời Chúc Tết

Chỉnh sửa collection trong `src/lib/wishes.ts`.

---

## Mệnh Giá Mặc Định

Chỉnh `DEFAULT_DENOMINATIONS` trong `src/lib/distribute.ts`:

```typescript
export const DEFAULT_DENOMINATIONS = [
  { amount: 50000, weight: 5 },    // Xuất hiện nhiều hơn
  { amount: 100000, weight: 3 },
  { amount: 200000, weight: 2 },
  { amount: 500000, weight: 1 },   // Xuất hiện ít hơn
]
```

> Admin cũng có thể ghi đè per-session qua Admin Panel → Setup tab.

---

## Font Chữ

Fonts cấu hình trong `src/app/layout.tsx` (Google Fonts via next/font):
- **Quicksand** — UI chính
- **Dancing Script** — Lời chúc Tết, tiêu đề

---

## Email Template

Chỉnh HTML template trong `src/lib/email.ts`. Template hỗ trợ:
- `{{name}}` — Tên người nhận
- `{{amount}}` — Số tiền VND
- `{{imageUrl}}` — Ảnh thiệp nhúng

---

## Performance Tuning Mobile

Các hằng số có thể điều chỉnh trong `src/app/page.tsx`:

```typescript
// Số petal rơi
const PETAL_COUNT = IS_MOBILE ? 6 : 15

// Số ảnh lì xì nền
// src/components/FloatingLiXi.tsx
const FLOAT_COUNT = IS_MOBILE ? 4 : 10
```
