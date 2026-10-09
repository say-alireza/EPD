# Specification: Telegram Bot User Registration & Seat Reservation Flow

## Overview
Enable regular attendees (non-admins) of the EPD English Discussion Club to view upcoming session details, choose an available session slot, enter their contact info, and complete their seat reservation (including free or ZarinPal-paid admissions) directly through the Telegram bot `@EPDCommunityBot`.

## User Scenarios & Business Flows

### 1. Regular User Browses Session Details
- User sends `/start` to the bot.
- Bot distinguishes non-admin users from admins.
- Bot displays the upcoming session summary:
  - Session number, topic (EN & FA), date, time, venue, entry fee, and remaining seats.
- Bot presents a clean, persistent Reply Keyboard:
  - `«رزرو صندلی / ثبت‌نام»`
  - `«مشخصات نشست جاری»`
  - `«پشتیبانی و ارتباط با ما»`

### 2. Multi-Step Registration Flow
1. **Trigger:** User taps `«رزرو صندلی / ثبت‌نام»`.
   - Bot checks remaining capacity. If 0, informs user that seats are fully booked.
2. **Step 1 - Full Name:**
   - Bot prompts: «لطفاً نام و نام خانوادگی خود را وارد کنید:».
   - User types their full name.
3. **Step 2 - Mobile Number:**
   - Bot prompts for mobile with a Reply Keyboard offering `«ارسال شماره تماس»` or manual typing (`09...`).
   - Bot validates 11-digit Iranian mobile number format (`/^09\d{9}$/`).
4. **Step 3 - Slot Selection:**
   - Bot presents available session slots as Inline Buttons with remaining capacity (e.g. `سانس ۱۸:۰۰ تا ۱۹:۳۰ (۵ صندلی)`).
   - User taps a slot button.
5. **Step 4 - English Level:**
   - Bot presents inline options: `مبتدی` | `متوسط` | `پیشرفته`.
   - User taps their level.
6. **Step 5 - Completion & Payment:**
   - If Fee = 0:
     - Bot creates confirmed registration record in Cloudflare D1.
     - Decrements remaining seats for the slot/session.
     - Sends official ticket summary to the user with ticket ID.
     - Alerts admins via `notifyAdminsNewRegistration`.
   - If Fee > 0:
     - Bot requests ZarinPal transaction authority via `requestZarinpalPayment`.
     - Bot creates pending registration record in D1.
     - Sends inline button linking to Shaparak payment gateway (`StartPay`).
     - Upon payment callback, web/api verifies transaction, marks as `paid`, confirms seat, and notifies admins.

### 3. Cancellation
- At any point, user can type `/cancel` or tap `«لغو عملیات»` to abort registration and return to the main menu.

## Functional Requirements
- **FR-1:** Distinct `/start` handling for admins (management dashboard) vs public users (session preview & registration).
- **FR-2:** Multi-step state machine stored in Cloudflare D1 `bot_state` table.
- **FR-3:** Inline keyboards with callback queries for slot selection and English proficiency level.
- **FR-4:** Clean Persian typography with strict ZWNJ, no decorative emoji clutter, adhering to EPD design language.
- **FR-5:** Zero-downtime, edge-compatible logic running in Cloudflare Pages Functions.

## Success Criteria
- **SC-1:** Users can successfully complete a reservation end-to-end in under 45 seconds.
- **SC-2:** Capacity is immediately decremented and synchronized with the website and admin dashboard.
- **SC-3:** Automated tests verify all commands, callbacks, and edge cases with 0 errors.
- **SC-4:** TypeScript build (`tsc --noEmit`) passes cleanly with 0 errors.
