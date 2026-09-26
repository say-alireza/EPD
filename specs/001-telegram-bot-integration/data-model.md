# Data Model: EPD Community Platform (Cloudflare D1)

## Schema Overview

### 1. `sessions`
Stores upcoming and past session details.
- `id` (TEXT, PK): Unique session identifier (e.g. `session-upcoming`)
- `session_number` (INTEGER): Sequential session count (e.g. 13)
- `topic_en` (TEXT): English topic header
- `topic_fa` (TEXT): Persian topic description
- `date_iso` (TEXT): ISO 8601 timestamp of the session date
- `time_fa` (TEXT): Persian formatted time (e.g. `۱۰:۰۰ تا ۱۲:۰۰`)
- `time_en` (TEXT): English formatted time
- `venue_fa` (TEXT): Persian venue address
- `venue_en` (TEXT): English venue address
- `level_fa` (TEXT): Recommended Persian level
- `remaining_seats` (INTEGER): Seats available for current session
- `poster_image` (TEXT): Relative path or external URL to the poster
- `is_active` (INTEGER): 1 for active upcoming session, 0 otherwise
- `created_at` (TEXT): SQLite timestamp

### 2. `slots`
Time slots and breakout capacities available for registration.
- `id` (TEXT, PK): Unique slot identifier (e.g. `session-1`)
- `session_id` (TEXT): References `sessions.id`
- `title` (TEXT): Display title (e.g. `سانس اول: پنجشنبه ساعت ۱۶ تا ۱۸`)
- `capacity` (INTEGER): Total seat capacity
- `remaining_seats` (INTEGER): Available seats
- `is_full` (INTEGER): 1 if full, 0 if open
- `created_at` (TEXT): SQLite timestamp

### 3. `registrations`
User registration submissions.
- `id` (TEXT, PK): Unique registration ID
- `full_name` (TEXT): Applicant's full name
- `mobile` (TEXT): Contact phone number
- `email` (TEXT): Email address
- `session_id` (TEXT): Selected slot ID
- `language_level` (TEXT): Self-reported language level
- `first_time` (INTEGER): 1 if first session, 0 if returning
- `topic_suggestion` (TEXT): Optional topic recommendation
- `referral_code` (TEXT): Optional referral code
- `heard_from` (TEXT): Marketing source
- `social_handle` (TEXT): Instagram or Telegram handle
- `created_at` (TEXT): SQLite timestamp

### 4. `posters`
Archive of weekly event posters.
- `id` (TEXT, PK): Unique poster identifier
- `session_number` (INTEGER): Session number
- `topic_en` (TEXT): English topic
- `date_fa` (TEXT): Persian date string
- `image_url` (TEXT): Poster image path
- `created_at` (TEXT): SQLite timestamp

### 5. `gallery`
Photo archive from past sessions.
- `id` (TEXT, PK): Unique photo identifier
- `session_number` (INTEGER): Session number
- `image_url` (TEXT): Image asset path
- `created_at` (TEXT): SQLite timestamp

### 6. `bot_state`
Persistent conversational wizard state for multi-turn bot steps.
- `user_id` (INTEGER, PK): Telegram user ID
- `state_json` (TEXT): Serialized step and form payload
- `updated_at` (TEXT): Timestamp
