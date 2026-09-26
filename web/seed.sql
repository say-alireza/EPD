INSERT OR REPLACE INTO sessions (id, session_number, topic_en, topic_fa, date_iso, time_fa, time_en, venue_fa, venue_en, level_fa, remaining_seats, poster_image, is_active)
VALUES (
  'session-upcoming',
  13,
  'Upcoming Session Topic',
  'موضوع و محورهای گفت‌وگوی این هفته به زودی اعلام خواهد شد',
  '2026-08-27T10:00:00+03:30',
  '۱۰:۰۰ تا ۱۲:۰۰',
  '10:00 – 12:00',
  'مشهد، بلوار احمدآباد، کافه کتاب آفتاب',
  'Mashhad · Aftab Book Cafe',
  'متوسط و پیشرفته (B1+)',
  6,
  NULL,
  1
);
INSERT OR REPLACE INTO slots (id, session_id, title, capacity, remaining_seats, is_full)
VALUES ('session-1', 'session-upcoming', 'سانس اول: پنجشنبه ساعت ۱۶ تا ۱۸', 15, 6, 0);
INSERT OR REPLACE INTO slots (id, session_id, title, capacity, remaining_seats, is_full)
VALUES ('session-2', 'session-upcoming', 'سانس دوم: پنجشنبه ساعت ۱۸:۳۰ تا ۲۰:۳۰', 15, 3, 0);
INSERT OR REPLACE INTO slots (id, session_id, title, capacity, remaining_seats, is_full)
VALUES ('session-game', 'session-upcoming', 'سانس ویژه Game Night: سهشنبه ساعت ۱۸ تا ۲۰', 12, 8, 0);
INSERT OR REPLACE INTO gallery (id, session_number, image_url)
VALUES ('gallery-pop-culture-01', 12, '/media/gallery/gallery-pop-culture-01.jpg');
INSERT OR REPLACE INTO gallery (id, session_number, image_url)
VALUES ('gallery-pop-culture-02', 12, '/media/gallery/gallery-pop-culture-02.jpg');
INSERT OR REPLACE INTO gallery (id, session_number, image_url)
VALUES ('gallery-childhood-01', 10, '/media/gallery/gallery-childhood-01.jpg');
INSERT OR REPLACE INTO gallery (id, session_number, image_url)
VALUES ('gallery-childhood-02', 10, '/media/gallery/gallery-childhood-02.jpg');
INSERT OR REPLACE INTO gallery (id, session_number, image_url)
VALUES ('gallery-superstitions-01', 9, '/media/gallery/gallery-superstitions-01.jpg');
INSERT OR REPLACE INTO gallery (id, session_number, image_url)
VALUES ('gallery-superstitions-02', 9, '/media/gallery/gallery-superstitions-02.jpg');
INSERT OR REPLACE INTO gallery (id, session_number, image_url)
VALUES ('gallery-perfect-day-01', 7, '/media/gallery/gallery-perfect-day-01.jpg');
INSERT OR REPLACE INTO gallery (id, session_number, image_url)
VALUES ('gallery-perfect-day-02', 7, '/media/gallery/gallery-perfect-day-02.jpg');
INSERT OR REPLACE INTO gallery (id, session_number, image_url)
VALUES ('gallery-borrowed-opinions-01', 5, '/media/gallery/gallery-borrowed-opinions-01.jpg');
INSERT OR REPLACE INTO gallery (id, session_number, image_url)
VALUES ('gallery-people-everywhere-01', 4, '/media/gallery/gallery-people-everywhere-01.jpg');
INSERT OR REPLACE INTO gallery (id, session_number, image_url)
VALUES ('gallery-football-cult-01', 3, '/media/gallery/gallery-football-cult-01.jpg');
INSERT OR REPLACE INTO gallery (id, session_number, image_url)
VALUES ('gallery-dare-to-begin-01', 1, '/media/gallery/gallery-dare-to-begin-01.jpg');
INSERT OR REPLACE INTO gallery (id, session_number, image_url)
VALUES ('gallery-epd9-01', 9, '/media/gallery/gallery-epd9-01.jpg');
INSERT OR REPLACE INTO gallery (id, session_number, image_url)
VALUES ('gallery-epd9-02', 9, '/media/gallery/gallery-epd9-02.jpg');
INSERT OR REPLACE INTO gallery (id, session_number, image_url)
VALUES ('gallery-epd9-03', 9, '/media/gallery/gallery-epd9-03.jpg');
INSERT OR REPLACE INTO gallery (id, session_number, image_url)
VALUES ('gallery-epd9-04', 9, '/media/gallery/gallery-epd9-04.jpg');
INSERT OR REPLACE INTO gallery (id, session_number, image_url)
VALUES ('gallery-epd10-01', 10, '/media/gallery/gallery-epd10-01.jpg');
INSERT OR REPLACE INTO gallery (id, session_number, image_url)
VALUES ('gallery-epd10-02', 10, '/media/gallery/gallery-epd10-02.jpg');
INSERT OR REPLACE INTO gallery (id, session_number, image_url)
VALUES ('gallery-epd10-03', 10, '/media/gallery/gallery-epd10-03.jpg');
INSERT OR REPLACE INTO gallery (id, session_number, image_url)
VALUES ('gallery-epd10-04', 10, '/media/gallery/gallery-epd10-04.jpg');
INSERT OR REPLACE INTO gallery (id, session_number, image_url)
VALUES ('gallery-epd11-01', 11, '/media/gallery/gallery-epd11-01.jpg');
INSERT OR REPLACE INTO gallery (id, session_number, image_url)
VALUES ('gallery-epd11-02', 11, '/media/gallery/gallery-epd11-02.jpg');
INSERT OR REPLACE INTO posters (id, session_number, topic_en, date_fa, image_url)
VALUES ('poster-12', 12, 'Pop Culture', 'پنج‌شنبه ۲۲ مرداد ۱۴۰۵', '/media/posters/session-pop-culture.jpg');
INSERT OR REPLACE INTO posters (id, session_number, topic_en, date_fa, image_url)
VALUES ('poster-11', 11, 'EPD Quest for Victory', 'سه‌شنبه ۲۰ مرداد ۱۴۰۵', '/media/posters/session-game-night.jpg');
INSERT OR REPLACE INTO posters (id, session_number, topic_en, date_fa, image_url)
VALUES ('poster-10', 10, 'Childhood Memories', 'پنج‌شنبه ۱۵ مرداد ۱۴۰۵', '/media/posters/session-childhood-memories.jpg');
INSERT OR REPLACE INTO posters (id, session_number, topic_en, date_fa, image_url)
VALUES ('poster-9', 9, 'Superstitions', 'پنج‌شنبه ۸ مرداد ۱۴۰۵', '/media/posters/session-superstitions.jpg');
INSERT OR REPLACE INTO posters (id, session_number, topic_en, date_fa, image_url)
VALUES ('poster-8', 8, 'Green Flag', 'پنج‌شنبه ۱ مرداد ۱۴۰۵', '/media/posters/session-green-flag.jpg');
INSERT OR REPLACE INTO posters (id, session_number, topic_en, date_fa, image_url)
VALUES ('poster-7', 7, 'The Perfect Day', 'پنج‌شنبه ۲۵ تیر ۱۴۰۵', '/media/posters/session-perfect-day.jpg');
INSERT OR REPLACE INTO posters (id, session_number, topic_en, date_fa, image_url)
VALUES ('poster-6', 6, 'The Brand Called You', 'چهارشنبه ۱۷ تیر ۱۴۰۵', '/media/posters/session-brand-called-you.jpg');
INSERT OR REPLACE INTO posters (id, session_number, topic_en, date_fa, image_url)
VALUES ('poster-5', 5, 'Borrowed Opinions', 'پنج‌شنبه ۱۱ تیر ۱۴۰۵', '/media/posters/session-borrowed-opinions.jpg');
INSERT OR REPLACE INTO posters (id, session_number, topic_en, date_fa, image_url)
VALUES ('poster-4', 4, 'People Everywhere', 'سه‌شنبه ۲ تیر ۱۴۰۵', '/media/posters/session-people-everywhere.jpg');
INSERT OR REPLACE INTO posters (id, session_number, topic_en, date_fa, image_url)
VALUES ('poster-3', 3, 'Football, the Cult', 'پنج‌شنبه ۲۸ خرداد ۱۴۰۵', '/media/posters/session-football-cult.jpg');
INSERT OR REPLACE INTO posters (id, session_number, topic_en, date_fa, image_url)
VALUES ('poster-2', 2, 'Fame Game', 'پنج‌شنبه ۲۱ خرداد ۱۴۰۵', '/media/posters/session-fame-game.jpg');
INSERT OR REPLACE INTO posters (id, session_number, topic_en, date_fa, image_url)
VALUES ('poster-1', 1, 'Dare to Begin', 'پنج‌شنبه ۱۴ خرداد ۱۴۰۵', '/media/posters/session-dare-to-begin.jpg');