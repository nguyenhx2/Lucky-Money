# 🧧 Lucky Money — Interactive Lunar New Year App

🌐 **Language / Ngôn ngữ / 言語:** [🇻🇳 Tiếng Việt](README.md) · 🇬🇧 English · [🇯🇵 日本語](README.ja.md)

> **Interactive Lunar New Year lucky envelope app** for companies and small teams.  
> Participants sign in with Google, pick a lucky envelope, receive random cash amounts with a personalized card and email notification — all wrapped in a festive atmosphere.

<p align="center">
  <img src="public/images/plum-flower.webp" alt="Plum Flower" width="160" />
  <img src="public/images/fireworks-2.webp" alt="Fireworks" width="160" />
  <img src="public/images/new-year-greeting.webp" alt="New Year Greeting" width="160" />
</p>

---

## 📚 Documentation

| Document | 🇻🇳 Tiếng Việt | 🇬🇧 English | 🇯🇵 日本語 |
|----------|---------------|-------------|----------|
| 🏗 Architecture | [docs/architecture.md](docs/architecture.md) | [docs/en/architecture.md](docs/en/architecture.md) | — |
| 🔄 System Flow | [docs/system-flow.md](docs/system-flow.md) | [docs/en/system-flow.md](docs/en/system-flow.md) | [docs/ja/system-flow.md](docs/ja/system-flow.md) |
| 👤 User Guide | [docs/user-guide.md](docs/user-guide.md) | [docs/en/user-guide.md](docs/en/user-guide.md) | [docs/ja/user-guide.md](docs/ja/user-guide.md) |
| 🛠 Admin Guide | [docs/admin-guide.md](docs/admin-guide.md) | [docs/en/admin-guide.md](docs/en/admin-guide.md) | [docs/ja/admin-guide.md](docs/ja/admin-guide.md) |
| 🚀 Deployment | [docs/deployment.md](docs/deployment.md) | [docs/en/deployment.md](docs/en/deployment.md) | — |
| 🎨 Customization | [docs/customization.md](docs/customization.md) | [docs/en/customization.md](docs/en/customization.md) | — |

---

## ✨ Features

- 🔐 **Google SSO** — Whitelisted participants only.
- 🎋 **Animated Grid** — 3D envelopes on bamboo poles.
- 💸 **Smart Distribution** — Weighted random denominations.
- 🃏 **Greeting Cards** — Personalized cards with random wishes.
- 📧 **Automatic Emails** — Instant notifications via Mailgun.
- 🎰 **Bonus Round** — Secret second draw for selected users.
- 🔄 **Auto-Retry** — Percentage-based automatic turn grants.
- 💰 **Donate Pool** — Use community contributions as budget.

---

## 🚀 Quick Start

```bash
# 1. Clone & install
git clone https://github.com/nguyen-hoang-ntq/Lucky-Money.git
cd Lucky-Money
npm install

# 2. Configure Environment
cp .env.example .env.local
# Edit .env.local — see docs/en/deployment.md

# 3. Setup Database
npx prisma db push

# 4. Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔑 Required Env Vars

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Random secret key |
| `NEXT_GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `ADMIN_PASSWORD_HASH` | SHA-256 admin password hash |

---

<p align="center">
  <strong>🧧 Chúc Mừng Năm Mới — Happy Lunar New Year! 🧧</strong><br/>
  <sub>Built with ❤️ by <a href="https://www.ntq.technology/">NTQ Technology</a> — Tết Bính Ngọ 2026 🐴</sub>
</p>
