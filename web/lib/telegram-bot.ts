import { Bot, InlineKeyboard } from "grammy";
import {
  getUpcomingSession,
  updateUpcomingSession,
  getSlots,
  updateSlot,
  getRegistrations,
  addPoster,
  addGalleryItem,
  getBotState,
  setBotState,
} from "./db";

// Primary Telegram Bot Token
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8689411583:AAFHRyTr4LD6xZjDqAkKaouOejtMjiT8C-s";

// Admin User IDs (defaulting to Alireza and configured admins)
const ADMIN_IDS = (process.env.TELEGRAM_ADMIN_IDS || "96092687")
  .split(",")
  .map((id) => parseInt(id.trim(), 10))
  .filter((id) => !isNaN(id));

export const bot = new Bot(BOT_TOKEN);

function isAdmin(userId?: number): boolean {
  if (!userId) return false;
  return ADMIN_IDS.length === 0 || ADMIN_IDS.includes(userId);
}

function getMainMenuKeyboard() {
  return new InlineKeyboard()
    .text("لیست ثبتنامها", "menu_registrations")
    .text("نشست جاری", "menu_session")
    .row()
    .text("مدیریت سانسها و ظرفیت", "menu_slots")
    .text("آپلود پوستر", "menu_upload_poster")
    .row()
    .text("آپلود عکس گالری", "menu_upload_gallery")
    .text("راهنما", "menu_help");
}

// ----------------------------------------------------
// BOT COMMANDS & HANDLERS
// ----------------------------------------------------

bot.command("start", async (ctx) => {
  const userId = ctx.from?.id;
  if (!isAdmin(userId)) {
    await ctx.reply(`دسترسی غیرمجاز. شناسه عددی تلگرام شما (${userId}) در لیست مدیران تعریف نشده است.`);
    return;
  }

  setBotState(userId!, null);
  await ctx.reply(
    "پنل مدیریت باشگاه EPD\n\nبرای دسترسی به بخشهای مختلف از کلیدهای زیر استفاده کنید:",
    { reply_markup: getMainMenuKeyboard() }
  );
});

bot.command("cancel", async (ctx) => {
  const userId = ctx.from?.id;
  if (userId) setBotState(userId, null);
  await ctx.reply("عملیات جاری لغو شد.", {
    reply_markup: getMainMenuKeyboard(),
  });
});

// ----------------------------------------------------
// INLINE ACTIONS
// ----------------------------------------------------

bot.callbackQuery("menu_main", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.editMessageText(
    "پنل مدیریت باشگاه EPD\n\nبخش مورد نظر را انتخاب کنید:",
    { reply_markup: getMainMenuKeyboard() }
  );
});

// 1. Registrations List
bot.callbackQuery("menu_registrations", async (ctx) => {
  await ctx.answerCallbackQuery();
  const regs = await getRegistrations();
  const slots = await getSlots();

  if (regs.length === 0) {
    const kb = new InlineKeyboard().text("بازگشت", "menu_main");
    await ctx.editMessageText("هنوز ثبتنامی در سیستم ثبت نشده است.", {
      reply_markup: kb,
    });
    return;
  }

  let text = `گزارش ثبتنامها (تعداد کل: ${regs.length})\n\n`;
  const recent = regs.slice(0, 15);

  recent.forEach((r, idx) => {
    const slot = slots.find((s) => s.id === r.sessionId);
    const slotName = slot ? slot.title.split(":")[0] : r.sessionId;
    text += `${idx + 1}. ${r.fullName}\n`;
    text += `   شماره تماس: ${r.mobile}\n`;
    text += `   ایمیل: ${r.email}\n`;
    text += `   سانس: ${slotName}\n`;
    if (r.languageLevel) text += `   سطح زبان: ${r.languageLevel}\n`;
    text += `   تاریخ: ${new Date(r.createdAt).toLocaleDateString("fa-IR")}\n\n`;
  });

  const kb = new InlineKeyboard()
    .text("بهروزرسانی لیست", "menu_registrations")
    .row()
    .text("بازگشت به منو", "menu_main");

  await ctx.editMessageText(text, { reply_markup: kb });
});

