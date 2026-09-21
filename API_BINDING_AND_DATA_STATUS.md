# A Kyan Nyan (အကြံဉာဏ်) Admin — Data & API Binding Status

> **Current Audit Date**: September 2026  
> **Admin Codebase**: `akyannyan-admin` (Vite + React + TypeScript)  
> **Backend Codebase**: `akyannyan-server` (Spring Boot, Port 8080)  
> **Design System**: Padauk font, dark emerald theme (`#0B1410`, `#121F19`, `#3ECF74`, `#E8B54D`)

---

## 1. At a Glance Summary Table

| Module / View | View File Path | Status | Connected Endpoint(s) | Backend Controller | Data Description |
| :--- | :--- | :---: | :--- | :--- | :--- |
| **Dashboard** | `src/App.tsx` (Dashboard component) | ⚪ **MOCK** | *None* | *N/A* | Hardcoded metrics (users, Oracle questions, Premium conversion, ကံစုဘူး). Weekly activity bar chart and recent users list from `data/mock.ts`. |
| **Member Levels** | `src/features/member-levels/MemberLevelsView.tsx` | 🟢 **API BIND DONE** | `GET /api/v1/member-levels`<br>`POST /api/v1/member-levels`<br>`PUT /api/v1/member-levels/{id}`<br>`DELETE /api/v1/member-levels/{id}` | `MemberLevelController` | Full CRUD for membership tiers (name, price, duration, features). Live pagination. |
| **Member Level Codes** | `src/features/member-levels/MemberLevelCodesView.tsx` | 🟢 **API BIND DONE** | `GET /api/v1/member-levels-code`<br>`POST /api/v1/member-levels-code/generate`<br>`PUT /api/v1/member-levels-code/{id}`<br>`DELETE /api/v1/member-levels-code/{id}` | `MemberLevelsCodeController` | Bulk code generation (AKN-XXXX), code status tracking (ACTIVE/REDEEMED/EXPIRED), CSV export, edit & delete. |
| **Points Configs** | `src/features/points/PointsConfigsView.tsx` | 🟢 **API BIND DONE** | `GET /api/v1/admin/points/configs`<br>`PUT /api/v1/admin/points/configs/{key}` | `AdminPointsController` | Point pricing per feature stage (KP_HORARY, TAROT_SPREAD, etc.). Editable data table with instant toggle. Mock fallback if backend unreachable. |
| **Top-up Codes** | `src/features/points/TopupCodesView.tsx` | 🟢 **API BIND DONE** | `GET /api/v1/admin/points/topup-codes`<br>`POST /api/v1/admin/points/topup-codes/generate` | `AdminPointsController` | Bulk AKN-P-XXXX voucher code generation (50/100/200/500 pts), status filter, copy-to-clipboard, CSV export. Mock fallback. |
| **Points Ledger** | `src/features/points/PointsLedgerView.tsx` | 🟢 **API BIND DONE** | `GET /api/v1/admin/points/transactions`<br>`POST /api/v1/admin/points/adjust` | `AdminPointsController` | Global points audit trail. Filter by user/date/type. Manual adjustment modal for super-admin credit/debit. Mock fallback. |
| **Users** | `src/features/users/UsersView.tsx` | 🟢 **API BIND DONE** | `GET /api/users/pageable`<br>`POST /api/users/create-with-login-code`<br>`POST /api/users/create-bulk-with-login-code`<br>`DELETE /api/users/{id}` | `UsersController` | Paginated user table with search, level filter, role filter. Single & bulk user creation with login codes. View details & delete modals. Mock fallback. |
| **Content (CMS)** | `src/features/content/ContentView.tsx` | ⚪ **MOCK** | *None yet*<br>*(Target: `/api/v1/admin/content/**`)* | *Entity & Model ready*<br>*No Controller/Service yet* | 12 mock Burmese content items (ဂါထာ, articles, videos, audio). Type filter tabs, day-sign filter, search, publish toggle, create/edit modal. Ready for API binding. |
| **ကံစုဘူး** | `src/features/merit/MeritView.tsx` | 🟢 **API BIND DONE** | `GET/PUT /api/v1/admin/merit/months/{year}/{month}`<br>`POST .../publish`<br>`POST .../copy-from` | `AdminMeritController` | Week switchboard: toggle ဂါထာ / Tarot / မှတ်တမ်း (points only; no admin text). Honor habits still have label/glyph. ဂါထာ links to CMS morning gahtar. |
| **Oracle** | `src/features/oracle/OracleView.tsx` | 🟡 **HYBRID** | *No persistence endpoint yet* | `AkyannyanOracleConversation`<br>*(Entity ready)* | 4 template cards (System Prompt, Daily Quota, Safety Policy, Tarot Prompt). Template editor modal with model/temperature/maxTokens config. Local state only — no backend save. |
| **Settings** | `src/features/settings/SettingsView.tsx` | ⚪ **MOCK** | *None yet*<br>*(Target: `/api/v1/admin/settings/**`)* | *No Controller yet* | 4-tab settings panel: System (server health), Astrology (Mahabote, KP, Calendar), Notifications (Messenger, push cron), Quotas (Oracle limits, maintenance). All mock-editable. |

