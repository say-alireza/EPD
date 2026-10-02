# Implementation Plan: Dynamic Session Pricing & ZarinPal Gateway

## Architecture Flow

```
User (Browser)               Next.js Edge API               ZarinPal (Shaparak)
     │                               │                                │
     ├─── 1. POST /api/register ────►│                                │
     │    (Validated form data)      ├─── 2. Request Authority ──────►│
     │                               │    (Merchant ID + Fee)         │
     │                               │◄── 3. Return Authority ────────┤
     │◄── 4. Redirect paymentUrl ────┤                                │
     │                               │                                │
     ├─── 5. Redirect to StartPay ───────────────────────────────────►│
     │    (Card Credentials)         │                                │
     │                               │                                │
     │◄── 6. Redirect with Status ───┴────────────────────────────────┤
     ├─── 7. GET /api/payment/callback?Authority=...&Status=OK ──────►│
     │                               ├─── 8. Verify Transaction ─────►│
     │                               │◄── 9. Return RefID (Code 100) ─┤
     │                               ├─── 10. D1: status='paid'       │
     │                               ├─── 11. D1: decrement seat      │
     │                               ├─── 12. Telegram Admin Alert    │
     │                               ├─── 13. Sync Google Sheet       │
     │◄── 14. 302 /register/result ──┤                                │
     │    (Receipt with RefID)       │                                │
```

## Phases

### Phase 1: Dynamic Pricing Schema & Telegram Bot Admin
1. Add `feeTomans: number` and `feeFa: string` to `UpcomingSession` in `web/lib/types.ts` and `web/data/next-session.json`.
2. Update hero card and registration form UI to display the active entry fee.
3. Add `edit_session_price` callback and `awaiting_session_price` message handler to `web/lib/telegram-bot.ts`.
4. Ensure fee updates commit to GitHub via `web/lib/github-sync.ts`.

### Phase 2: ZarinPal Payment Service Layer
1. Create `web/lib/zarinpal.ts`:
   - `requestPayment({ amountTomans, description, callbackUrl, mobile, email })`
   - `verifyPayment({ authority, amountTomans })`
   - Configured with Merchant ID: `0ab1f1f5-8a47-4eba-bd1b-70c9dff3cbd9`
2. Update `/api/register/route.ts` to create pending registration and request payment authority.

### Phase 3: Callback Route & Verification
1. Create `web/app/api/payment/callback/route.ts`:
   - Validates `Authority` and `Status`.
   - On `Status === "OK"`: verifies with ZarinPal.
   - Updates registration record, decrements seats, notifies Telegram admins with `RefID`, appends to Google Sheet.
   - Redirects to `/register/result?status=success&refId={RefID}&sessionId={sessionId}`.
   - On cancellation/failure: redirects to `/register/result?status=failed`.

### Phase 4: Result Receipt Page & UI
1. Create `web/app/register/result/page.tsx`:
   - High-trust receipt displaying transaction tracking number (`کد پیگیری شاپرک / RefID`), session title, amount paid, and arrival instructions.
   - Error banner with retry option if payment was cancelled or declined.

### Phase 5: Verification & End-to-End Build
1. Test Next.js compilation, TypeScript (`tsc --noEmit`), and ESLint.
2. Confirm zero regressions on existing static pages and Telegram bot handlers.
