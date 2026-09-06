-- Cloudflare D1 Schema for EPD Discussion Club

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  session_number INTEGER,
  topic_en TEXT,
  topic_fa TEXT,
  date_iso TEXT,
  time_fa TEXT,
  time_en TEXT,
  venue_fa TEXT,
  venue_en TEXT,
  level_fa TEXT,
  remaining_seats INTEGER,
  poster_image TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS slots (
  id TEXT PRIMARY KEY,
  session_id TEXT,
  title TEXT,
  capacity INTEGER,
  remaining_seats INTEGER,
  is_full INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS registrations (
  id TEXT PRIMARY KEY,
  full_name TEXT,
  mobile TEXT,
  email TEXT,
  session_id TEXT,
  language_level TEXT,
  first_time INTEGER DEFAULT 0,
  topic_suggestion TEXT,
  referral_code TEXT,
  heard_from TEXT,
  social_handle TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS posters (
  id TEXT PRIMARY KEY,
  session_number INTEGER,
  topic_en TEXT,
  date_fa TEXT,
  image_url TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gallery (
  id TEXT PRIMARY KEY,
  session_number INTEGER,
  image_url TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
