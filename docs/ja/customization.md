# カスタマイズガイド — Lucky Money

🌐 **言語 / Language / Ngôn ngữ:** [🇻🇳 Tiếng Việt](../customization.md) · [🇬🇧 English](../en/customization.md) · 🇯🇵 日本語

📚 **他のドキュメント:** [アーキテクチャ](architecture.md) · [管理者ガイド](admin-guide.md) · [ユーザーガイド](user-guide.md) · [デプロイ](deployment.md) · [システムフロー](system-flow.md)

---

## 🧧 既存のお年玉袋

| li-xi-binh-ngo | li-xi-binh-ngo-1 | li-xi-binh-ngo-3 |
|:-:|:-:|:-:|
| ![](../../public/assets/li-xi/li-xi-binh-ngo.webp) | ![](../../public/assets/li-xi/li-xi-binh-ngo-1.webp) | ![](../../public/assets/li-xi/li-xi-binh-ngo-3.webp) |

---

## 🃏 既存のグリーティングカード

| thiep-4 | truyen-thong-2 | thiep9 |
|:-:|:-:|:-:|
| ![](../../public/assets/thiep/thiep-chuc-tet-4.webp) | ![](../../public/assets/thiep/thiep-chuc-tet-truyen-thong-2.webp) | ![](../../public/assets/thiep/thiep-chuc-tet9.webp) |

---

## アセットの追加

### お年玉袋
- `public/assets/li-xi/` に画像を追加します (**WebP** 形式)。
- `src/lib/distribute.ts` の `ENVELOPE_IMAGES` 配列を更新します。

### 背景画像
- `public/background/` に画像を追加します。
- `src/lib/backgrounds.ts` に登録します。

---

📚 **次を読む:** [システムフロー](../system-flow.md) · [アーキテクチャ](architecture.md)
