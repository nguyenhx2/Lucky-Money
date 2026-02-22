# System Flow — Lucky Money

🌐 **Ngôn ngữ / Language / 言語:** 🇻🇳 Tiếng Việt · [🇬🇧 English](en/system-flow.md) · [🇯🇵 日本語](ja/system-flow.md)

📚 **Tài liệu khác:** [Kiến trúc](architecture.md) · [Hướng dẫn Admin](admin-guide.md) · [Hướng dẫn User](user-guide.md) · [Deployment](deployment.md) · [Customization](customization.md)

---

## 1. Luồng Tổng Thể

```mermaid
flowchart TD
    A[Người dùng truy cập /] --> B{Đã đăng nhập?}
    B -- Chưa --> C[LoginGate: Google Sign-In]
    C --> D[Google OAuth - NextAuth callback]
    D --> B
    B -- Rồi --> E{Email trong whitelist?}
    E -- Không --> F[AccessDenied]
    E -- Có --> G{Phiên game active?}
    G -- Không --> H[Màn hình chờ]
    G -- Có --> I{startAt đã qua?}
    I -- Chưa --> J[Countdown timer]
    J -- Hết giờ --> K[EnvelopeGrid]
    I -- Rồi --> K
    K --> L{User đã rút đủ lượt?}
    L -- Chưa --> M[Chọn bao lì xì]
    M --> N[POST /api/game/claim]
    N --> O{Race-safe claim OK?}
    O -- Lỗi --> P[Toast error: đã bị lấy]
    P --> K
    O -- OK --> Q[ResultModal: số tiền + thiệp]
    Q --> R{Có BonusGrant chưa dùng?}
    R -- Có --> S[Nút rút thêm - Bonus Round]
    S --> T[POST /api/game/bonus-claim]
    T --> U[ResultModal bonus: hiệu ứng tím]
    R -- Không --> V{Có RetryGrant chưa dùng?}
    V -- Có --> W[Nút thêm lượt]
    W --> K
    V -- Không --> X[AlreadyPicked: xem kết quả cũ]
    L -- Rồi --> X
```

---

## 2. Luồng Claim Bao Lì Xì (Race-Safe)

> [!IMPORTANT]
> Cơ chế **Race-Safe** đảm bảo không có 2 người có thể rút cùng 1 bao, dù họ nhấn đồng thời. PostgreSQL `SERIALIZABLE` isolation + `SELECT ... FOR UPDATE` là chốt chặn kỹ thuật.

```mermaid
sequenceDiagram
    participant U as User Browser
    participant API as /api/game/claim
    participant DB as PostgreSQL

    U->>API: POST { envelopeId }
    Note over U: Optimistic UI: ẩn bao ngay lập tức
    API->>DB: BEGIN SERIALIZABLE TRANSACTION
    DB->>API: SELECT envelope FOR UPDATE
    alt Bao đã rút - isOpened = true
        API-->>U: 409 ALREADY_OPENED
        Note over U: Revert optimistic UI - toast error - chọn bao khác
    else Bao còn trống
        API->>DB: UPDATE SET isOpened=true, claimedBy=...
        DB->>API: OK
        API->>DB: COMMIT
        API-->>U: 200 { amount, wish, thiepUrl, hasBonusRound, hasRetryAvailable }
        Note over U: ResultModal hiện lên
    end
```

**Tại sao cần Race-Safe?**
- 2 người cùng nhấn vào 1 bao trong vòng milliseconds
- Không có transaction lock: cả 2 đều `SELECT isOpened = false` và cùng UPDATE
- Với `SERIALIZABLE` + `FOR UPDATE`: người thứ 2 bị block cho đến khi người thứ nhất commit, sau đó đọc lại và thấy `isOpened = true` → trả về 409

---

## 3. Luồng Thêm Lượt Rút (RetryGrant)

> [!NOTE]
> Khi admin cấp retry hoặc hệ thống tự cấp theo `retryPercent`, user nhận được **thêm lượt** quay lại EnvelopeGrid sau khi đã rút xong.

```mermaid
sequenceDiagram
    participant Admin as Admin Panel
    participant DB as PostgreSQL
    participant U as User

    Admin->>DB: POST /api/game/retry { userEmail }
    Note over DB: INSERT RetryGrant - unique per session+email blocked
    DB-->>Admin: 201 OK hoặc 409 Đã có rồi

    U->>DB: POST /api/game/claim - rút bao thường
    DB-->>U: 200 { hasRetryAvailable: true }
    Note over U: Nút thêm lượt hiện trong ResultModal
    U->>DB: Nhấn nút dùng RetryGrant
    DB->>DB: UPDATE RetryGrant SET used=true
    DB-->>U: Quay lại EnvelopeGrid để rút thêm
```

