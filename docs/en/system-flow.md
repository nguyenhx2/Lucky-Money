# System Flow — Lucky Money

🌐 **Language / Ngôn ngữ / 言語:** [🇻🇳 Tiếng Việt](../../docs/system-flow.md) · 🇬🇧 English · [🇯🇵 日本語](../ja/system-flow.md)

📚 **Other docs:** [Architecture](architecture.md) · [Admin Guide](admin-guide.md) · [User Guide](user-guide.md) · [Deployment](deployment.md)

---

## 1. Overall Flow

```mermaid
flowchart TD
    A[User visits /] --> B{Signed in?}
    B -- No --> C[LoginGate: Google Sign-In]
    C --> D[Google OAuth - NextAuth callback]
    D --> B
    B -- Yes --> E{Email in whitelist?}
    E -- No --> F[AccessDenied]
    E -- Yes --> G{Session active?}
    G -- No --> H[Waiting screen]
    G -- Yes --> I{startAt passed?}
    I -- No --> J[Countdown timer]
    J -- Time up --> K[EnvelopeGrid]
    I -- Yes --> K
    K --> L{User used all picks?}
    L -- No --> M[Select envelope]
    M --> N[POST /api/game/claim]
    N --> O{Race-safe claim OK?}
    O -- Error --> P[Toast: already taken - pick another]
    P --> K
    O -- OK --> Q[ResultModal: amount + greeting card]
    Q --> R{Unused BonusGrant?}
    R -- Yes --> S[Bonus Round button]
    S --> T[POST /api/game/bonus-claim]
    T --> U[Bonus ResultModal: purple 3D reveal]
    R -- No --> V{Unused RetryGrant?}
    V -- Yes --> W[Extra turn button]
    W --> K
    V -- No --> X[AlreadyPicked: view past results]
    L -- Yes --> X
```

---

## 2. Envelope Claim Flow (Race-Safe)

> [!IMPORTANT]
> **Race-Safe** guarantees no two users can claim the same envelope, even if they tap simultaneously. PostgreSQL `SERIALIZABLE` isolation + `SELECT ... FOR UPDATE` is the technical lock.

```mermaid
sequenceDiagram
    participant U as User Browser
    participant API as /api/game/claim
    participant DB as PostgreSQL

    U->>API: POST { envelopeId }
    Note over U: Optimistic UI: hide envelope immediately
    API->>DB: BEGIN SERIALIZABLE TRANSACTION
    DB->>API: SELECT envelope FOR UPDATE
    alt Envelope already claimed - isOpened = true
        API-->>U: 409 ALREADY_OPENED
        Note over U: Revert UI - show toast - select different envelope
    else Envelope available
        API->>DB: UPDATE SET isOpened=true, claimedBy=...
        DB->>API: OK
        API->>DB: COMMIT
        API-->>U: 200 { amount, wish, thiepUrl, hasBonusRound, hasRetryAvailable }
        Note over U: ResultModal appears
    end
```

**Why is Race-Safe necessary?**
- 2 users tap the same envelope within milliseconds
- Without a lock: both `SELECT isOpened = false` and both UPDATE
- With `SERIALIZABLE` + `FOR UPDATE`: user 2 blocks until user 1 commits, then re-reads and sees `isOpened = true` → returns 409

---

## 3. Extra Turn Flow (RetryGrant)

> [!NOTE]
> When admin grants a retry or the system auto-grants based on `retryPercent`, the user gets an **extra pick** returning to EnvelopeGrid after their first pick.

```mermaid
sequenceDiagram
    participant Admin as Admin Panel
    participant DB as PostgreSQL
    participant U as User

    Admin->>DB: POST /api/game/retry { userEmail }
    Note over DB: INSERT RetryGrant - duplicate blocked by unique index
    DB-->>Admin: 201 OK or 409 Already granted

    U->>DB: POST /api/game/claim - regular pick
    DB-->>U: 200 { hasRetryAvailable: true }
    Note over U: Extra turn button in ResultModal
    U->>DB: Use RetryGrant
    DB->>DB: UPDATE RetryGrant SET used=true
    DB-->>U: Back to EnvelopeGrid for another pick
```

---

## 4. Session Creation (Admin)

```mermaid
flowchart LR
    A[Admin opens Setup tab] --> B[Enter budget - quantity - start time]
    B --> C[POST /api/game]
    C --> D[Distribute algorithm]
    D --> E{Budget source?}
    E -- manual --> F[Use manually entered budget]
    E -- donate --> G[Sum all DonateContributor amounts]
    F --> H[Create Envelope records]
    G --> H
    H --> I[Assign imageUrl - wish - thiepUrl randomly]
    I --> J[Assign positionTop/Left for grid]
    J --> K[Session active - EnvelopeGrid visible]
```

---

## 5. Bonus Round Flow

```mermaid
sequenceDiagram
    participant Admin as Admin Panel
    participant DB as PostgreSQL
    participant U as User

    Admin->>DB: Enable bonusEnabled - bonusBudgetPercent = 20%
    Note over DB: % of budget reserved for bonus envelopes
    Admin->>DB: POST /api/game/bonus-grant { userEmail }
    DB-->>Admin: 201 BonusGrant created
    U->>DB: Regular claim - POST /claim
    DB-->>U: hasBonusRound: true
    Note over U: Bonus Round button appears
    U->>DB: POST /api/game/bonus-claim
    DB->>DB: Find unclaimed bonus envelope
    DB-->>U: bonusAmount - bonusWish - bonusThiepUrl
    Note over U: Purple 3D flip reveal
```

---

## 6. Polling

`page.tsx` polls `/api/game` every **5 seconds** when tab is visible:

```
Tab visible  -> startPolling() -> setInterval 5s -> fetchSession()
Tab hidden   -> stopPolling()
Tab focus    -> fetchSession() immediately + startPolling()
Claiming in progress (isClaimingRef=true) -> skip poll to avoid interruption
```

---

📚 **Read next:** [Architecture](architecture.md) · [Admin Guide](admin-guide.md) · [Deployment](deployment.md)
