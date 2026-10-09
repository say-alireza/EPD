# Implementation Tasks: Telegram Bot User Registration

- [x] Task 1: Update `.specify/feature.json` to link `specs/003-telegram-user-registration`
- [x] Task 2: Implement User Keyboards (`getUserMainMenuKeyboard`, `getUserCancelKeyboard`, `getSlotsInlineKeyboard`, `getLanguageLevelInlineKeyboard`) in `web/lib/telegram-bot.ts`
- [x] Task 3: Implement Non-Admin `/start`, «مشخصات نشست جاری», and «پشتیبانی و ارتباط با ما» handlers
- [x] Task 4: Implement Multi-Step Registration Conversation Flow:
  - Trigger: «رزرو صندلی / ثبت‌نام» -> prompt name
  - State `user_reg_name` -> validate & prompt mobile
  - State `user_reg_mobile` -> validate & display slots inline keyboard
  - Callback `user_slot_{id}` -> save slot selection & display language level inline keyboard
  - Callback `user_lvl_{level}` -> finalize reservation (free: D1 insert + notifications; paid: ZarinPal checkout link)
- [x] Task 5: Add Cancellation Handling (`/cancel` and «لغو عملیات») for user states
- [x] Task 6: Create automated test script `web/test-user-registration.ts` verifying end-to-end flow and assertions
- [x] Task 7: Run TypeScript verification (`tsc --noEmit`) and fix any lint/type errors
- [x] Task 8: Git commit and push changes
