# Specification: Real-Time Telegram Bot & Website Data Synchronization

## Overview
Connect the administrative Telegram Bot with the Next.js frontend on Cloudflare Pages via Cloudflare D1, ensuring that updates to current sessions, time slots, posters, and gallery photos applied via Telegram reflect instantly on the live website.

## User Scenarios
1. **Admin updates session details:**
   - Admin sends `/start` to the Telegram bot, navigates to "مشخصات نشست جاری", and updates topic, session number, remaining seats, or venue.
   - When any user visits `epdcommunity.ir`, the new session details, poster, and remaining capacity are rendered immediately.
2. **Admin manages slots & capacity:**
   - Admin adds a new slot or modifies an existing slot (e.g. adjusts seats or closes a full slot).
   - In `/register`, the registration form queries `/api/sessions` and shows the latest available slots and real-time remaining seat counts.
3. **Admin uploads new gallery photos & posters:**
   - Admin submits poster images and gallery photos with session tags.
   - Both `/gallery` and `/posters` pages render the latest assets without requiring code rebuilds or git pushes.
4. **Member registers for an event:**
   - User completes the registration form on `/register`.
   - The system inserts the record into D1, decrements available seats in real time, sends an instant alert to admin Telegram accounts, and syncs with Google Sheets.

## Functional Requirements
- **FR-1:** All data-displaying frontend pages (`/`, `/gallery`, `/posters`) MUST fetch live data from the unified database layer (`lib/db.ts`) on demand using Next.js Edge runtime dynamic rendering (`force-dynamic`).
- **FR-2:** The administrative bot webhook (`/api/telegram`) MUST write directly to Cloudflare D1 with parameterized prepared statements.
- **FR-3:** Registration transactions MUST update both registration logs and decrement remaining slot capacities.
- **FR-4:** Resilient fallback data MUST be returned if the database connection encounters an edge transient error.

## Success Criteria
- **SC-1:** Changes submitted via the Telegram bot appear on `epdcommunity.ir` upon browser page reload in under 1 second.
- **SC-2:** Zero requirement for git commits or Cloudflare Pages redeployments to update content.
- **SC-3:** Build passes cleanly with all dynamic routes typed as `ƒ (Dynamic)` server-rendered on demand.
