# Project Constitution: EPD Discussion Club & Community Platform

## Core Principles

### 1. Persian Typography & Clean Copy Standards
- **Typography:** All user-facing Persian text MUST strictly adhere to standard Persian typography rules, including correct use of zero-width non-joiner (نیمفاصله / ZWNJ).
- **No Emoji Clutter:** Strictly avoid emoji clutter, excessive decorative symbols, and robotic AI-slop in UI, copy, and bot interactions.
- **Design System:** Respect the established human-centered EPD design language (dark ground, amber/gold accents, teal highlights, sharp contrast, clear visual hierarchy).

### 2. Edge & Serverless Architecture
- **Runtime:** Built for Cloudflare Pages with Next.js Edge runtime and Cloudflare D1 (SQLite Edge).
- **Dynamic Content Delivery:** User-facing dynamic routes (`/`, `/gallery`, `/posters`, `/api/*`) MUST be server-rendered dynamically on demand (`force-dynamic`, `revalidate = 0`) to guarantee instant reflection of admin actions without requiring site rebuilds.
- **Reliable Fallbacks:** The data access layer MUST provide resilient in-memory fallbacks to maintain system availability during local development or offline states.

### 3. Data Integrity & Safe SQL
- **Single Source of Truth:** Cloudflare D1 acts as the authoritative persistent data store for sessions, time slots, registrations, posters, and gallery assets.
- **SQL Injection Prevention:** ALL SQL statements interacting with D1 MUST strictly use parameterized prepared statements (`.prepare(...).bind(...)`). String interpolation and concatenation in queries are prohibited.
- **Atomic Registration Flow:** Registrations must atomically record the applicant and adjust slot/session remaining capacities.

### 4. Admin Workflow & Telegram Automation
- **Real-Time Control:** The Telegram Bot serves as the primary administrative CMS for session details, time slots, capacity toggling, poster announcements, and gallery archiving.
- **Zero Build Coupling:** Changes made by community managers via the Telegram Bot must immediately appear on `epdcommunity.ir` upon reload.
- **Dual-Channel Notification:** Inbound registrations MUST instantly notify administrators via Telegram and sync to Google Sheets for redundancy.

### 5. Verification & Quality Gates
- **Executable Proof:** All proposed changes MUST pass strict typechecking (`tsc --noEmit`), build verification (`npm run build`), and linting before acceptance.
- **Regression Guard:** No change should break existing SEO meta tags, eNamad seal compliance (`referrerPolicy="origin"`, omit `noopener`/`noreferrer`), or responsive layouts.

## Governance
- Amendments to this constitution require a documented version bump and explicit rationale.
- All technical specifications, plans, and implementations in `specs/` must strictly conform to these core principles.
