import { Session, UpcomingSession, PosterItem, GalleryItem, RegistrationRecord } from "./types";
import defaultNextSession from "@/data/next-session.json";
import defaultGallery from "@/data/gallery.json";
import defaultPosters from "@/data/posters.json";

// In-memory cache for fallback when running locally or before D1 is provisioned
let memoryUpcomingSession: UpcomingSession = {
  id: defaultNextSession.id || "session-upcoming",
  number: defaultNextSession.number || 13,
  dateIso: defaultNextSession.dateIso || new Date().toISOString(),
  timeFa: defaultNextSession.timeFa || "۱۰:۰۰ تا ۱۲:۰۰",
  timeEn: defaultNextSession.timeEn || "10:00 – 12:00",
  venueFa: defaultNextSession.venueFa || "مشهد، بلوار احمدآباد، کافه کتاب آفتاب",
  venueEn: defaultNextSession.venueEn || "Mashhad · Aftab Book Cafe",
  levelFa: defaultNextSession.levelFa || "متوسط و پیشرفته (B1+)",
  remainingSeats: defaultNextSession.remainingSeats ?? 6,
  topicEn: defaultNextSession.topicEn || "Upcoming Session",
  topicFa: defaultNextSession.topicFa || "موضوع جلسه به زودی اعلام میشود",
  posterImage: defaultNextSession.posterImage || null,
};

const memorySlots: Session[] = [
  {
    id: "session-1",
    title: "سانس اول: پنجشنبه ساعت ۱۶ تا ۱۸",
    capacity: 15,
    remainingSeats: 6,
    isFull: false,
  },
  {
    id: "session-2",
    title: "سانس دوم: پنجشنبه ساعت ۱۸:۳۰ تا ۲۰:۳۰",
    capacity: 15,
    remainingSeats: 3,
    isFull: false,
  },
  {
    id: "session-game",
    title: "سانس ویژه Game Night: سهشنبه ساعت ۱۸ تا ۲۰",
    capacity: 12,
    remainingSeats: 8,
    isFull: false,
  },
];

const memoryRegistrations: RegistrationRecord[] = [];
const memoryPosters: PosterItem[] = [...(defaultPosters as PosterItem[])];
const memoryGallery: GalleryItem[] = [...(defaultGallery as GalleryItem[])];

// Bot conversation state store
const memoryBotState = new Map<number, { step: string; data: Record<string, unknown> }>();

interface D1PreparedStatementLike {
  bind(...values: unknown[]): D1PreparedStatementLike;
  first<T = Record<string, unknown>>(colName?: string): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<{ results?: T[] }>;
  run(): Promise<{ success: boolean; meta?: unknown }>;
}

interface D1DatabaseLike {
  prepare(query: string): D1PreparedStatementLike;
}

interface GlobalWithD1 {
  DB?: D1DatabaseLike;
  epd_db?: D1DatabaseLike;
  __env__?: {
    DB?: D1DatabaseLike;
    epd_db?: D1DatabaseLike;
  };
}

function getD1(): D1DatabaseLike | null {
  try {
    const g = globalThis as unknown as GlobalWithD1;
    if (g.DB && typeof g.DB.prepare === "function") {
      return g.DB;
    }
    if (g.epd_db && typeof g.epd_db.prepare === "function") {
      return g.epd_db;
    }
    const env = process.env as unknown as { DB?: D1DatabaseLike; epd_db?: D1DatabaseLike };
    if (env && env.DB && typeof env.DB.prepare === "function") {
      return env.DB;
    }
    if (env && env.epd_db && typeof env.epd_db.prepare === "function") {
      return env.epd_db;
    }
    if (g.__env__?.DB && typeof g.__env__.DB.prepare === "function") {
      return g.__env__.DB;
    }
    if (g.__env__?.epd_db && typeof g.__env__.epd_db.prepare === "function") {
      return g.__env__.epd_db;
    }
  } catch {
    // fallback
  }
  return null;
}

