# Akyannyan Admin — Points System & Features Implementation Plan

> **Reference Architecture**: Modeled after `monetizationmyanmar` (`ai-minions-admin` and `ai-minions-main-service` points architecture), adapted for Akyannyan Baydin & Astrology platform.

---

## 1. Overview & Business Requirements

In Akyannyan:
1. **Self-Readings**: Included with Premium membership / free daily quotas.
2. **External Person Readings**: Reading for saved persons (family, friends, partners) costs points.
3. **Advanced / Multi-Stage Readings**: Certain high-value features (e.g. detailed 3-card/5-card Tarot, multi-perspective BPZ analysis, full auspicious day calculations, pair compatibility) deduct points stage-by-stage.
4. **Top-up Vouchers**: Users can purchase points via Messenger and redeem single-use voucher codes (`AKN-P-XXXX`).

---

## 2. Points Engine Architecture (Referenced from `monetizationmyanmar`)

### A. Point Balances Model
Each user has two credit buckets and a reservation hold:
$$\text{Available Points} = \text{Package Credit Points} + \text{Topup Credit Points} - \text{Reserved Credit Points}$$

- **Package Credit Points**: Granted by monthly/yearly membership level.
- **Topup Credit Points**: Purchased via voucher codes (`AKN-P-XXXX`) or earned through merit streaks (SuBuu). Never expire.
- **Reserved Credit Points**: Temporarily locked while a reading/calculation stage is executing to prevent concurrent overspending.

### B. Stage-by-Stage Deduction Lifecycle
Following the 2-phase commit pattern from `monetizationmyanmar`:
1. **Stage 1 (Estimate & Reserve)**:
   - Before executing a stage (e.g. AI astrological generation or external person chart), calculate required points.
   - If $\text{Available Points} < \text{Cost}$, reject with `InsufficientPointsException` (prompts user to top up).
   - Lock user row and increment `reservedCreditPoints += cost`.
2. **Stage 2 (Commit Stage)**:
   - Upon successful stage completion, permanently deduct points (`packageCreditPoints` drained first, remainder from `topupCreditPoints`).
   - Decrement `reservedCreditPoints -= cost`.
   - Write an immutable row into `akn_point_transaction` with stage metadata.
3. **Stage 3 (Rollback / Failure)**:
   - If the stage fails or network drops, release `reservedCreditPoints -= cost` (or auto-refund if already committed).

---

## 3. Admin Modules to Implement in `akyannyan-admin`

### Module 1: Points Pricing & Stage Cost Config (`/points-configs`)
Allows admin to configure base point costs for every feature stage and external person queries:
- **Default Config Items**:
  - `YEARLY_CHART_EXTERNAL`: 20 points
  - `KP_HORARY_EXTERNAL`: 10 points
  - `DAY_PICK_EXTERNAL`: 10 points
  - `TRANSIT_EXTERNAL`: 15 points
  - `COMPATIBILITY_PAIR`: 10 points
  - `TAROT_SPREAD_3_CARD`: 5 points
  - `BPZ_DECISION_ANALYSIS`: 15 points
  - `AI_DEEP_REMEDY_STAGE`: 5 points
- **Fields**: Feature Key, Display Name, Cost (Points), Is Enabled, Minimum Tier Allowed.
- **UI**: Editable data table with instant status toggles and modal editor.

### Module 2: Top-up Voucher Codes (`/topup-codes`)
Mirrors `topup-codes` from `ai-minions-admin`:
- **Code Format**: `AKN-P-XXXX-XXXX` (prefixed with `AKN-P` to distinguish from Premium tier codes `AKN-XXXX-XXXX`).
- **Bulk Generation**:
  - Point Denominations: 50, 100, 200, 500 points.
  - Quantity (e.g., generate 50 codes).
  - Expiration date (optional).
  - Export to CSV/Clipboard for distribution over Facebook Messenger.
- **Table View**: Code, Points Value, Status (`ACTIVE`, `REDEEMED`, `EXPIRED`), Redeemed By User ID/Name, Redeemed At.

### Module 3: Points Ledger & Audit Trail (`/points-transactions`)
Audit every point deducted or awarded across all mobile features:
- Filter by: User ID / Email, Date Range, Transaction Type (`TOP_UP`, `STAGE_DEDUCT`, `REFUND`, `PROMOTION`, `MERIT_REWARD`).
- Displays: Transaction ID, Timestamp, User, Amount (+/- points), Feature/Stage Reference, Balance After.
- Manual Adjustment Action: Super-admin can credit or debit points with a mandatory reason note.

### Module 4: Baydin & Astrology CMS
- **Knowledge Base Management** (`/knowledge`):
  - Types: Gahtar (Pali audio prayer + text), Video (YouTube/FB embed), Article.
  - Target Day-sign filter (e.g., specific to Saturday-borns, or all).
  - Free vs Premium access flag.
- **Kan Su Buu Deeds Config** (`/su-buu`):
  - Configure available daily deeds (Chanting, Gratitude, Dana, Meditation) and weekly streak point bonuses.
- **Mahabote & Auspicious Calendar Rules** (`/astrology-rules`):
  - Deterministic tables for ရက်ရာဇာ၊ ပြဿဒါး၊ ရက်ယုတ်မာ per lunar month and weekday.

### Module 5: User Management Extension (`/users`)
- Add **Points & Wallet** column to Users table:
  - Total Points (`package` + `topup`).
  - Active Saved Persons count.
  - Quick button: "View Points Ledger" & "Add Top-up Points".

---

## 4. REST API Endpoints Required on Backend (`akyannyan-server`)

| Method | Path | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/admin/points/configs` | Get all stage point pricing configs | Admin |
| `PUT` | `/api/v1/admin/points/configs/{key}` | Update stage point pricing | Admin |
| `POST` | `/api/v1/admin/points/topup-codes/generate` | Bulk generate `AKN-P-` voucher codes | Admin |
| `GET` | `/api/v1/admin/points/topup-codes` | Paginated list of top-up codes | Admin |
| `GET` | `/api/v1/admin/points/transactions` | Global points ledger history | Admin |
| `POST` | `/api/v1/admin/points/adjust` | Manual point credit/debit for a user | Admin |
| `GET` | `/api/v1/points/wallet` | Get current user points & recent ledger | User / Mobile |
| `POST` | `/api/v1/points/topup` | Redeem voucher code `AKN-P-XXXX` | User / Mobile |
| `POST` | `/api/v1/points/reserve` | Reserve points for upcoming reading stage | User / Mobile |
| `POST` | `/api/v1/points/commit` | Commit stage points after success | User / Mobile |
| `POST` | `/api/v1/points/rollback` | Release reserved points on error | User / Mobile |
