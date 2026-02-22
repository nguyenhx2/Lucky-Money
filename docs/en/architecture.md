# System Architecture — Lucky Money

🌐 **Language / Ngôn ngữ / 言語:** [🇻🇳 Tiếng Việt](../architecture.md) · 🇬🇧 English · [🇯🇵 日本語](../ja/architecture.md)

📚 **Other docs:** [System Flow](system-flow.md) · [Admin Guide](admin-guide.md) · [User Guide](user-guide.md) · [Deployment](deployment.md) · [Customization](customization.md)

---

## Overview

Lucky Money is a digital **Lunar New Year envelope (lì xì) app** built on **Next.js 15 App Router**, running on Vercel and using PostgreSQL (Neon) as the database.

---

## Tech Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| **Framework** | Next.js 15 (App Router) | SSR + CSR hybrid |
| **Language** | TypeScript | Strict mode |
| **Database** | PostgreSQL + Prisma ORM | Neon serverless |
| **Auth** | NextAuth.js (Google OAuth 2.0) | JWT sessions |
| **Email** | Mailgun REST API | Optional |
| **Styling** | Tailwind CSS | Custom globals.css |
| **Animation** | Framer Motion | GPU-accelerated |
| **Audio** | Web Audio API | Analyser + waveform |
| **Hosting** | Vercel | Edge-ready |
| **Audio Effect** | canvas-confetti | Result celebrations |

---

## Project Structure

```
Lucky-Money/
├── prisma/
│   └── schema.prisma          # Database schema (8 models)
├── public/
│   ├── assets/
│   │   ├── li-xi/             # Envelope images (WebP)
│   │   ├── thiep/             # Greeting cards (WebP)
│   │   └── audio/             # Background music (MP3)
│   ├── background/            # Page backgrounds (WebP)
│   └── images/                # Decorative images
└── src/
    ├── app/
    │   ├── api/               # API Routes (Next.js)
    │   │   ├── admin/auth/    # Admin password validation
    │   │   ├── allowed-emails/ # Whitelist email CRUD
    │   │   ├── auth/          # NextAuth handlers
    │   │   ├── denominations/ # Denomination CRUD
    │   │   ├── donate/        # Donation fund system
    │   │   └── game/          # Core game logic
    │   ├── globals.css        # Animations, utilities
    │   ├── layout.tsx         # Root layout + fonts
    │   └── page.tsx           # Main game page
    ├── components/            # React components
    └── lib/                   # Utilities and config
```

---

## Database Schema

### `GameSession` — Game Session
```prisma
id               String    -- CUID
budget           Int       -- Total budget (VND)
quantity         Int       -- Number of envelopes
isActive         Boolean   -- Session active state
startAt          DateTime? -- Start time (countdown)
maxPicksPerUser  Int       -- Max picks per user
autoplayMusic    Boolean   -- Auto-play music toggle
bgKey            String    -- Background theme key
bgRotateInterval Int       -- Background rotation interval (0=off)
bonusEnabled     Boolean   -- Secret bonus round toggle
bonusBudgetPercent Int     -- % budget for bonus
retryPercent     Int       -- % users granted extra turn
emailEnabled     Boolean   -- Email notification toggle
budgetSource     String    -- "manual" | "donate"
```

### `Envelope` — Lucky Envelope
```prisma
amount          Int       -- Value (VND)
isOpened        Boolean   -- Claimed state
imageUrl        String?   -- Envelope image
wish            String?   -- Greeting message
thiepUrl        String?   -- Greeting card image
claimedByEmail  String?   -- Claimant email
claimedAt       DateTime? -- Claim timestamp
isBonusEnvelope Boolean   -- Is a bonus envelope
```

### `RetryGrant` — Extra Turn
```prisma
userEmail      String   -- Recipient email
used           Boolean  -- Use state
isAutoAssigned Boolean  -- Auto-assigned (via retryPercent)
```

---

## API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/game` | Get current session + envelopes |
| `POST` | `/api/game` | Create new session |
| `PATCH` | `/api/game` | Update session settings |
| `DELETE` | `/api/game` | Delete session |
| `POST` | `/api/game/claim` | Claim envelope (race-safe) |
| `POST` | `/api/game/bonus-claim` | Claim bonus round |
| `POST` | `/api/game/redistribute` | Regenerate unclaimed envelopes |
| `POST/DELETE` | `/api/game/retry` | Grant / Delete extra turn |
| `POST/DELETE` | `/api/game/bonus-grant` | Grant / Delete bonus turn |
| `POST` | `/api/game/send-email` | Manually send result email |
| `GET/POST/DELETE` | `/api/allowed-emails` | Manage email whitelist |
| `GET/POST/DELETE` | `/api/denominations` | Manage denominations |
| `POST` | `/api/admin/auth` | Validate admin password |

---

## Security

- **Admin auth**: SHA-256 hash comparison — raw passwords are never stored.
- **Claim race condition**: PostgreSQL `Serializable` isolation — prevents double-claiming a single envelope.
- **Email whitelist**: Only approved emails can participate.
- **Server-side only**: Mailgun API key and admin hash are never exposed to the client.

---

📚 **Read next:** [System Flow](system-flow.md) · [Deployment](deployment.md) · [Admin Guide](admin-guide.md)
