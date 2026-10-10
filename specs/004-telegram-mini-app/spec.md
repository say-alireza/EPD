# Feature Specification: Telegram Mini App Registration (004-telegram-mini-app)

## Objective
Provide an ultra-fast, visually polished, mobile-optimized Telegram Mini App (`/miniapp`) for EPD Community members. Users opening the bot can launch the Mini App inside Telegram with one tap to inspect upcoming session details, select their preferred time slot and English fluency level, and complete registration or payment without manual re-entry of their Telegram profile info.

## User Experience & Flow
1. **Launch:**
   - User taps «رزرو صندلی (مینی‌اپ)» in `@EPDCommunityBot` or taps the Mini App web button in the welcome message.
   - The Mini App opens inside Telegram's native WebView, calling `Telegram.WebApp.ready()` and `Telegram.WebApp.expand()`.
2. **Auto-Population:**
   - The user's name (`first_name` + `last_name`) and Telegram username (`@username`) are automatically detected from `Telegram.WebApp.initDataUnsafe.user` and pre-filled.
3. **Session Overview Card:**
   - Displays the upcoming session number, topic, date/time, and venue.
4. **Slot & Level Selection:**
   - Dynamic slots retrieved live from `/api/sessions/` with real-time remaining seat counters.
   - English fluency level selector (مبتدی، متوسط، پیشرفته).
   - Phone number input with normalization.
5. **Haptic Feedback:**
   - Light haptic vibration on slot selection (`impactOccurred('light')`).
   - Success/error haptics on submission (`notificationOccurred('success' | 'error')`).
6. **Payment & Confirmation:**
   - Free session: immediate booking confirmation with ticket details.
   - Paid session: seamless redirection to ZarinPal gateway via `Telegram.WebApp.openLink` or payment flow.
