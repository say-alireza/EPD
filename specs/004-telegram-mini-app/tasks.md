# Task Checklist: Telegram Mini App (004-telegram-mini-app)

- [x] 1. Initialize feature in Spec-Kit (`.specify/feature.json`).
- [x] 2. Create Telegram WebApp SDK helper (`web/lib/telegram-webapp.ts`) for safe client-side interaction.
- [x] 3. Create responsive, brand-aligned Mini App page (`web/app/miniapp/page.tsx`).
- [x] 4. Connect Mini App to `/api/upcoming`, `/api/sessions`, and `/api/register`.
- [x] 5. Wire Mini App button in `@EPDCommunityBot` (`getUserMainMenuKeyboard` & `/start` message).
- [x] 6. Update bot automated tests in `web/test-user-registration.ts` to verify `web_app` button configuration.
- [x] 7. Execute tests and verify type-safety with `tsc --noEmit` and `next build`.