// ---------------------------------------------
// SESSIONS & SLOTS
// ---------------------------------------------
export async function getUpcomingSession(): Promise<UpcomingSession> {
  const d1 = getD1();
  if (d1) {
    try {
      const row = await d1
        .prepare("SELECT * FROM sessions WHERE is_active = 1 ORDER BY created_at DESC LIMIT 1")
        .first();
      if (row) {
        return {
          id: String(row.id),
          number: Number(row.session_number),
          dateIso: String(row.date_iso),
          timeFa: String(row.time_fa),
          timeEn: row.time_en ? String(row.time_en) : undefined,
          venueFa: String(row.venue_fa),
          venueEn: row.venue_en ? String(row.venue_en) : undefined,
          levelFa: String(row.level_fa),
          remainingSeats: Number(row.remaining_seats),
          topicEn: String(row.topic_en),
          topicFa: String(row.topic_fa),
          posterImage: row.poster_image ? String(row.poster_image) : null,
        };
      }
    } catch (e) {
      console.error("D1 getUpcomingSession error:", e);
    }
  }
  return memoryUpcomingSession;
}

export async function updateUpcomingSession(data: Partial<UpcomingSession>): Promise<UpcomingSession> {
  memoryUpcomingSession = { ...memoryUpcomingSession, ...data };
  const d1 = getD1();
  if (d1) {
    try {
      const current = await getUpcomingSession();
      const s = { ...current, ...data };
      await d1
        .prepare(
          `INSERT INTO sessions (id, session_number, topic_en, topic_fa, date_iso, time_fa, time_en, venue_fa, venue_en, level_fa, remaining_seats, poster_image, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
           ON CONFLICT(id) DO UPDATE SET
             session_number=excluded.session_number,
             topic_en=excluded.topic_en,
             topic_fa=excluded.topic_fa,
             date_iso=excluded.date_iso,
             time_fa=excluded.time_fa,
             time_en=excluded.time_en,
             venue_fa=excluded.venue_fa,
             venue_en=excluded.venue_en,
             level_fa=excluded.level_fa,
             remaining_seats=excluded.remaining_seats,
             poster_image=excluded.poster_image`
        )
        .bind(
          s.id,
          s.number,
          s.topicEn,
          s.topicFa,
          s.dateIso,
          s.timeFa,
          s.timeEn || null,
          s.venueFa,
          s.venueEn || null,
          s.levelFa,
          s.remainingSeats,
          s.posterImage || null
        )
        .run();
      return s;
    } catch (e) {
      console.error("D1 updateUpcomingSession error:", e);
    }
  }
  return memoryUpcomingSession;
}

export async function getSlots(): Promise<Session[]> {
  const d1 = getD1();
  if (d1) {
    try {
      const res = await d1.prepare("SELECT * FROM slots ORDER BY created_at ASC").all();
      if (res && res.results && res.results.length > 0) {
        return res.results.map((r) => ({
          id: String(r.id),
          title: String(r.title),
          capacity: Number(r.capacity),
          remainingSeats: Number(r.remaining_seats),
          isFull: Boolean(r.is_full),
        }));
      }
    } catch (e) {
      console.error("D1 getSlots error:", e);
    }
  }
  return memorySlots;
}

export async function updateSlot(
  slotId: string,
  updates: Partial<Pick<Session, "title" | "capacity" | "remainingSeats" | "isFull">>
): Promise<Session | null> {
  const index = memorySlots.findIndex((s) => s.id === slotId);
  if (index !== -1) {
    memorySlots[index] = { ...memorySlots[index], ...updates };
  }

  const d1 = getD1();
  if (d1) {
    try {
      const slots = await getSlots();
      const existing = slots.find((s) => s.id === slotId);
      if (existing) {
        const merged: Session = { ...existing, ...updates };
        await d1
          .prepare(
            `INSERT INTO slots (id, title, capacity, remaining_seats, is_full)
             VALUES (?, ?, ?, ?, ?)
             ON CONFLICT(id) DO UPDATE SET
               title=excluded.title,
               capacity=excluded.capacity,
               remaining_seats=excluded.remaining_seats,
               is_full=excluded.is_full`
          )
          .bind(merged.id, merged.title, merged.capacity, merged.remainingSeats, merged.isFull ? 1 : 0)
          .run();
        return merged;
      }
    } catch (e) {
      console.error("D1 updateSlot error:", e);
    }
  }
  return index !== -1 ? memorySlots[index] : null;
}

