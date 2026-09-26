# Implementation Plan: Dynamic Database & Telegram Sync

## Architecture Overview
The platform shifts from build-time static page generation to Cloudflare Edge on-demand rendering backed by Cloudflare D1.

```
Telegram Admin Bot ──► /api/telegram (Webhook Edge) ──► Cloudflare D1 (epd-db)
                                                               │
Next.js Frontend (/) ◄─── getUpcomingSession() ───────────────┤
Next.js (/gallery)   ◄─── getGallery() ───────────────────────┤
Next.js (/posters)   ◄─── getPosters() ───────────────────────┤
Next.js (/register)  ◄─── /api/sessions (getSlots) ───────────┘
```

## Phases
1. **Database Layer Hardening:**
   - Define multi-environment D1 binding resolver supporting `process.env.DB`, `globalThis.DB`, and `epd_db`.
   - Update SQL write queries to include all metadata columns.
   - Wire atomic slot seat decrementing on successful registration.
2. **Dynamic Route Migration:**
   - Refactor `app/page.tsx`, `app/gallery/page.tsx`, and `app/posters/page.tsx` to async Server Components with `force-dynamic` and Edge runtime.
   - Replace static JSON imports with database calls.
   - Add cache-busting headers to `/api/sessions`.
3. **Cloudflare D1 Provisioning & Seeding:**
   - Create `epd-db` D1 database on Cloudflare.
   - Execute initial schema (`schema.sql`) and seed data (`seed.sql`).
   - Configure `wrangler.toml` with D1 binding.
4. **Verification & Testing:**
   - Verify TypeScript compliance (`tsc --noEmit`).
   - Validate Next.js build and route types (`npm run build`).
