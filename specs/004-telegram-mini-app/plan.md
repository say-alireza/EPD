# Architecture & Implementation Plan: Telegram Mini App (004-telegram-mini-app)

## Architecture Overview
```
Telegram Client (Mobile / Desktop)
   │
   ├─► [User Keyboard / Inline Button] ──► Telegram WebView (Mini App)
   │                                          │
   │                                          ▼
   │                                   /miniapp (Next.js)
   │                                   ├── telegram-web-app.js SDK
   │                                   ├── Extract initDataUnsafe.user
   │                                   ├── GET /api/upcoming & /api/sessions
   │                                   └── POST /api/register
   │                                          │
   │                                          ▼
   └─► Chat Flow (Fallback) ──────────► /api/telegram (grammY Bot Webhook)
                                              │
                                              ▼
                                      Cloudflare D1 Database
```

## Key Components
1. **Telegram SDK Hook / Helper (`web/lib/telegram-webapp.ts`):**
   - Safe access to `window.Telegram?.WebApp`.
   - Methods: `initMiniApp()`, `getUser()`, `haptic(type)`, `openExternalLink(url)`, `closeApp()`.
2. **Mini App Page (`web/app/miniapp/page.tsx`):**
   - Clean, dark-mode compatible, brand-compliant UI (EPD Navy `#1F2B5B`, Teal, Vazirmatn font).
   - Fast loading without desktop header, hero background slop, or footer noise.
   - Session info pill, slot cards, fluency buttons, mobile input, submit action.
3. **Bot Integration (`web/lib/telegram-bot.ts`):**
   - Add `webApp` button to user keyboard in `getUserMainMenuKeyboard()`.
   - Add inline `web_app` button to `/start` message.
   - Keep full text conversation fallback intact.
4. **Verification & Tests:**
   - Update `web/test-user-registration.ts` to assert `web_app` button presence.
   - Run Next.js build and TypeScript type-check.