---

## 4. Luồng Tạo Phiên (Admin)

```mermaid
flowchart LR
    A[Admin mở Setup tab] --> B[Nhập ngân sách, số lượng, giờ bắt đầu]
    B --> C[POST /api/game]
    C --> D[Distribute algorithm]
    D --> E{Nguồn ngân sách?}
    E -- manual --> F[Dùng budget nhập tay]
    E -- donate --> G[Tính tổng DonateContributor]
    F --> H[Tạo Envelope records]
    G --> H
    H --> I[Gán imageUrl - wish - thiepUrl ngẫu nhiên]
    I --> J[Gán positionTop/Left cho grid]
    J --> K[Phiên active - EnvelopeGrid hiện ra]
```

---

## 5. Luồng Distribute Algorithm

File: `src/lib/distribute.ts`

```
Input: budget (VND), quantity (số bao), denominations (mệnh giá + weight)

1. Weighted random pick N denominations theo weight
2. Sum kiểm tra: nếu tổng khác budget -> điều chỉnh bao cuối cùng
3. Shuffle mảng (Fisher-Yates)
4. Gán ảnh, lời chúc, thiệp ngẫu nhiên cho mỗi bao
5. Gán toạ độ (positionTop, positionLeft) trên grid
Output: Envelope[] records
```

---

## 6. Luồng Bonus Round

```mermaid
sequenceDiagram
    participant Admin as Admin Panel
    participant DB as PostgreSQL
    participant U as User

    Admin->>DB: Bật bonusEnabled - bonusBudgetPercent = 20%
    Note over DB: % ngân sách dành riêng cho bonus envelopes
    Admin->>DB: POST /api/game/bonus-grant { userEmail }
    DB-->>Admin: 201 BonusGrant created
    U->>DB: Claim bao thường - POST /claim
    DB-->>U: hasBonusRound: true
    Note over U: Nút Bonus Round xuất hiện
    U->>DB: POST /api/game/bonus-claim
    DB->>DB: Tìm bonus envelope chưa rút
    DB-->>U: bonusAmount - bonusWish - bonusThiepUrl
    Note over U: 3D flip reveal - giao diện màu tím
```

---

## 7. Luồng Quỹ Donate

```mermaid
flowchart TD
    A[Admin thêm DonateContributor qua Donate tab] --> B[POST /api/donate]
    B --> C{budgetSource = donate?}
    C -- Có --> D[GET /api/game lay tong donate lam budget]
    C -- Không --> E[Budget nhập tay]

    F[User nhấn DonateBadge] --> G[GET /api/donate/public]
    G --> H{isContributor?}
    H -- Không --> I[Hiển thị donor list - tổng quỹ ẩn]
    H -- Có --> J[Full stats: prize distribution - winners]

    K[Admin toggle showPublicView] --> L[PATCH /api/donate/settings]
    L --> M{showPublicView?}
    M -- false --> N[DonateModal: khóa 🔒]
    M -- true --> I
```

---

## 8. Luồng Audio (Autoplay)

```mermaid
flowchart TD
    A[TetAudioPlayer mount] --> B{autoplayMusic bật?}
    B -- Có --> C[tryAutoplay ngay]
    C --> D{Browser cho phép?}
    D -- Có --> E[Fade in nhạc]
    D -- Không --> F[Đăng ký gesture listeners]
    F --> G[User chạm hoặc click -> tryPlay -> Fade in]
    G --> E
    B -- Không --> H[Không tự phát]
    H --> I[MusicPromptBubble: Arrow SVG + Nhan Play de nghe]
    I --> J[User ấn nút Play thủ công]
    J --> E
    E --> K[onPlayingChange = true -> MusicAmbientEffects bật]
```

---

## 9. Luồng Polling

`page.tsx` poll `/api/game` mỗi **5 giây** khi tab visible:

```
Tab visible  -> startPolling() -> setInterval 5s -> fetchSession()
Tab hidden   -> stopPolling()
Tab focus    -> fetchSession() ngay + startPolling()
Đang claiming (isClaimingRef=true) -> skip poll để không interrupt
```

---

## 10. Luồng Email Notification

```mermaid
sequenceDiagram
    participant API as /api/game/claim
    participant Email as /api/game/send-email
    participant MG as Mailgun

    API->>API: Claim thành công
    API->>Email: { to, name, amount, imageUrl }
    Email->>MG: POST messages REST API
    MG-->>Email: 200 OK
    Note over Email: Template HTML có thiệp nhúng
    Email-->>API: ok: true
    Note over API: Lỗi email KHÔNG block claim
```

---

📚 **Đọc tiếp:** [Kiến trúc hệ thống](architecture.md) · [Hướng dẫn Admin](admin-guide.md) · [Deployment](deployment.md)
