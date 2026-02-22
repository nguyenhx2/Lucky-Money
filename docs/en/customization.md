# Customization Guide — Lucky Money

🌐 **Language / Ngôn ngữ / 言語:** [🇻🇳 Tiếng Việt](../customization.md) · 🇬🇧 English · [🇯🇵 日本語](../ja/customization.md)

📚 **Other docs:** [Architecture](architecture.md) · [Admin Guide](admin-guide.md) · [User Guide](user-guide.md) · [Deployment](deployment.md) · [System Flow](system-flow.md)

---

## 🧧 Existing Envelopes

| li-xi-binh-ngo | li-xi-binh-ngo-1 | li-xi-binh-ngo-3 | li-xi-binh-ngo-8 | minh-hoa-4 | minh-hoa-9 | minh-hoa-10 |
|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| ![](../../public/assets/li-xi/li-xi-binh-ngo.webp) | ![](../../public/assets/li-xi/li-xi-binh-ngo-1.webp) | ![](../../public/assets/li-xi/li-xi-binh-ngo-3.webp) | ![](../../public/assets/li-xi/li-xi-binh-ngo-8.webp) | ![](../../public/assets/li-xi/li-xi-minh-hoa-tet-2026-4.webp) | ![](../../public/assets/li-xi/li-xi-minh-hoa-tet-2026-9.webp) | ![](../../public/assets/li-xi/li-xi-minh-hoa-tet-2026-10.webp) |

---

## 🃏 Existing Greeting Cards

| thiep-4 | thiep-5 | truyen-thong-2 | truyen-thong-3 | thiep7 | thiep8 | thiep9 |
|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| ![](../../public/assets/thiep/thiep-chuc-tet-4.webp) | ![](../../public/assets/thiep/thiep-chuc-tet-5.webp) | ![](../../public/assets/thiep/thiep-chuc-tet-truyen-thong-2.webp) | ![](../../public/assets/thiep/thiep-chuc-tet-truyen-thong-3.webp) | ![](../../public/assets/thiep/thiep-chuc-tet7.webp) | ![](../../public/assets/thiep/thiep-chuc-tet8.webp) | ![](../../public/assets/thiep/thiep-chuc-tet9.webp) |

---

## Adding Assets

### Envelopes
- Add images to `public/assets/li-xi/` (**WebP**, ~200×300px recommended).
- Update the `ENVELOPE_IMAGES` array in `src/lib/distribute.ts`.

### Greeting Cards
- Add images to `public/assets/thiep/` (**WebP**).
- Update the `THIEP_IMAGES` array in `src/lib/distribute.ts`.

### Backgrounds
- Add images to `public/background/` (**WebP**).
- Register them in `src/lib/backgrounds.ts`.

---

## Content Customization

### Wishes
Edit the collection in `src/lib/wishes.ts`.

### Default Denominations
Modify `DEFAULT_DENOMINATIONS` in `src/lib/distribute.ts`.

---

## Performance Tuning (Mobile)

Adjust constants in `src/app/page.tsx`:
- `PETAL_COUNT`: Reduced on mobile (default: 6).
- `FLOAT_COUNT`: Reduced on mobile (default: 4).