// 2. Current Session Details
bot.callbackQuery("menu_session", async (ctx) => {
  await ctx.answerCallbackQuery();
  const session = await getUpcomingSession();

  let text = "مشخصات نشست جاری EPD:\n\n";
  text += `شماره نشست: جلسه ${session.number}\n`;
  text += `موضوع انگلیسی: ${session.topicEn}\n`;
  text += `موضوع فارسی: ${session.topicFa}\n`;
  text += `زمان: ${session.timeFa}\n`;
  text += `مکان: ${session.venueFa}\n`;
  text += `سطح: ${session.levelFa}\n`;
  text += `ظرفیت باقیمانده کل: ${session.remainingSeats} صندلی\n`;
  text += `پوستر: ${session.posterImage ? "آپلود شده" : "تنظیم نشده"}\n`;

  const kb = new InlineKeyboard()
    .text("ویرایش شماره جلسه", "edit_session_number")
    .text("ویرایش موضوع", "edit_session_topic")
    .row()
    .text("ویرایش صندلی باقیمانده", "edit_session_seats")
    .text("ویرایش مکان", "edit_session_venue")
    .row()
    .text("بازگشت", "menu_main");

  await ctx.editMessageText(text, { reply_markup: kb });
});

// 3. Manage Slots & Capacity
bot.callbackQuery("menu_slots", async (ctx) => {
  await ctx.answerCallbackQuery();
  const slots = await getSlots();

  let text = "مدیریت سانسها و ظرفیت:\n\n";
  const kb = new InlineKeyboard();

  slots.forEach((s) => {
    const status = s.isFull ? "[تکمیل ظرفیت]" : `[${s.remainingSeats} صندلی خالی]`;
    text += `• ${s.title}\n  وضعیت: ${status} (ظرفیت کل: ${s.capacity})\n\n`;
    kb.text(
      s.isFull ? `باز کردن: ${s.id}` : `بستن: ${s.id}`,
      `toggle_slot_${s.id}`
    ).row();
  });

  kb.text("بازگشت به منو", "menu_main");
  await ctx.editMessageText(text, { reply_markup: kb });
});

bot.callbackQuery(/^toggle_slot_(.+)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const slotId = ctx.match[1];
  const slots = await getSlots();
  const target = slots.find((s) => s.id === slotId);

  if (target) {
    const nextFullState = !target.isFull;
    await updateSlot(slotId, {
      isFull: nextFullState,
      remainingSeats: nextFullState ? 0 : target.capacity,
    });
  }

  // Refresh slots view
  const updatedSlots = await getSlots();
  let text = "مدیریت سانسها و ظرفیت (بهروزرسانی شد):\n\n";
  const kb = new InlineKeyboard();

  updatedSlots.forEach((s) => {
    const status = s.isFull ? "[تکمیل ظرفیت]" : `[${s.remainingSeats} صندلی خالی]`;
    text += `• ${s.title}\n  وضعیت: ${status} (ظرفیت کل: ${s.capacity})\n\n`;
    kb.text(
      s.isFull ? `باز کردن: ${s.id}` : `بستن: ${s.id}`,
      `toggle_slot_${s.id}`
    ).row();
  });

  kb.text("بازگشت به منو", "menu_main");
  await ctx.editMessageText(text, { reply_markup: kb });
});

// 4. Session edit prompts
bot.callbackQuery("edit_session_number", async (ctx) => {
  await ctx.answerCallbackQuery();
  const userId = ctx.from?.id;
  if (!userId) return;

  setBotState(userId, { step: "awaiting_session_number", data: {} });
  await ctx.reply("شماره جدید نشست را ارسال کنید (مثال: 14):");
});

bot.callbackQuery("edit_session_topic", async (ctx) => {
  await ctx.answerCallbackQuery();
  const userId = ctx.from?.id;
  if (!userId) return;

  setBotState(userId, { step: "awaiting_session_topic_en", data: {} });
  await ctx.reply("موضوع انگلیسی نشست را وارد کنید (مثال: Digital Minimalism):");
});

bot.callbackQuery("edit_session_seats", async (ctx) => {
  await ctx.answerCallbackQuery();
  const userId = ctx.from?.id;
  if (!userId) return;

  setBotState(userId, { step: "awaiting_session_seats", data: {} });
  await ctx.reply("تعداد صندلیهای باقیمانده را به صورت عدد ارسال کنید (مثال: 8):");
});

bot.callbackQuery("edit_session_venue", async (ctx) => {
  await ctx.answerCallbackQuery();
  const userId = ctx.from?.id;
  if (!userId) return;

  setBotState(userId, { step: "awaiting_session_venue", data: {} });
  await ctx.reply("آدرس محل برگزاری را ارسال کنید:");
});

