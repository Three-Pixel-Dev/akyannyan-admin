# Akyannyan Admin — Frontend UI Implementation Guidelines for AI Agents

> **Mandatory Source of Truth**: All AI agents and developers implementing UI features in `akyannyan-admin` MUST follow the design patterns, design tokens, Burmese text copy, and component structures defined in [`reference/akn.tsx`](file:///home/square/Documents/freelance/akyn/reference/akn.tsx) and `akyannyan-admin/src/styles.css`.
>
> **Rule Maintenance & Scope Extension**: If a new feature introduces admin views, data tables, or management controls outside the current scope of this document, AI agents **MUST** update and extend this rule document (`frontend_rule.md`) with the new specifications before or during feature implementation.

---

## 1. Project & Architecture

- **Project**: `akyannyan-admin` (Web Admin Panel for Platform Management).
- **Stack**: React, Vite, TypeScript, Custom CSS (`src/styles.css`).
- **Root Directories**:
  - `src/components/`: Reusable UI components (`ui.tsx`, `Toast.tsx`).
  - `src/features/`: Feature modules (`auth/`, `member-levels/`, `users/`).
  - `src/data/`: Mock data & initial states (`mock.ts`).
  - `src/services/`: API client services (`auth.service.ts`).

---

## 2. Design System & Theme Tokens

### Color Palette Tokens (Matching `akn.tsx` & `src/styles.css`)

ALL Admin UI components MUST strictly use the following color variables:

| Token | Hex Code | Description / Usage |
| :--- | :--- | :--- |
| `--bg` | `#0B1410` | Main deep background |
| `--surface` | `#121F19` | Primary card & sidebar surface |
| `--surface2` | `#1A2E24` | Secondary surface / container hover background |
| `--line` | `#24382E` | Container borders & divider lines |
| `--jade` | `#3ECF74` | Primary brand green, active nav states, main buttons |
| `--jade-deep` | `#1F7A46` | Deep green gradient accents & badges |
| `--gold` | `#E8B54D` | Premium accent, points, vouchers, tier badges |
| `--ivory` | `#F2F5EC` | Primary text content |
| `--muted` | `#7E9488` | Secondary/de-emphasized text |
| `--danger` | `#E86A5D` | Error alerts, delete actions, sign out |

### Typography

- **Burmese Font Family**: `'Padauk', 'Noto Sans Myanmar', system-ui, sans-serif`

---

## 3. Layout Structure & UI Components

### 1. App Shell Architecture
- **Sidebar**: Brand logo mark (`LogoMark`), Navigation links with Burmese labels, Support card, Admin user info.
- **Topbar**: System status indicator (`● System Online`), Admin user avatar pill, Sign out button.
- **Main View Area**: Dynamic router switching views (`dashboard`, `member-levels`, `member-level-codes`, `users`, `content`, `oracle`, `settings`).

### 2. Standard Admin Components (`src/components/ui.tsx`)
- `PageHeader`: Title, description, and action button group (`Button variant="gold"`, `Button variant="jade"`).
- `Metric`: Metric card displaying icon, label, primary value, and details.
- `Card`: Theme-bordered container card (`.wide-card`, `.ritual-card`, `.quick-card`).
- `Button`: Button component supporting variants (`jade`, `gold`, `ghost`, `danger`).
- `Status`: Badge indicator supporting `tone="jade"` or `tone="gold"`.

---

## 4. Admin Feature Responsibilities

1. **Dashboard (`dashboard`)**: Overview metrics, user activity chart, daily ritual completion status, recent user list, quick action buttons.
2. **Member Levels (`member-levels`)**: View and configure subscription tiers (Free, Premium 1-Year, etc.).
3. **Member Level Codes (`member-level-codes`)**: Issue, track, filter, and redeem voucher codes (`AKN-XXXX-XXXX` for subscription tiers, `AKN-P-XXXX` for point top-ups).
4. **Users Management (`users`)**: Manage registered user accounts, birth profiles, and premium entitlement statuses.
5. **Content Management (`content`)**: Manage CMS articles, daily horoscope presets, prayers (ဂါထာ), and video embeds.
6. **Oracle Policy Management (`oracle`)**: System prompt configuration, daily question quota settings, context inclusion policies.

---

## 5. Step-by-Step AI Agent Workflow for Admin Features

When asked to implement or update an admin feature (e.g. "Add Points Voucher Code Generator"):

1. **Check Prototype Notes**: Inspect developer notes in `reference/akn.tsx` for backend code formats and admin requirements.
2. **Define Feature Module**: Add components under `src/features/<feature_name>/`.
3. **Add Navigation Route**: Update `View` type in `App.tsx` and add nav item to `nav` array.
4. **Use Standard Components**: Use `PageHeader`, `Card`, `Button`, `Status`, and `Metric` from `src/components/ui.tsx`.
5. **Use CSS Variables**: Style elements using `--bg`, `--surface`, `--line`, `--jade`, `--gold` defined in `styles.css`.
6. **Toast Feedback**: Provide user action feedback using `showToast(...)`.