---

## 2. Detailed Breakdown by Status

### 🟢 Fully Integrated APIs (Production Ready)

#### A. Member Levels & Codes
- **Files**: `MemberLevelsView.tsx`, `MemberLevelCodesView.tsx`, `services/member-levels.service.ts`
- **Connected Endpoints**: Full CRUD on `/api/v1/member-levels` and `/api/v1/member-levels-code`
- **Features**: Live pagination, bulk code generation, status tracking, edit/delete modals, CSV export

#### B. Points Economy (Configs + Top-up + Ledger)
- **Files**: `PointsConfigsView.tsx`, `TopupCodesView.tsx`, `PointsLedgerView.tsx`, `services/points.service.ts`
- **Connected Endpoints**: `/api/v1/admin/points/configs`, `/api/v1/admin/points/topup-codes`, `/api/v1/admin/points/transactions`, `/api/v1/admin/points/adjust`
- **Failover**: All three views degrade gracefully to empty state if backend is unreachable

#### C. Users Management
- **Files**: `UsersView.tsx`, `services/users.service.ts`
- **Connected Endpoints**: `/api/users/pageable`, `/api/users/create-with-login-code`, `/api/users/create-bulk-with-login-code`, `/api/users/{id}`
- **Features**: Single & bulk user creation with auto-generated login codes, member level assignment, view details, delete confirmation

#### D. ကံစုဘူး month program
- **Files**: `MeritView.tsx`, `services/merit.service.ts`
- **Connected Endpoints**: `GET/PUT /api/v1/admin/merit/months/{year}/{month}`, `POST .../publish`, `POST .../copy-from`
- **Features**: Year/month picker, 4 or 5 Monday–Sunday columns, activity toggles (RITUAL/TAROT/JOURNAL points only), honor habit label/glyph, draft save, publish, duplicate previous month

---

### 🟡 Hybrid (Partial API / Local State)

#### A. Oracle Template Editor
- **Files**: `OracleView.tsx`
- **State**: Templates are managed in local React state. No backend persistence endpoint exists yet.
- **Pending Backend**: `POST/PUT /api/v1/admin/oracle/templates` for saving template configs to database.

---

### ⚪ Mock Data Only (Backend Endpoints Pending)

#### A. Dashboard Metrics
- **Files**: `App.tsx` (Dashboard component), `data/mock.ts`
- **Mock Data**: Hardcoded user count (2,481), Oracle questions (8,429), Premium users (634), ကံစုဘူး completion (74%)
- **Pending Backend**: Aggregation/analytics endpoint like `GET /api/v1/admin/dashboard/stats`

#### B. Content Management (CMS)
- **Files**: `features/content/ContentView.tsx`
- **Mock Data**: 12 realistic Burmese content items covering ဂါထာ (prayers), ဆောင်းပါး (articles), ဗီဒီယို (videos), and အသံ (audio)
- **Pending Backend**: `GET/POST/PUT/DELETE /api/v1/admin/content/**` — Backend has `entity` and `model` directories but no controller/service yet

#### C. Settings Panel
- **Files**: `features/settings/SettingsView.tsx`
- **Mock Data**: System health, astrology algorithm configs, notification settings, quota limits — all editable but not persisted
- **Pending Backend**: `GET/PUT /api/v1/admin/settings/**` — No backend endpoint yet

---

## 3. Authentication

| Feature | Status | Details |
| :--- | :---: | :--- |
| Admin Login | 🟢 **API BIND DONE** | `POST /api/auth/login` with JWT token storage |
| Session Verification | 🟢 **API BIND DONE** | `GET /api/auth/me` for role verification |
| Auto-Logout on 401 | 🟢 **API BIND DONE** | `apiClient` interceptor removes token and dispatches `auth-change` event |
