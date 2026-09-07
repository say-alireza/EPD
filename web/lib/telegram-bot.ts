import { Bot, InlineKeyboard, Keyboard } from "grammy";
import {
  getUpcomingSession,
  updateUpcomingSession,
  getSlots,
  updateSlot,
  addSlot,
  deleteSlot,
  getRegistrations,
  getPosters,
  addPoster,
  deletePoster,
  getGallery,
  addGalleryItem,
  deleteGalleryItem,
  getBotState,
  setBotState,
} from "./db";

// Primary Telegram Bot Token (Read from environment variables)
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "placeholder_token_for_build";

// Admin User IDs — read lazily at every check so Cloudflare Pages
// runtime env values are always picked up (top-level const would
// capture the build-time value and never update).
function getAdminIds(): number[] {
  return (process.env.TELEGRAM_ADMIN_IDS || "96092687")
    .split(",")
    .map((id) => parseInt(id.trim(), 10))
    .filter((id) => !isNaN(id));
}

export const bot = new Bot(BOT_TOKEN);

function isAdmin(userId?: number): boolean {
  if (!userId) return false;
  const adminIds = getAdminIds();
  return adminIds.length === 0 || adminIds.includes(userId);
}

// ----------------------------------------------------
// KEYBOARDS
// ----------------------------------------------------

function getMainMenuKeyboard() {
  return new Keyboard()
    .text("لیست ثبتنامها")
    .text("مشخصات نشست جاری")
    .row()
    .text("مدیریت سانسها و ظرفیت")
    .text("مدیریت و آپلود پوستر")
    .row()
    .text("مدیریت و آپلود گالری")
    .text("راهنما")
    .resized()
    .persistent();
}

