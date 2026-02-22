# システムアーキテクト — Lucky Money

🌐 **言語 / Language / Ngôn ngữ:** [🇻🇳 Tiếng Việt](../architecture.md) · [🇬🇧 English](../en/architecture.md) · 🇯🇵 日本語

📚 **他のドキュメント:** [システムフロー](system-flow.md) · [管理者ガイド](admin-guide.md) · [ユーザーガイド](user-guide.md) · [デプロイ](deployment.md) · [カスタマイズ](customization.md)

---

## 概要

Lucky Moneyは、**Next.js 15 App Router**で構築されたデジタルお年玉（lì xì）アプリです。Vercelで動作し、データベースとしてPostgreSQL (Neon)を使用しています。

---

## 技術スタック

| レイヤー | テクノロジー | 備考 |
|---------|------------|------|
| **フレームワーク** | Next.js 15 (App Router) | SSR + CSR ハイブリッド |
| **言語** | TypeScript | 厳格モード |
| **データベース** | PostgreSQL + Prisma ORM | Neon サーバーレス |
| **認証** | NextAuth.js (Google OAuth 2.0) | JWT セッション |
| **メール** | Mailgun REST API | オプション |
| **スタイリング** | Tailwind CSS | カスタム globals.css |
| **アニメーション** | Framer Motion | GPU アクセラレーション |
| **オーディオ** | Web Audio API | アナライザー + 波形表示 |
| **ホスティング** | Vercel | Edge 対応 |

---

## プロジェクト構造

```
Lucky-Money/
├── prisma/
│   └── schema.prisma          # データベーススキーマ
├── public/
│   ├── assets/
│   │   ├── li-xi/             # お年玉袋の画像
│   │   ├── thiep/             # グリーティングカードの画像
│   │   └── audio/             # 背景音楽 (MP3)
│   ├── background/            # ページの背景画像
└── src/
    ├── app/
    │   ├── api/               # API ルート
    ├── components/            # React コンポーネント
    └── lib/                   # ユーティリティと設定
```

---

## セキュリティ

- **管理者認証**: SHA-256ハッシュ比較。生パスワードは保存されません。
- **排他制御 (Race-Safe)**: PostgreSQLの `Serializable` 分離レベルを使用。同じ封筒を二人が同時に取得することを防ぎます。
- **ホワイトリスト**: 承認されたメールアドレスのみが参加可能です。

---

📚 **次を読む:** [システムフロー](system-flow.md) · [デプロイ](deployment.md) · [管理者ガイド](admin-guide.md)
