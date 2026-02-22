# Deployment Guide — Lucky Money

🌐 **Language / Ngôn ngữ / 言語:** [🇻🇳 Tiếng Việt](../deployment.md) · 🇬🇧 English · [🇯🇵 日本語](../ja/deployment.md)

📚 **Other docs:** [Architecture](architecture.md) · [Admin Guide](admin-guide.md) · [Customization](customization.md)

---

## Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| Node.js | 18.x | 20.x LTS |
| PostgreSQL | 14+ | Neon (serverless) |
| Google OAuth | Required | Google Cloud Console |
| Mailgun | Optional | Mailgun EU/US |

---

## Environment Variables

Create a `.env.local` file (DO NOT commit to git):

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
ADMIN_PASSWORD_HASH="<sha256-password-hash>"

# ── Email (optional) ──────────────────────────────────
MAILGUN_API_KEY="key-xxxx"
MAILGUN_DOMAIN="mg.yourdomain.com"
```

### Generate NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

### Generate ADMIN_PASSWORD_HASH

```bash
# Using Node.js
node -e "const c=require('crypto');console.log(c.createHash('sha256').update('YourPassword').digest('hex'))"
```

---

## Google OAuth Setup

1. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Create **OAuth 2.0 Client ID** (Web Application)
3. Add **Authorized redirect URIs**:
   - Dev: `http://localhost:3000/api/auth/callback/google`
   - Prod: `https://yourdomain.com/api/auth/callback/google`
4. Copy Client ID and Client Secret to `.env.local`

---

## Database Setup

### Option A: Neon (Recommended for Vercel)

1. Create a project at [neon.tech](https://neon.tech)
2. Copy the connection string to `DATABASE_URL`
3. Push the schema:

```bash
npx prisma db push
```

---

## Deploy to Vercel (Recommended)

1. Push your repo to GitHub.
2. Import the project in [Vercel](https://vercel.com/new).
3. Framework preset: **Next.js** (automatically detected).
4. Add all environment variables in **Settings → Environment Variables**.
5. Deploy! Vercel will automatically run `npm install`, `npm run build`, and `prisma generate`.

---

## Self-Hosted (Docker / VPS)

### Production Build

```bash
npm install
npm run build
```

### Run

```bash
npm start
```

---

## Troubleshooting

### Error: `PrismaClientKnownRequestError`
→ The schema hasn't been pushed to the database. Run `npx prisma db push` with the correct `DATABASE_URL`.

### Error: `NEXTAUTH_URL` mismatch
→ Update the environment variable in your dashboard and redeploy.

### Error: Google OAuth callback blocked
→ Check the Authorized redirect URIs in Google Cloud Console.

---

📚 **Read next:** [Architecture](architecture.md) · [Admin Guide](admin-guide.md)
