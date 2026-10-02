# Specification: Dynamic Session Pricing & ZarinPal Payment Gateway Integration

## Overview
Enable administrative Telegram bot control over the upcoming session entry fee (مبلغ ورودی جلسه) and integrate ZarinPal Payment Gateway (درگاه پرداخت شاپرکی زرین‌پال) into the event registration flow on `epdcommunity.ir`.

## User Scenarios & Business Flows

### 1. Admin Updates Session Fee via Telegram Bot
- Admin opens `/start` in the Telegram bot and selects «ویرایش مشخصات نشست جاری».
- Admin taps «ویرایش مبلغ ورودی» (`edit_session_price`).
- Bot prompts for the new fee in Tomans (e.g. `۵۰۰۰۰` or `100000`).
- Bot validates the numeric input, updates `data/next-session.json`, and commits the change directly to GitHub via GitHub REST API.
- Live website (`/` and `/register`) instantly reflects the updated fee across hero badges, session details, and the checkout step.

### 2. User Registers and Completes Payment
- User visits `epdcommunity.ir/register` and fills in the required fields (نام، شماره تماس، ایمیل، سطح زبان).
- The form displays the active session fee (مثلاً ۵۰,۰۰۰ تومان).
- User submits the form.
- The system validates inputs, records a pending registration record, and requests a payment transaction authority from ZarinPal API v4.
- User is automatically redirected to the secure Shaparak payment portal (`https://payment.zarinpal.com/pg/StartPay/{Authority}`).
- User enters bank card credentials and pays.
- Shaparak redirects back to the verification handler (`/api/payment/callback`).
- System verifies transaction with ZarinPal (`payment/verify.json`), marks registration as `paid`, stores the `refId`, decrements the remaining seat count, alerts admins via Telegram bot, and appends the record to Google Sheets.
- User lands on `/register/result?status=success&refId={refId}` displaying their official tracking code and session details.

### 3. User Cancels Payment or Bank Transaction Fails
- If the user cancels on the bank portal or the transaction encounters a banking error:
- ZarinPal redirects with `Status=NOK`.
- The system marks the transaction as failed/unpaid, does not deduct remaining seats, and redirects to `/register/result?status=failed`.
- The user is presented with a clear message and a button to retry registration without losing form context.

## Functional Requirements

- **FR-1 (Dynamic Pricing):** `data/next-session.json` and `lib/types.ts` MUST include `feeTomans` (integer, e.g. 50000) and `feeFa` (formatted Persian text, e.g. `۵۰,۰۰۰ تومان`). If fee is 0, the session is treated as free/رایگان.
- **FR-2 (Bot Fee Management):** Telegram bot admin menu MUST provide an interactive callback `edit_session_price` and state `awaiting_session_price` that validates and commits changes to GitHub.
- **FR-3 (ZarinPal Request):** `/api/register` MUST call ZarinPal v4 `payment/request.json` using Merchant ID `0ab1f1f5-8a47-4eba-bd1b-70c9dff3cbd9` with callback URL pointing to `https://epdcommunity.ir/api/payment/callback`.
- **FR-4 (ZarinPal Verification):** Callback route MUST verify `Authority` and `amount` against ZarinPal v4 `payment/verify.json` before confirming seats or notifying admins.
- **FR-5 (Result Presentation):** Route `/register/result` MUST render full receipt metadata (RefID, session title, date, amount, user name) on success, or user-friendly troubleshooting guidance on failure.
- **FR-6 (Security & Idempotency):** Duplicate callback triggers for an already-verified authority MUST be prevented, and amounts sent to ZarinPal MUST strictly match the session's server-side fee (never client-tamperable).

## Key Entities & Data Schema

### UpcomingSession Addition
```typescript
feeTomans: number; // e.g. 50000
feeFa: string;     // e.g. "۵۰,۰۰۰ تومان"
```

### RegistrationRecord Payment Fields
```typescript
paymentStatus: "free" | "pending" | "paid" | "failed";
paymentAuthority?: string;
paymentRefId?: string;
amountTomans: number;
paidAt?: string;
```

## Success Criteria

- **SC-1:** Admins can adjust the fee via Telegram in under 30 seconds, updating the live site without code deployments.
- **SC-2:** Users submitting the registration form are seamlessly routed to Shaparak and back.
- **SC-3:** Verified payments receive a valid Shaparak RefID displayed on the confirmation receipt.
- **SC-4:** Failed or cancelled attempts do not leak seats or trigger admin notifications.
- **SC-5:** Full build, TypeScript checks, and ESLint pass with 0 errors.
