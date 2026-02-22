# デプロイガイド — Lucky Money

🌐 **言語 / Language / Ngôn ngữ:** [🇻🇳 Tiếng Việt](../deployment.md) · [🇬🇧 English](../en/deployment.md) · 🇯🇵 日本語

📚 **他のドキュメント:** [アーキテクチャ](architecture.md) · [管理者ガイド](admin-guide.md) · [カスタマイズ](customization.md)

---

## 必要条件

- **Node.js**: 18.x 以上
- **PostgreSQL**: 14 以上 (Neon サーバーレス推奨)
- **Google OAuth**: 必須
- **Mailgun**: オプション（メール通知用）

---

## 環境変数

`.env.local` ファイルを作成します（Gitにはコミットしないでください）：

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
NEXTAUTH_SECRET="<ランダムな文字列>"
NEXTAUTH_URL="https://yourdomain.com"
NEXT_GOOGLE_CLIENT_ID="xxxx"
NEXT_GOOGLE_CLIENT_SECRET="xxxx"
ADMIN_PASSWORD_HASH="<SHA-256 ハッシュ>"
```

---

## Vercel へのデプロイ（推奨）

1. リポジトリを GitHub にプッシュします。
2. [Vercel](https://vercel.com/new) でプロジェクトをインポートします。
3. **Settings → Environment Variables** で全ての環境変数を追加します。
4. デプロイを実行します。

---

## データベースのセットアップ

スキーマをデータベースに反映します：

```bash
npx prisma db push
```

---

📚 **次を読む:** [アーキテクチャ](architecture.md) · [管理者ガイド](admin-guide.md)