export async function addSlot(slot: Session): Promise<Session> {
  memorySlots.push(slot);
  const d1 = getD1();
  if (d1) {
    try {
      await d1
        .prepare("INSERT INTO slots (id, title, capacity, remaining_seats, is_full) VALUES (?, ?, ?, ?, ?)")
        .bind(slot.id, slot.title, slot.capacity, slot.remainingSeats, slot.isFull ? 1 : 0)
        .run();
    } catch (e) {
      console.error("D1 addSlot error:", e);
    }
  }
  return slot;
}

export async function deleteSlot(slotId: string): Promise<boolean> {
  const index = memorySlots.findIndex((s) => s.id === slotId);
  if (index !== -1) {
    memorySlots.splice(index, 1);
  }
  const d1 = getD1();
  if (d1) {
    try {
      await d1.prepare("DELETE FROM slots WHERE id = ?").bind(slotId).run();
    } catch (e) {
      console.error("D1 deleteSlot error:", e);
    }
  }
  return index !== -1;
}

// ---------------------------------------------
// REGISTRATIONS
// ---------------------------------------------
export async function getRegistrations(): Promise<RegistrationRecord[]> {
  const d1 = getD1();
  if (d1) {
    try {
      const res = await d1
        .prepare("SELECT * FROM registrations ORDER BY created_at DESC")
        .all();
      if (res && res.results && res.results.length > 0) {
        return res.results.map((r) => ({
          id: String(r.id),
          fullName: String(r.full_name),
          mobile: String(r.mobile),
          email: String(r.email),
          sessionId: String(r.session_id),
          languageLevel: r.language_level as RegistrationRecord["languageLevel"],
          firstTime: Boolean(r.first_time),
          topicSuggestion: r.topic_suggestion ? String(r.topic_suggestion) : undefined,
          referralCode: r.referral_code ? String(r.referral_code) : undefined,
          heardFrom: r.heard_from as RegistrationRecord["heardFrom"],
          socialHandle: r.social_handle ? String(r.social_handle) : undefined,
          createdAt: String(r.created_at),
        }));
      }
    } catch (e) {
      console.error("D1 getRegistrations error:", e);
    }
  }
  return memoryRegistrations;
}

