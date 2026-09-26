# Tasks: Telegram Bot & Website Live Sync

## Phase 1: Database & Runtime Architecture
- [x] Task 1.1: Provision Cloudflare D1 database `epd-db` (`9be8ec70-39f6-4330-b560-4f204b8b4d3a`).
- [x] Task 1.2: Execute `schema.sql` on remote D1 database to create `sessions`, `slots`, `registrations`, `posters`, `gallery`, and `bot_state` tables.
- [x] Task 1.3: Generate and execute `seed.sql` to populate initial session, slots, posters, and gallery archive into remote D1.
- [x] Task 1.4: Add `wrangler.toml` in both `web/` and project root configuring the `DB` D1 binding.

## Phase 2: Core Data Layer Optimization
- [x] Task 2.1: Enhance `getD1()` in `web/lib/db.ts` to support `globalThis.DB`, `process.env.DB`, and `epd_db`.
- [x] Task 2.2: Ensure `updateUpcomingSession` saves all fields (`time_en`, `venue_en`, `level_fa`, `remaining_seats`) with full conflict resolution.
- [x] Task 2.3: Upgrade `updateSlot` to perform dynamic parameterized updates regardless of in-memory index state.
- [x] Task 2.4: Add atomic slot decrementing in `addRegistration` to maintain real-time capacity count in D1.

## Phase 3: Frontend Dynamic Migration
- [x] Task 3.1: Convert `web/app/page.tsx` into an async Server Component with `runtime = "edge"` and `dynamic = "force-dynamic"`, calling `getUpcomingSession()`, `getGallery()`, and `getPosters()`.
- [x] Task 3.2: Convert `web/app/gallery/page.tsx` into an async Server Component with `runtime = "edge"` and `dynamic = "force-dynamic"`, reading from `getGallery()`.
- [x] Task 3.3: Convert `web/app/posters/page.tsx` into an async Server Component with `runtime = "edge"` and `dynamic = "force-dynamic"`, reading from `getPosters()`.
- [x] Task 3.4: Configure `/api/sessions` with `no-store` headers and Edge dynamic execution.

## Phase 4: Spec-Kit & Verification
- [x] Task 4.1: Establish `.specify/memory/constitution.md` with EPD core principles (Persian typography, zero-slop UI, D1 integrity).
- [x] Task 4.2: Create `.specify/feature.json` linking `specs/001-telegram-bot-integration`.
- [x] Task 4.3: Author `spec.md`, `plan.md`, `data-model.md`, and `checklists/requirements.md`.
- [x] Task 4.4: Execute `tsc --noEmit` and `npm run build` to verify route dynamism and zero compilation errors.
