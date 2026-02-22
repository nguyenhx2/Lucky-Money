# システムフロー — Lucky Money

🌐 **言語 / Language / Ngôn ngữ:** [🇻🇳 Tiếng Việt](../../docs/system-flow.md) · [🇬🇧 English](../en/system-flow.md) · 🇯🇵 日本語

📚 **他のドキュメント:** [管理者ガイド](admin-guide.md) · [ユーザーガイド](user-guide.md)

---

## 封筒クレームフロー（レースセーフ）

> [!IMPORTANT]
> **レースセーフ**機能により、2人のユーザーが同時に同じ封筒をタップしても、どちらかのみがクレームできます。PostgreSQLの`SERIALIZABLE`分離レベルと`SELECT ... FOR UPDATE`がロック機構です。

```mermaid
sequenceDiagram
    participant U as ユーザーブラウザ
    participant API as /api/game/claim
    participant DB as PostgreSQL

    U->>API: POST { envelopeId }
    Note over U: 楽観的UI: 封筒を即座に非表示
    API->>DB: BEGIN SERIALIZABLE TRANSACTION
    DB->>API: SELECT envelope FOR UPDATE
    alt 封筒は開封済み - isOpened = true
        API-->>U: 409 ALREADY_OPENED
        Note over U: UI戻す - トースト表示 - 別の封筒を選択
    else 封筒は未開封
        API->>DB: UPDATE SET isOpened=true, claimedBy=...
        DB->>API: OK
        API->>DB: COMMIT
        API-->>U: 200 { amount, wish, thiepUrl, hasBonusRound, hasRetryAvailable }
        Note over U: ResultModal表示
    end
```

---

## 追加ターンフロー（リトライグラント）

> [!NOTE]
> 管理者が手動で付与するか、`retryPercent`に基づいて自動付与されると、ユーザーは通常の抽選後に**追加の封筒選択**ができます。

```mermaid
sequenceDiagram
    participant Admin as Admin Panel
    participant DB as PostgreSQL
    participant U as ユーザー

    Admin->>DB: POST /api/game/retry { userEmail }
    Note over DB: RetryGrant INSERT - 重複はユニーク制約でブロック
    DB-->>Admin: 201 OK または 409 既に付与済み

    U->>DB: POST /api/game/claim - 通常クレーム
    DB-->>U: 200 { hasRetryAvailable: true }
    Note over U: ResultModalに追加ターンボタン表示
    U->>DB: リトライグラントを使用
    DB->>DB: UPDATE RetryGrant SET used=true
    DB-->>U: EnvelopeGridに戻り追加選択可能
```

---

📚 **次を読む:** [管理者ガイド](admin-guide.md) · [ユーザーガイド](user-guide.md)