function getCancelKeyboard() {
  return new Keyboard().text("لغو عملیات").resized().persistent();
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
    "پنل مدیریت باشگاه EPD\n\nبرای دسترسی به بخشهای مختلف از دکمههای کیبورد زیر استفاده کنید:",
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

bot.hears("لغو عملیات", async (ctx) => {
  const userId = ctx.from?.id;
  if (userId) setBotState(userId, null);
  await ctx.reply("عملیات جاری لغو شد.", {
    reply_markup: getMainMenuKeyboard(),
  });
});

bot.hears("بازگشت به منوی اصلی", async (ctx) => {
  const userId = ctx.from?.id;
  if (userId) setBotState(userId, null);
  await ctx.reply("منوی اصلی مدیریت EPD:", {
    reply_markup: getMainMenuKeyboard(),
  });
});

// ----------------------------------------------------
// MAIN MENU HEARS
// ----------------------------------------------------

// 1. Registrations List
bot.hears("لیست ثبتنامها", async (ctx) => {
  const userId = ctx.from?.id;
  if (!isAdmin(userId)) return;

  const regs = await getRegistrations();
  const slots = await getSlots();

  if (regs.length === 0) {
    await ctx.reply("هنوز ثبتنامی در سیستم ثبت نشده است.", {
      reply_markup: getMainMenuKeyboard(),
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

  const refreshKb = new InlineKeyboard().text("بهروزرسانی گزارش", "inline_refresh_registrations");
  await ctx.reply(text, { reply_markup: refreshKb });
});

// 2. Current Session Details
bot.hears("مشخصات نشست جاری", async (ctx) => {
  const userId = ctx.from?.id;
  if (!isAdmin(userId)) return;

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
    .text("ویرایش مکان", "edit_session_venue");

  await ctx.reply(text, { reply_markup: kb });
});

// 3. Manage Slots & Capacity (Add, Delete, Toggle)
bot.hears("مدیریت سانسها و ظرفیت", async (ctx) => {
  const userId = ctx.from?.id;
  if (!isAdmin(userId)) return;

  const slots = await getSlots();

  let text = "مدیریت سانسها و ظرفیت صندلیها:\n\n";
  const kb = new InlineKeyboard();

  slots.forEach((s) => {
    const status = s.isFull ? "[تکمیل ظرفیت]" : `[${s.remainingSeats} صندلی خالی]`;
    text += `• ${s.title}\n  وضعیت: ${status} (ظرفیت کل: ${s.capacity})\n\n`;
    kb.text(
      s.isFull ? `باز کردن: ${s.title.substring(0, 18)}` : `بستن: ${s.title.substring(0, 18)}`,
      `toggle_slot_${s.id}`
    )
      .text(`حذف`, `delete_slot_${s.id}`)
      .row();
  });

  kb.text("افزودن سانس جدید", "action_add_slot").row();

  await ctx.reply(text, { reply_markup: kb });
});

// 4. Posters Management (Upload & Delete)
bot.hears(["مدیریت و آپلود پوستر", "آپلود پوستر"], async (ctx) => {
  const userId = ctx.from?.id;
  if (!isAdmin(userId)) return;

  const posters = await getPosters();
  let text = `مدیریت پوسترها (تعداد کل: ${posters.length})\n\n`;
  const recent = posters.slice(0, 5);

  recent.forEach((p, idx) => {
    text += `${idx + 1}. جلسه ${p.sessionNumber}: ${p.topicEn} (${p.dateFa})\n`;
  });

  const kb = new InlineKeyboard()
    .text("آپلود پوستر نشست جدید", "action_upload_poster")
    .row();

  if (posters.length > 0) {
    kb.text("حذف آخرین پوستر", `delete_poster_${posters[0].id}`).row();
  }

  await ctx.reply(text, { reply_markup: kb });
});

// 5. Gallery Management (Upload & Delete)
bot.hears(["مدیریت و آپلود گالری", "آپلود عکس گالری"], async (ctx) => {
  const userId = ctx.from?.id;
  if (!isAdmin(userId)) return;

  const gallery = await getGallery();
  let text = `مدیریت تصاویر گالری (تعداد کل عکسها: ${gallery.length})\n\n`;
  const recent = gallery.slice(0, 5);

  recent.forEach((g, idx) => {
    text += `${idx + 1}. عکس مربوط به جلسه ${g.sessionNumber}\n`;
  });

  const kb = new InlineKeyboard()
    .text("آپلود عکس جدید گالری", "action_upload_gallery")
    .row();

  if (gallery.length > 0) {
    kb.text("حذف آخرین عکس اضافه شده", `delete_gallery_${gallery[0].id}`).row();
  }

  await ctx.reply(text, { reply_markup: kb });
});

// 6. Help
bot.hears("راهنما", async (ctx) => {
  const userId = ctx.from?.id;
  if (!isAdmin(userId)) return;

  const text =
    "راهنمای پنل مدیریت EPD:\n\n" +
    "- برای لغو هر فرآیند، دکمه «لغو عملیات» یا دستور /cancel را بزنید.\n" +
    "- با افزودن یا حذف سانس، لیست بلافاصله در فرم ثبتنام سایت آپدیت میشود.\n" +
    "- با آپلود پوستر، اطلاعات جلسه جدید روی صفحه اصلی و آرشیو مینشیند.\n" +
    "- با آپلود عکس گالری، تصویر همراه با برچسب شماره جلسه به گالری اضافه میشود.";

  await ctx.reply(text, { reply_markup: getMainMenuKeyboard() });
});

// ----------------------------------------------------
// INLINE CALLBACKS & ACTIONS
// ----------------------------------------------------

bot.callbackQuery("inline_refresh_registrations", async (ctx) => {
  await ctx.answerCallbackQuery("بهروزرسانی شد");
  const regs = await getRegistrations();
  const slots = await getSlots();

  if (regs.length === 0) {
    await ctx.editMessageText("هنوز ثبتنامی در سیستم ثبت نشده است.");
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

  const refreshKb = new InlineKeyboard().text("بهروزرسانی گزارش", "inline_refresh_registrations");
  await ctx.editMessageText(text, { reply_markup: refreshKb });
});

// Slot Toggle
bot.callbackQuery(/^toggle_slot_(.+)$/, async (ctx) => {
  await ctx.answerCallbackQuery("وضعیت سانس تغییر کرد");
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

  const updatedSlots = await getSlots();
  let text = "مدیریت سانسها و ظرفیت صندلیها (بهروزرسانی شد):\n\n";
  const kb = new InlineKeyboard();

  updatedSlots.forEach((s) => {
    const status = s.isFull ? "[تکمیل ظرفیت]" : `[${s.remainingSeats} صندلی خالی]`;
    text += `• ${s.title}\n  وضعیت: ${status} (ظرفیت کل: ${s.capacity})\n\n`;
    kb.text(
      s.isFull ? `باز کردن: ${s.title.substring(0, 18)}` : `بستن: ${s.title.substring(0, 18)}`,
      `toggle_slot_${s.id}`
    )
      .text(`حذف`, `delete_slot_${s.id}`)
      .row();
  });

  kb.text("افزودن سانس جدید", "action_add_slot").row();
  await ctx.editMessageText(text, { reply_markup: kb });
});

// Slot Delete
bot.callbackQuery(/^delete_slot_(.+)$/, async (ctx) => {
  const slotId = ctx.match[1];
  await deleteSlot(slotId);
  await ctx.answerCallbackQuery("سانس با موفقیت حذف شد");

  const updatedSlots = await getSlots();
  let text = "مدیریت سانسها و ظرفیت صندلیها (سانس حذف شد):\n\n";
  const kb = new InlineKeyboard();

  updatedSlots.forEach((s) => {
    const status = s.isFull ? "[تکمیل ظرفیت]" : `[${s.remainingSeats} صندلی خالی]`;
    text += `• ${s.title}\n  وضعیت: ${status} (ظرفیت کل: ${s.capacity})\n\n`;
    kb.text(
      s.isFull ? `باز کردن: ${s.title.substring(0, 18)}` : `بستن: ${s.title.substring(0, 18)}`,
      `toggle_slot_${s.id}`
    )
      .text(`حذف`, `delete_slot_${s.id}`)
      .row();
  });

  kb.text("افزودن سانس جدید", "action_add_slot").row();
  await ctx.editMessageText(text, { reply_markup: kb });
});

// Add Slot prompt
bot.callbackQuery("action_add_slot", async (ctx) => {
  await ctx.answerCallbackQuery();
  const userId = ctx.from?.id;
  if (!userId) return;

  setBotState(userId, { step: "awaiting_new_slot_title", data: {} });
  await ctx.reply("عنوان سانس جدید را وارد کنید (مثال: سانس اول: پنجشنبه ساعت ۱۶ تا ۱۸):", {
    reply_markup: getCancelKeyboard(),
  });
});

// Poster Delete
bot.callbackQuery(/^delete_poster_(.+)$/, async (ctx) => {
  const posterId = ctx.match[1];
  await deletePoster(posterId);
  await ctx.answerCallbackQuery("پوستر با موفقیت حذف شد");
  await ctx.reply("پوستر مورد نظر از آرشیو سایت حذف شد.", {
    reply_markup: getMainMenuKeyboard(),
  });
});

// Gallery Delete
bot.callbackQuery(/^delete_gallery_(.+)$/, async (ctx) => {
  const galleryId = ctx.match[1];
  await deleteGalleryItem(galleryId);
  await ctx.answerCallbackQuery("عکس با موفقیت حذف شد");
  await ctx.reply("تصویر مورد نظر از گالری سایت حذف شد.", {
    reply_markup: getMainMenuKeyboard(),
  });
});

// Upload triggers via inline
bot.callbackQuery("action_upload_poster", async (ctx) => {
  await ctx.answerCallbackQuery();
  const userId = ctx.from?.id;
  if (!userId) return;

  setBotState(userId, { step: "awaiting_poster_photo", data: {} });
  await ctx.reply("تصویر پوستر نشست را به صورت عکس ارسال کنید:", {
    reply_markup: getCancelKeyboard(),
  });
});

bot.callbackQuery("action_upload_gallery", async (ctx) => {
  await ctx.answerCallbackQuery();
  const userId = ctx.from?.id;
  if (!userId) return;

  setBotState(userId, { step: "awaiting_gallery_photo", data: {} });
  await ctx.reply("عکس دورهمی جلسه را ارسال کنید:", {
    reply_markup: getCancelKeyboard(),
  });
});

// Edit prompts via inline
bot.callbackQuery("edit_session_number", async (ctx) => {
  await ctx.answerCallbackQuery();
  const userId = ctx.from?.id;
  if (!userId) return;

  setBotState(userId, { step: "awaiting_session_number", data: {} });
  await ctx.reply("شماره جدید نشست را ارسال کنید (مثال: 14):", {
    reply_markup: getCancelKeyboard(),
  });
});

bot.callbackQuery("edit_session_topic", async (ctx) => {
  await ctx.answerCallbackQuery();
  const userId = ctx.from?.id;
  if (!userId) return;

  setBotState(userId, { step: "awaiting_session_topic_en", data: {} });
  await ctx.reply("موضوع انگلیسی نشست را وارد کنید (مثال: Digital Minimalism):", {
    reply_markup: getCancelKeyboard(),
  });
});

bot.callbackQuery("edit_session_seats", async (ctx) => {
  await ctx.answerCallbackQuery();
  const userId = ctx.from?.id;
  if (!userId) return;

  setBotState(userId, { step: "awaiting_session_seats", data: {} });
  await ctx.reply("تعداد صندلیهای باقیمانده را به صورت عدد ارسال کنید (مثال: 8):", {
    reply_markup: getCancelKeyboard(),
  });
});

bot.callbackQuery("edit_session_venue", async (ctx) => {
  await ctx.answerCallbackQuery();
  const userId = ctx.from?.id;
  if (!userId) return;

  setBotState(userId, { step: "awaiting_session_venue", data: {} });
  await ctx.reply("آدرس محل برگزاری را ارسال کنید:", {
    reply_markup: getCancelKeyboard(),
  });
});

// ----------------------------------------------------
// MESSAGE & CONVERSATION HANDLER
// ----------------------------------------------------

bot.on("message:text", async (ctx) => {
  const userId = ctx.from?.id;
  if (!isAdmin(userId) || !userId) return;

  const state = getBotState(userId);
  if (!state) return;

  const text = ctx.message.text.trim();
  if (text === "لغو عملیات" || text === "/cancel") {
    setBotState(userId, null);
    await ctx.reply("عملیات لغو شد.", { reply_markup: getMainMenuKeyboard() });
    return;
  }

  switch (state.step) {
    // Adding Slot
    case "awaiting_new_slot_title": {
      setBotState(userId, {
        step: "awaiting_new_slot_capacity",
        data: { title: text },
      });
      await ctx.reply("ظرفیت کل این سانس را به عدد وارد کنید (مثال: 15):", {
        reply_markup: getCancelKeyboard(),
      });
      break;
    }

    case "awaiting_new_slot_capacity": {
      const cap = parseInt(text, 10);
      if (isNaN(cap) || cap <= 0) {
        await ctx.reply("لطفاً یک عدد معتبر بزرگتر از صفر وارد کنید:");
        return;
      }

      const slotTitle = String(state.data.title);
      const slotId = "slot-" + Date.now().toString(36);

      await addSlot({
        id: slotId,
        title: slotTitle,
        capacity: cap,
        remainingSeats: cap,
        isFull: false,
      });

      setBotState(userId, null);
      await ctx.reply(`سانس جدید «${slotTitle}» با ظرفیت ${cap} نفر با موفقیت اضافه شد.`, {
        reply_markup: getMainMenuKeyboard(),
      });
      break;
    }

    // Session edit
    case "awaiting_session_number": {
      const num = parseInt(text, 10);
      if (isNaN(num)) {
        await ctx.reply("لطفاً یک عدد معتبر ارسال کنید یا «لغو عملیات» را بزنید.");
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
      await ctx.reply("توضیح یا موضوع فارسی نشست را وارد کنید:", {
        reply_markup: getCancelKeyboard(),
      });
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
        await ctx.reply("لطفاً یک عدد معتبر ارسال کنید یا «لغو عملیات» را بزنید.");
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

    // Poster upload flow
    case "awaiting_poster_session_number": {
      const sessionNumber = parseInt(text, 10);
      if (isNaN(sessionNumber)) {
        await ctx.reply("لطفاً شماره جلسه را به عدد ارسال کنید (مثال: 14):");
        return;
      }

      setBotState(userId, {
        step: "awaiting_poster_topic",
        data: { ...state.data, sessionNumber },
      });
      await ctx.reply("عنوان انگلیسی موضوع نشست را ارسال کنید (مثال: The Power of Habit):", {
        reply_markup: getCancelKeyboard(),
      });
      break;
    }

    case "awaiting_poster_topic": {
      setBotState(userId, {
        step: "awaiting_poster_date_fa",
        data: { ...state.data, topicEn: text },
      });
      await ctx.reply("تاریخ برگزاری را به فارسی ارسال کنید (مثال: پنجشنبه ۲ شهریور):", {
        reply_markup: getCancelKeyboard(),
      });
      break;
    }

    case "awaiting_poster_date_fa": {
      const { fileUrl, sessionNumber, topicEn } = state.data;
      const dateFa = text;

      const posterId = `poster-${sessionNumber}-${Date.now()}`;
      await addPoster({
        id: posterId,
        sessionNumber: Number(sessionNumber),
        topicEn: String(topicEn),
        dateFa,
        image: String(fileUrl),
      });

      // Also update upcoming session hero
      await updateUpcomingSession({
        number: Number(sessionNumber),
        topicEn: String(topicEn),
        posterImage: String(fileUrl),
      });

      setBotState(userId, null);
      await ctx.reply(
        `پوستر نشست ${sessionNumber} با موضوع «${topicEn}» ثبت شد و روی صفحه اصلی و آرشیو پوسترها قرار گرفت.`,
        { reply_markup: getMainMenuKeyboard() }
      );
      break;
    }

    // Gallery upload flow
    case "awaiting_gallery_session_number": {
      const sessionNumber = parseInt(text, 10);
      if (isNaN(sessionNumber)) {
        await ctx.reply("لطفاً شماره جلسه را به عدد ارسال کنید (مثال: 13):");
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
      await ctx.reply(`عکس با موفقیت به گالری تصاویر نشست ${sessionNumber} اضافه شد.`, {
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
  if (!isAdmin(userId) || !userId) return;

  const state = getBotState(userId);
  if (!state) {
    await ctx.reply("لطفاً ابتدا از دکمههای کیبورد مشخص کنید این تصویر پوستر است یا عکس گالری.", {
      reply_markup: getMainMenuKeyboard(),
    });
    return;
  }

  const photos = ctx.message.photo;
  const bestPhoto = photos[photos.length - 1];

  try {
    const file = await ctx.api.getFile(bestPhoto.file_id);
    const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${file.file_path}`;

    if (state.step === "awaiting_poster_photo") {
      setBotState(userId, {
        step: "awaiting_poster_session_number",
        data: { fileUrl },
      });
      await ctx.reply("تصویر دریافت شد. شماره نشست این پوستر را وارد کنید (مثال: 14):", {
        reply_markup: getCancelKeyboard(),
      });
    } else if (state.step === "awaiting_gallery_photo") {
      setBotState(userId, {
        step: "awaiting_gallery_session_number",
        data: { fileUrl },
      });
      await ctx.reply("عکس دریافت شد. این عکس مربوط به کدام شماره جلسه است؟ (مثال: 13):", {
        reply_markup: getCancelKeyboard(),
      });
    }
  } catch (error) {
    console.error("Telegram getFile error:", error);
    await ctx.reply("خطایی در دریافت تصویر رخ داد. لطفاً مجدداً تلاش کنید.", {
      reply_markup: getMainMenuKeyboard(),
    });
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

  for (const adminId of getAdminIds()) {
    try {
      await bot.api.sendMessage(adminId, text);
    } catch (err) {
      console.error(`Failed to send notification to admin ${adminId}:`, err);
    }
  }
}