// 5. Upload Poster Prompt
bot.callbackQuery("menu_upload_poster", async (ctx) => {
  await ctx.answerCallbackQuery();
  const userId = ctx.from?.id;
  if (!userId) return;

  setBotState(userId, { step: "awaiting_poster_photo", data: {} });
  await ctx.reply("تصویر پوستر نشست را به صورت عکس ارسال کنید:");
});

// 6. Upload Gallery Prompt
bot.callbackQuery("menu_upload_gallery", async (ctx) => {
  await ctx.answerCallbackQuery();
  const userId = ctx.from?.id;
  if (!userId) return;

  setBotState(userId, { step: "awaiting_gallery_photo", data: {} });
  await ctx.reply("عکس دورهمی جلسه را ارسال کنید:");
});

// 7. Help
bot.callbackQuery("menu_help", async (ctx) => {
  await ctx.answerCallbackQuery();
  const text =
    "راهنمای پنل مدیریت EPD:\n\n" +
    "- برای لغو هر فرآیند، دستور /cancel را ارسال کنید.\n" +
    "- با آپلود پوستر، تصویر مستقیماً در صفحه اصلی و آرشیو پوسترها قرار میگیرد.\n" +
    "- با آپلود عکس گالری، تصویر به بخش تصاویر جلسات اضافه خواهد شد.\n" +
    "- تغییر ظرفیت سانسها بلافاصله در فرم ثبتنام اعمال میشود.";

  const kb = new InlineKeyboard().text("بازگشت", "menu_main");
  await ctx.editMessageText(text, { reply_markup: kb });
});

// ----------------------------------------------------
// MESSAGE & CONVERSATION HANDLER
// ----------------------------------------------------

bot.on("message:text", async (ctx) => {
  const userId = ctx.from?.id;
  if (!isAdmin(userId)) return;

  const state = getBotState(userId);
  if (!state) return;

  const text = ctx.message.text.trim();

  switch (state.step) {
    case "awaiting_session_number": {
      const num = parseInt(text, 10);
      if (isNaN(num)) {
        await ctx.reply("لطفاً یک عدد معتبر ارسال کنید.");
        return;
      }
      await updateUpcomingSession({ number: num });
      setBotState(userId, null);
      await ctx.reply(`شماره نشست با موفقیت به جلسه ${num} تغییر یافت.`, {
        reply_markup: getMainMenuKeyboard(),
      });
      break;
    }

    case "awaiting_session_topic_en": {
      setBotState(userId, {
        step: "awaiting_session_topic_fa",
        data: { topicEn: text },
      });
      await ctx.reply("توضیح یا موضوع فارسی نشست را وارد کنید:");
      break;
    }

    case "awaiting_session_topic_fa": {
      const topicEn = String(state.data.topicEn || "Session Topic");
      await updateUpcomingSession({
        topicEn,
        topicFa: text,
      });
      setBotState(userId, null);
      await ctx.reply("موضوع نشست با موفقیت بهروزرسانی شد.", {
        reply_markup: getMainMenuKeyboard(),
      });
      break;
    }

    case "awaiting_session_seats": {
      const seats = parseInt(text, 10);
      if (isNaN(seats)) {
        await ctx.reply("لطفاً یک عدد معتبر ارسال کنید.");
        return;
      }
      await updateUpcomingSession({ remainingSeats: seats });
      setBotState(userId, null);
      await ctx.reply(`ظرفیت صندلیهای باقیمانده به ${seats} تغییر یافت.`, {
        reply_markup: getMainMenuKeyboard(),
      });
      break;
    }

    case "awaiting_session_venue": {
      await updateUpcomingSession({ venueFa: text });
      setBotState(userId, null);
      await ctx.reply("مکان برگزاری با موفقیت بهروزرسانی شد.", {
        reply_markup: getMainMenuKeyboard(),
      });
      break;
    }

    case "awaiting_poster_topic": {
      const { fileUrl, sessionNumber, dateFa } = state.data;
      const topicEn = text;

      const posterId = `poster-${sessionNumber}-${Date.now()}`;
      await addPoster({
        id: posterId,
        sessionNumber: Number(sessionNumber),
        topicEn,
        dateFa: String(dateFa || "پنجشنبه جاری"),
        image: String(fileUrl),
      });

      // Also set as current session poster
      await updateUpcomingSession({
        number: Number(sessionNumber),
        topicEn,
        posterImage: String(fileUrl),
      });

      setBotState(userId, null);
      await ctx.reply("پوستر نشست با موفقیت ثبت شد و روی سایت قرار گرفت.", {
        reply_markup: getMainMenuKeyboard(),
      });
      break;
    }

    case "awaiting_poster_session_number": {
      const sessionNumber = parseInt(text, 10);
      if (isNaN(sessionNumber)) {
        await ctx.reply("لطفاً شماره جلسه را به عدد ارسال کنید:");
        return;
      }

      setBotState(userId, {
        step: "awaiting_poster_topic",
        data: { ...state.data, sessionNumber },
      });
      await ctx.reply("عنوان انگلیسی موضوع این پوستر را ارسال کنید (مثال: The Power of Habit):");
      break;
    }

    case "awaiting_gallery_session_number": {
      const sessionNumber = parseInt(text, 10);
      if (isNaN(sessionNumber)) {
        await ctx.reply("لطفاً شماره جلسه را به عدد ارسال کنید:");
        return;
      }

      const { fileUrl } = state.data;
      const galleryId = `gallery-${sessionNumber}-${Date.now()}`;
      await addGalleryItem({
        id: galleryId,
        sessionNumber,
        image: String(fileUrl),
      });

      setBotState(userId, null);
      await ctx.reply("عکس با موفقیت به گالری تصاویر وبسایت اضافه شد.", {
        reply_markup: getMainMenuKeyboard(),
      });
      break;
    }
  }
});

