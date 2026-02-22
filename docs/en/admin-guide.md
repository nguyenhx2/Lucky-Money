# Admin Guide — Lucky Money

🌐 **Language / Ngôn ngữ / 言語:** [🇻🇳 Tiếng Việt](../../docs/admin-guide.md) · 🇬🇧 English · [🇯🇵 日本語](../ja/admin-guide.md)

📚 **Other docs:** [User Guide](user-guide.md) · [System Flow](system-flow.md) · [Architecture](architecture.md) · [Deployment](deployment.md)

---

Guide for **administrators** using the Admin Panel.

---

## Accessing the Admin Panel

Press **`Ctrl + Shift + G`** (Windows/Linux) or **`Cmd + Shift + G`** (macOS) to open.

Enter the **admin password** (SHA-256 hash configured in `.env.local`).

> To close without logging in, press **✕** or **"Cancel"**.

---

## Tab: Setup

### Creating a New Session

| Field | Description |
|-------|-------------|
| **Budget** | Total lì xì money (VND), with thousand separators |
| **Quantity** | Number of envelopes |
| **Start At** | When the session opens (countdown displayed to users) |
| **Max Picks** | Maximum picks per person |
| **Retry %** | % of players automatically granted an extra turn |
| **Bonus Round** | Enable/disable the secret bonus round |
| **Bonus %** | % of budget reserved for bonus envelopes |
| **Auto Music** | ON: plays on user gesture. OFF: user must press play manually |

### Budget Source

- **Manual**: Admin enters the amount directly
- **From Donate Fund**: Total VND from the DonateContributor list

### Denominations

Add/remove denominations (VND) and weights. Higher weight = appears more frequently.

### Redistribute

Regenerate unclaimed envelopes — does not affect already-claimed ones. Use when you want to change the distribution mid-session.

---

## Tab: History

View all claimed envelopes:

- **Card view**: Greeting card image, claimant name, amount
- **Table view**: List format, sorted by time
- **Stats**: Total distributed, remaining envelopes, denomination breakdown
- **Resend Email**: Manually trigger result email for each person

---

## Tab: Retry (Extra Turns)

Grant additional picks to specific players:

1. Enter the player's email
2. Click **"Grant Retry"**
3. The list below shows all current retry grants

> Toast notification if the email already has a grant (no duplicates).

**Grant Bonus Round:**
1. Enter email in the Bonus field
2. Click **"Grant Bonus"**

> Each email can only have 1 bonus grant (unique constraint in DB).

---

## Tab: Simulate

Use to **test** the claim flow without real accounts:

1. Enter a fake email (tagged as `[Test]` in DB)
2. Select an envelope from the list
3. Click **"Simulate"**

> No real emails are sent during simulation.

---

## Tab: Background

- Choose from preset backgrounds
- **Auto-rotate**: Set interval in seconds — 0 = disabled

---

## Tab: Emails (Whitelist)

**Add emails:**
- Enter one email at a time, or paste multiple (separated by comma/newline/semicolon)
- Optionally attach a label (display name)

**Remove emails:**
- Click ✕ on each row or use **"Remove All"**

**Search:**
- Search box filters list by email or label

---

## Tab: Donate (Fund)

### Managing Contributors

| Field | Required | Description |
|-------|----------|-------------|
| Name | ✅ | Display name |
| Email | ✅ | Unique identifier |
| Amount (VND) | ✅ | Contribution amount |
| Note | ❌ | Optional message |

### Display Settings

| Toggle | Description |
|--------|-------------|
| **Show donate list** | Allow regular users to see the DonateBadge |
| **Show contributor stats** | Allow contributors to see winners & prize stats |

### Using Donate Fund as Budget

Click **"Use donate as budget"** → Switches budgetSource to `donate` in the session.

---

## Toast Notifications

All admin actions have toast feedback:

| Color | Meaning |
|-------|---------|
| 🟢 Green | Success |
| 🔴 Red | Error (specific message) |
| 🟡 Yellow | Info |

Friendly messages by HTTP status:
- **409** Conflict → "already exists!"
- **404** Not Found → "not found!"
- **403** Forbidden → "no permission!"
- Others → "try again!"

---

## Tips & Best Practices

1. **Create the session before the event** — test with Simulate tab first
2. **Set a countdown** using `startAt` so users see the timer
3. **Whitelist emails in advance** — bulk paste from employee list
4. **Backup**: Use History tab before deleting a session
5. **Bonus round**: Grant to VIPs or from a random draw before the event
6. **Auto Music OFF** → Suitable for quiet office environments

---

📚 **Read next:** [System Flow](system-flow.md) · [Architecture](architecture.md) · [Deployment](deployment.md)