export async function addRegistration(
  reg: Omit<RegistrationRecord, "id" | "createdAt">
): Promise<RegistrationRecord> {
  const id = "reg-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6);
  const record: RegistrationRecord = {
    ...reg,
    id,
    createdAt: new Date().toISOString(),
  };

  memoryRegistrations.unshift(record);

  // Decrement slot remaining seats
  const slot = memorySlots.find((s) => s.id === reg.sessionId);
  if (slot && slot.remainingSeats > 0) {
    slot.remainingSeats -= 1;
    if (slot.remainingSeats === 0) slot.isFull = true;
  }

  // Also decrement global remainingSeats if available
  if (memoryUpcomingSession.remainingSeats > 0) {
    memoryUpcomingSession.remainingSeats -= 1;
  }

  const d1 = getD1();
  if (d1) {
    try {
      await d1
        .prepare(
          `INSERT INTO registrations (id, full_name, mobile, email, session_id, language_level, first_time, topic_suggestion, referral_code, heard_from, social_handle, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          record.id,
          record.fullName,
          record.mobile,
          record.email,
          record.sessionId,
          record.languageLevel || null,
          record.firstTime ? 1 : 0,
          record.topicSuggestion || null,
          record.referralCode || null,
          record.heardFrom || null,
          record.socialHandle || null,
          record.createdAt
        )
        .run();

      await d1
        .prepare(
          `UPDATE slots SET remaining_seats = MAX(0, remaining_seats - 1), is_full = CASE WHEN remaining_seats <= 1 THEN 1 ELSE is_full END WHERE id = ?`
        )
        .bind(record.sessionId)
        .run();

      await d1
        .prepare(
          `UPDATE sessions SET remaining_seats = MAX(0, remaining_seats - 1) WHERE is_active = 1`
        )
        .run();
    } catch (e) {
      console.error("D1 addRegistration error:", e);
    }
  }

  return record;
}

// ---------------------------------------------
// POSTERS & GALLERY
// ---------------------------------------------
export async function getPosters(): Promise<PosterItem[]> {
  const d1 = getD1();
  if (d1) {
    try {
      const res = await d1.prepare("SELECT * FROM posters ORDER BY session_number DESC").all();
      if (res && res.results && res.results.length > 0) {
        return res.results.map((r) => {
          const sNum = Number(r.session_number);
          const rawDate = String(r.date_fa || "");
          const fallback = (defaultPosters as PosterItem[]).find((p) => p.sessionNumber === sNum);
          const isMojibake = /[\u00D9\u00D8\u00E2]/.test(rawDate);
          return {
            id: String(r.id),
            sessionNumber: sNum,
            topicEn: String(r.topic_en),
            dateFa: (isMojibake && fallback) ? fallback.dateFa : rawDate,
            image: String(r.image_url),
          };
        });
      }
    } catch (e) {
      console.error("D1 getPosters error:", e);
    }
  }
  return memoryPosters;
}

export async function addPoster(poster: PosterItem): Promise<PosterItem> {
  memoryPosters.unshift(poster);
  const d1 = getD1();
  if (d1) {
    try {
      await d1
        .prepare("INSERT INTO posters (id, session_number, topic_en, date_fa, image_url) VALUES (?, ?, ?, ?, ?)")
        .bind(poster.id, poster.sessionNumber, poster.topicEn, poster.dateFa, poster.image)
        .run();
    } catch (e) {
      console.error("D1 addPoster error:", e);
    }
  }
  return poster;
}

export async function deletePoster(posterId: string): Promise<boolean> {
  const index = memoryPosters.findIndex((p) => p.id === posterId);
  if (index !== -1) {
    memoryPosters.splice(index, 1);
  }
  const d1 = getD1();
  if (d1) {
    try {
      await d1.prepare("DELETE FROM posters WHERE id = ?").bind(posterId).run();
    } catch (e) {
      console.error("D1 deletePoster error:", e);
    }
  }
  return index !== -1;
}

export async function getGallery(): Promise<GalleryItem[]> {
  const d1 = getD1();
  if (d1) {
    try {
      const res = await d1.prepare("SELECT * FROM gallery ORDER BY session_number DESC").all();
      if (res && res.results && res.results.length > 0) {
        return res.results.map((r) => ({
          id: String(r.id),
          sessionNumber: Number(r.session_number),
          image: String(r.image_url),
        }));
      }
    } catch (e) {
      console.error("D1 getGallery error:", e);
    }
  }
  return memoryGallery;
}

export async function addGalleryItem(item: GalleryItem): Promise<GalleryItem> {
  memoryGallery.unshift(item);
  const d1 = getD1();
  if (d1) {
    try {
      await d1
        .prepare("INSERT INTO gallery (id, session_number, image_url) VALUES (?, ?, ?)")
        .bind(item.id, item.sessionNumber, item.image)
        .run();
    } catch (e) {
      console.error("D1 addGalleryItem error:", e);
    }
  }
  return item;
}

export async function deleteGalleryItem(galleryId: string): Promise<boolean> {
  const index = memoryGallery.findIndex((g) => g.id === galleryId);
  if (index !== -1) {
    memoryGallery.splice(index, 1);
  }
  const d1 = getD1();
  if (d1) {
    try {
      await d1.prepare("DELETE FROM gallery WHERE id = ?").bind(galleryId).run();
    } catch (e) {
      console.error("D1 deleteGalleryItem error:", e);
    }
  }
  return index !== -1;
}

// ---------------------------------------------
// BOT CONVERSATION STATE
// ---------------------------------------------
export function getBotState(userId: number): { step: string; data: Record<string, unknown> } | null {
  return memoryBotState.get(userId) || null;
}

export function setBotState(userId: number, state: { step: string; data: Record<string, unknown> } | null) {
  if (!state) {
    memoryBotState.delete(userId);
  } else {
    memoryBotState.set(userId, state);
  }
}