// ----------------------------------------------------
// PHOTO HANDLER (POSTER & GALLERY)
// ----------------------------------------------------

bot.on("message:photo", async (ctx) => {
  const userId = ctx.from?.id;
  if (!isAdmin(userId)) return;

  const state = getBotState(userId);
  if (!state) {
    await ctx.reply("لطفاً ابتدا از منو مشخص کنید این تصویر پوستر نشست است یا عکس گالری:", {
      reply_markup: new InlineKeyboard()
        .text("پوستر نشست", "menu_upload_poster")
        .text("عکس گالری", "menu_upload_gallery"),
    });
    return;
  }

  const photos = ctx.message.photo;
  const bestPhoto = photos[photos.length - 1]; // Highest resolution photo

  try {
    const file = await ctx.api.getFile(bestPhoto.file_id);
    const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${file.file_path}`;

    if (state.step === "awaiting_poster_photo") {
      setBotState(userId, {
        step: "awaiting_poster_session_number",
        data: { fileUrl },
      });
      await ctx.reply("تصویر دریافت شد. شماره نشست این پوستر را وارد کنید (مثال: 14):");
    } else if (state.step === "awaiting_gallery_photo") {
      setBotState(userId, {
        step: "awaiting_gallery_session_number",
        data: { fileUrl },
      });
      await ctx.reply("عکس دریافت شد. این عکس مربوط به کدام شماره جلسه است؟ (مثال: 13):");
    }
  } catch (error) {
    console.error("Telegram getFile error:", error);
    await ctx.reply("خطایی در دریافت تصویر رخ داد. لطفاً مجدداً تلاش کنید.");
  }
});

// ----------------------------------------------------
// NOTIFICATION DISPATCHER (ON NEW REGISTRATION)
// ----------------------------------------------------

export async function notifyAdminsNewRegistration(registration: {
  fullName: string;
  mobile: string;
  email: string;
  sessionTitle: string;
  languageLevel?: string;
  topicSuggestion?: string;
}) {
  const text =
    "ثبتنام جدید در وبسایت EPD\n\n" +
    `نام و نامخانوادگی: ${registration.fullName}\n` +
    `شماره تماس: ${registration.mobile}\n` +
    `ایمیل: ${registration.email}\n` +
    `سانس انتخابی: ${registration.sessionTitle}\n` +
    (registration.languageLevel ? `سطح زبان: ${registration.languageLevel}\n` : "") +
    (registration.topicSuggestion ? `موضوع پیشنهادی: ${registration.topicSuggestion}\n` : "") +
    `زمان ثبت: ${new Date().toLocaleTimeString("fa-IR")}`;

  for (const adminId of ADMIN_IDS) {
    try {
      await bot.api.sendMessage(adminId, text);
    } catch (err) {
      console.error(`Failed to send notification to admin ${adminId}:`, err);
    }
  }
}
