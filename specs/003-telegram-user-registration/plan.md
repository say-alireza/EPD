# Implementation Plan: Telegram Bot User Registration Flow

## Architecture
```
Telegram User ──► /api/telegram (grammY Bot Webhook on CF Pages)
                       │
                       ├─► State Machine (Cloudflare D1: bot_state)
                       ├─► Session & Slots Data (D1: upcoming_session, slots)
                       ├─► Insert Registration (D1: registrations)
                       └─► Payment Trigger (ZarinPal API v4) if Fee > 0
```

## Proposed Changes

### 1. `web/lib/telegram-bot.ts`
- Separate user main menu (`getUserMainMenuKeyboard()`) from admin keyboard (`getMainMenuKeyboard()`).
- Add user-facing message handler for:
  - `/start` when `!isAdmin(userId)`: show upcoming session information card and user menu.
  - `«مشخصات نشست جاری»`: display formatted session overview, venue, and remaining slots.
  - `«پشتیبانی و ارتباط با ما»`: display club info, channel link (`@EPDCommunity`), and support contacts.
  - `«رزرو صندلی / ثبت‌نام»`: initialize user registration flow in state `user_reg_name`.
- State machine transitions for registration:
  - `user_reg_name`: capture full name, validate min 3 chars, transition to `user_reg_mobile`.
  - `user_reg_mobile`: capture phone (via text or contact share), validate format (`09xxxxxxxxx`), transition to slot selection.
  - Slot selection (inline keyboard): callback `user_slot_{slotId}` -> saves selected slot, presents level inline keyboard.
  - Level selection (inline keyboard): callback `user_level_{level}` -> finalizes registration in D1 or generates ZarinPal payment link.
- Support `/cancel` and `«لغو عملیات»` at any step to reset state to null and return to user main menu.

### 2. Verification & Testing
- Create `web/test-user-registration.ts` (or `.mjs`):
  - Emulate full telegram update payloads for non-admin user.
  - Test `/start` -> Session details.
  - Test Registration trigger -> Name -> Mobile -> Slot selection -> Level selection.
  - Assert that registration record is created in D1 and seat count decreases.
  - Assert cancel flow works.
- Run `npm run test` / `tsc --noEmit` to ensure type safety.
