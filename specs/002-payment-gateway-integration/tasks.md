# Tasks: Dynamic Session Pricing & ZarinPal Gateway

- [ ] **T-1: Data Model & Types**
  - Add `feeTomans?: number` and `feeFa?: string` to `UpcomingSession` in `web/lib/types.ts`.
  - Add payment fields (`paymentStatus`, `paymentAuthority`, `paymentRefId`, `amountTomans`) to `RegistrationRecord`.
  - Update `web/data/next-session.json` with baseline fee (e.g. `50000`, `۵۰,۰۰۰ تومان`).

- [ ] **T-2: Telegram Bot Pricing Editor**
  - Add «ویرایش مبلغ ورودی» inline button (`edit_session_price`) to the session edit menu in `web/lib/telegram-bot.ts`.
  - Add `awaiting_session_price` step handler: parse number, format with half-spaces (`۵۰,۰۰۰ تومان`), update state and sync to GitHub via `syncSessionUpdateToGitHub`.

- [ ] **T-3: Frontend Pricing Badges**
  - Display the fee in `web/components/landing/upcoming-session-card.tsx`.
  - Display the fee and summary in `web/components/register/registration-form.tsx`.

- [ ] **T-4: ZarinPal Client Service**
  - Create `web/lib/zarinpal.ts` implementing `requestPayment` and `verifyPayment` against ZarinPal API v4 (`https://payment.zarinpal.com/pg/v4/`).
  - Use Merchant ID `0ab1f1f5-8a47-4eba-bd1b-70c9dff3cbd9`.

- [ ] **T-5: Registration Route Payment Flow**
  - Update `web/app/api/register/route.ts`:
    - If `feeTomans > 0`: request ZarinPal payment authority, store pending registration, return `{ paymentUrl }`.
    - If `feeTomans === 0`: proceed with instant free registration.

- [ ] **T-6: Payment Callback Route**
  - Create `web/app/api/payment/callback/route.ts`:
    - Handle `Authority` & `Status` from ZarinPal.
    - If OK: call `verifyPayment`, update registration in D1, decrement seats, notify admins, sync to Google Sheet, redirect to `/register/result?status=success`.
    - If NOK: redirect to `/register/result?status=failed`.

- [ ] **T-7: Payment Result Page**
  - Create `web/app/register/result/page.tsx` with clean responsive layout for success (RefID receipt) and failure (retry CTA).

- [ ] **T-8: Verification & Build**
  - Run `npm run build`, `npm run test` (`tsc --noEmit`), and `npm run lint`.
  - Commit and push to `main`.
