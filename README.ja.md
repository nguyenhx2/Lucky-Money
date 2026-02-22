# 🧧 Lucky Money — お正月のお年玉抽選アプリ

🌐 **言語 / Language / Ngôn ngữ:** [🇻🇳 Tiếng Việt](README.md) · [🇬🇧 English](README.en.md) · 🇯🇵 日本語

> **お正月のお年玉（lì xì）をデジタルで体験**できる、社内・チーム向けのインタラクティブアプリです。  
> 参加者はGoogleでログインし、お年玉袋を選び、ランダムな金額とメッセージを受け取ります。

---

## 📚 ドキュメント

| ドキュメント | 🇻🇳 Tiếng Việt | 🇬🇧 English | 🇯🇵 日本語 |
|----------|---------------|-------------|----------|
| 🏗 アーキテクチャ | [docs/architecture.md](docs/architecture.md) | [docs/en/architecture.md](docs/en/architecture.md) | [docs/ja/architecture.md](docs/ja/architecture.md) |
| 🔄 システムフロー | [docs/system-flow.md](docs/system-flow.md) | [docs/en/system-flow.md](docs/en/system-flow.md) | [docs/ja/system-flow.md](docs/ja/system-flow.md) |
| 👤 ユーザーガイド | [docs/user-guide.md](docs/user-guide.md) | [docs/en/user-guide.md](docs/en/user-guide.md) | [docs/ja/user-guide.md](docs/ja/user-guide.md) |
| 🛠 管理者ガイド | [docs/admin-guide.md](docs/admin-guide.md) | [docs/en/admin-guide.md](docs/en/admin-guide.md) | [docs/ja/admin-guide.md](docs/ja/admin-guide.md) |
| 🚀 デプロイ | [docs/deployment.md](docs/deployment.md) | [docs/en/deployment.md](docs/en/deployment.md) | [docs/ja/deployment.md](docs/ja/deployment.md) |
| 🎨 カスタマイズ | [docs/customization.md](docs/customization.md) | [docs/en/customization.md](docs/en/customization.md) | [docs/ja/customization.md](docs/ja/customization.md) |

---

## 🚀 クイックスタート

```bash
# 1. クローン & インストール
git clone https://github.com/nguyen-hoang-ntq/Lucky-Money.git
cd Lucky-Money
npm install

# 2. 環境変数の設定
cp .env.example .env.local
# .env.local を編集してください

# 3. データベースのセットアップ
npx prisma db push

# 4. 実行
npm run dev
```

[http://localhost:3000](http://localhost:3000) を開きます。

---

<p align="center">
  <strong>🧧 Chúc Mừng Năm Mới — 明けましておめでとうございます！ 🧧</strong><br/>
  <sub>NTQ Technology が ❤️ を込めて制作 — 2026年 丙午 🐴</sub>
</p>
