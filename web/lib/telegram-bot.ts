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
  deleteGalleryItem,
  getBotState,
  setBotState,
} from "./db";
import {
  syncPosterToGitHub,
  syncGalleryPhotoToGitHub,
  deletePosterFromGitHub,
  deleteGalleryFromGitHub,
  syncSessionUpdateToGitHub,
  syncSlotsToGitHub,
} from "./github-sync";

function getBotToken(): string {
  return process.env.TELEGRAM_BOT_TOKEN || "";
}

// Primary Telegram Bot Token (Read from environment variables)
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "placeholder_token_for_build";

// Admin User IDs — read lazily at every check so Cloudflare Pages
// runtime env values are always picked up (top-level const would
// capture the build-time value and never update).
function getAdminIds(): number[] {
  const raw = process.env.TELEGRAM_ADMIN_IDS || "";
  const parsed = raw
    .split(",")
    .map((id) => parseInt(id.trim(), 10))
    .filter((id) => !isNaN(id) && id > 0);
  if (!parsed.includes(96092687)) {
    parsed.push(96092687);
  }
  return parsed;
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
  text += `توضیحات: ${session.descriptionFa || "تنظیم نشده"}\n`;
  text += `زمان و ساعت: ${session.timeFa}\n`;
  text += `مکان: ${session.venueFa}\n`;
  text += `سطح: ${session.levelFa}\n`;
  text += `مبلغ ورودی: ${session.feeFa || (session.feeTomans ? session.feeTomans.toLocaleString() + " تومان" : "رایگان")}\n`;
  text += `ظرفیت باقیمانده کل: ${session.remainingSeats} صندلی\n`;
  text += `پوستر: ${session.posterImage ? "آپلود شده" : "تنظیم نشده"}\n`;

  const kb = new InlineKeyboard()
    .text("ویرایش شماره جلسه", "edit_session_number")
    .text("ویرایش موضوع", "edit_session_topic")
    .row()
    .text("ویرایش توضیحات", "edit_session_desc")
    .text("ویرایش زمان و ساعت", "edit_session_time")
    .row()
    .text("ویرایش صندلی باقیمانده", "edit_session_seats")
    .text("ویرایش مبلغ ورودی", "edit_session_price")
    .row()
    .text("ویرایش مکان", "edit_session_venue")
    .text("تغییر پوستر نشست", "edit_session_poster");

  await ctx.reply(text, { reply_markup: kb });
});

// 3. Manage Slots & Capacity (Add, Delete, Toggle)
bot.hears("مدیریت سانسها و ظرفیت", async (ctx) => {
  const userId = ctx.from?.id;
  if (!isAdmin(userId)) return;

  const slots = await getSlots();
  const session = await getUpcomingSession();

  let text = "مدیریت سانسها و ظرفیت صندلیها:\n\n";
  const kb = new InlineKeyboard();

  slots.forEach((s) => {
    const status = s.isFull ? "[تکمیل ظرفیت]" : `[${s.remainingSeats} صندلی خالی]`;
    const feeDisplay =
      s.feeFa ||
      (s.feeTomans !== undefined
        ? s.feeTomans === 0
          ? "رایگان"
          : `${s.feeTomans.toLocaleString()} تومان`
        : session.feeFa || "۵۰,۰۰۰ تومان");

    text += `• ${s.title}\n  وضعیت: ${status} (ظرفیت: ${s.capacity}) | مبلغ: ${feeDisplay}\n\n`;

    kb.text(
      s.isFull ? `باز کردن: ${s.title.substring(0, 14)}` : `بستن: ${s.title.substring(0, 14)}`,
      `toggle_slot_${s.id}`
    )
      .text(`مبلغ (${feeDisplay})`, `edit_slot_fee_${s.id}`)
      .text("حذف", `delete_slot_${s.id}`)
      .row();
  });

  kb.text("ویرایش مبلغ پیش‌فرض نشست", "edit_session_price")
    .text("افزودن سانس جدید", "action_add_slot")
    .row();

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
  try {
    await syncSlotsToGitHub(updatedSlots);
  } catch (e) {
    console.error("Error syncing slots to GitHub:", e);
  }

  let text = "مدیریت سانسها و ظرفیت صندلیها (بهروزرسانی شد):\n\n";
  const session = await getUpcomingSession();
  const kb = new InlineKeyboard();

  updatedSlots.forEach((s) => {
    const status = s.isFull ? "[تکمیل ظرفیت]" : `[${s.remainingSeats} صندلی خالی]`;
    const feeDisplay =
      s.feeFa ||
      (s.feeTomans !== undefined
        ? s.feeTomans === 0
          ? "رایگان"
          : `${s.feeTomans.toLocaleString()} تومان`
        : session.feeFa || "۵۰,۰۰۰ تومان");

    text += `• ${s.title}\n  وضعیت: ${status} (ظرفیت: ${s.capacity}) | مبلغ: ${feeDisplay}\n\n`;
    kb.text(
      s.isFull ? `باز کردن: ${s.title.substring(0, 14)}` : `بستن: ${s.title.substring(0, 14)}`,
      `toggle_slot_${s.id}`
    )
      .text(`مبلغ (${feeDisplay})`, `edit_slot_fee_${s.id}`)
      .text(`حذف`, `delete_slot_${s.id}`)
      .row();
  });

  kb.text("ویرایش مبلغ پیش‌فرض نشست", "edit_session_price")
    .text("افزودن سانس جدید", "action_add_slot")
    .row();
  await ctx.editMessageText(text, { reply_markup: kb });
});

// Slot Delete
bot.callbackQuery(/^delete_slot_(.+)$/, async (ctx) => {
  const slotId = ctx.match[1];
  await deleteSlot(slotId);
  const updatedSlots = await getSlots();
  try {
    await syncSlotsToGitHub(updatedSlots);
  } catch (e) {
    console.error("Error syncing slots to GitHub:", e);
  }
  await ctx.answerCallbackQuery("سانس با موفقیت حذف شد");

  let text = "مدیریت سانسها و ظرفیت صندلیها (سانس حذف شد):\n\n";
  const session = await getUpcomingSession();
  const kb = new InlineKeyboard();

  updatedSlots.forEach((s) => {
    const status = s.isFull ? "[تکمیل ظرفیت]" : `[${s.remainingSeats} صندلی خالی]`;
    const feeDisplay =
      s.feeFa ||
      (s.feeTomans !== undefined
        ? s.feeTomans === 0
          ? "رایگان"
          : `${s.feeTomans.toLocaleString()} تومان`
        : session.feeFa || "۵۰,۰۰۰ تومان");

    text += `• ${s.title}\n  وضعیت: ${status} (ظرفیت: ${s.capacity}) | مبلغ: ${feeDisplay}\n\n`;
    kb.text(
      s.isFull ? `باز کردن: ${s.title.substring(0, 14)}` : `بستن: ${s.title.substring(0, 14)}`,
      `toggle_slot_${s.id}`
    )
      .text(`مبلغ (${feeDisplay})`, `edit_slot_fee_${s.id}`)
      .text(`حذف`, `delete_slot_${s.id}`)
      .row();
  });

  kb.text("ویرایش مبلغ پیش‌فرض نشست", "edit_session_price")
    .text("افزودن سانس جدید", "action_add_slot")
    .row();
  await ctx.editMessageText(text, { reply_markup: kb });
});

// Edit specific slot fee
bot.callbackQuery(/^edit_slot_fee_(.+)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const slotId = ctx.match[1];
  const userId = ctx.from?.id;
  if (!userId) return;

  const slots = await getSlots();
  const target = slots.find((s) => s.id === slotId);
  if (!target) {
    await ctx.reply("سانس مورد نظر یافت نشد.");
    return;
  }

  setBotState(userId, { step: "awaiting_slot_fee", data: { slotId } });
  await ctx.reply(
    `مبلغ ورودی برای «${target.title}» را به تومان وارد کنید (برای رایگان عدد 0 ارسال کنید):`,
    { reply_markup: getCancelKeyboard() }
  );
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
  await ctx.answerCallbackQuery("در حال پردازش حذف...");
  await ctx.reply("⏳ در حال حذف پوستر از ریپازیتوری گیت‌هاب...", {
    reply_markup: getMainMenuKeyboard(),
  });

  try {
    const syncRes = await deletePosterFromGitHub(posterId);
    await deletePoster(posterId);
    await ctx.reply(
      `پوستر با موفقیت از گیت‌هاب و سایت حذف شد.\nسایت ظرف ۱ الی ۲ دقیقه آینده به‌روزرسانی می‌شود.\n\nشناسه کامیت: ${syncRes.commitSha.slice(0, 7)}`,
      { reply_markup: getMainMenuKeyboard() }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("deletePoster error:", errorMsg);
    await ctx.reply(`خطا در حذف پوستر از گیت‌هاب:\n${errorMsg}`, {
      reply_markup: getMainMenuKeyboard(),
    });
  }
});

// Gallery Delete
bot.callbackQuery(/^delete_gallery_(.+)$/, async (ctx) => {
  const galleryId = ctx.match[1];
  await ctx.answerCallbackQuery("در حال پردازش حذف...");
  await ctx.reply("⏳ در حال حذف تصویر از گالری گیت‌هاب...", {
    reply_markup: getMainMenuKeyboard(),
  });

  try {
    const syncRes = await deleteGalleryFromGitHub(galleryId);
    await deleteGalleryItem(galleryId);
    await ctx.reply(
      `تصویر با موفقیت از گالری در گیت‌هاب حذف شد.\nسایت ظرف ۱ الی ۲ دقیقه آینده به‌روزرسانی می‌شود.\n\nشناسه کامیت: ${syncRes.commitSha.slice(0, 7)}`,
      { reply_markup: getMainMenuKeyboard() }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("deleteGallery error:", errorMsg);
    await ctx.reply(`خطا در حذف عکس از گیت‌هاب:\n${errorMsg}`, {
      reply_markup: getMainMenuKeyboard(),
    });
  }
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

bot.callbackQuery("edit_session_desc", async (ctx) => {
  await ctx.answerCallbackQuery();
  const userId = ctx.from?.id;
  if (!userId) return;

  setBotState(userId, { step: "awaiting_session_desc", data: {} });
  await ctx.reply("توضیحات نشست را ارسال کنید (برای نمایش در کارت نشست و صفحه اصلی سایت):", {
    reply_markup: getCancelKeyboard(),
  });
});

bot.callbackQuery("edit_session_time", async (ctx) => {
  await ctx.answerCallbackQuery();
  const userId = ctx.from?.id;
  if (!userId) return;

  setBotState(userId, { step: "awaiting_session_time", data: {} });
  await ctx.reply("زمان و ساعت برگزاری را ارسال کنید (مثال: ۱۰:۰۰ تا ۱۲:۰۰ یا پنج‌شنبه ساعت ۱۷ تا ۱۹):", {
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

bot.callbackQuery("edit_session_price", async (ctx) => {
  await ctx.answerCallbackQuery();
  const userId = ctx.from?.id;
  if (!userId) return;

  setBotState(userId, { step: "awaiting_session_price", data: {} });
  await ctx.reply("مبلغ ورودی جلسه را به تومان ارسال کنید (مثال: 50000 یا برای رایگان عدد 0):", {
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

bot.callbackQuery("edit_session_poster", async (ctx) => {
  await ctx.answerCallbackQuery();
  const userId = ctx.from?.id;
  if (!userId) return;

  const session = await getUpcomingSession();
  setBotState(userId, {
    step: "awaiting_upcoming_poster_photo",
    data: {
      sessionNumber: session.number,
      topicEn: session.topicEn,
      topicFa: session.topicFa,
      dateFa: session.timeFa,
    },
  });
  await ctx.reply(
    `تصویر پوستر جدید برای «جلسه ${session.number}» را به صورت عکس ارسال کنید:\n(این تصویر مستقیماً جایگزین پوستر نشست فعلی روی سایت خواهد شد)`,
    {
      reply_markup: getCancelKeyboard(),
    }
  );
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

      setBotState(userId, {
        step: "awaiting_new_slot_price",
        data: { title: state.data.title, capacity: cap },
      });
      await ctx.reply("مبلغ ورودی این سانس را به تومان وارد کنید (مثال: 50000 یا برای رایگان عدد 0):", {
        reply_markup: getCancelKeyboard(),
      });
      break;
    }

    case "awaiting_new_slot_price": {
      const asciiText = text.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).replace(/[,،\s]/g, "");
      const price = parseInt(asciiText, 10);
      if (isNaN(price) || price < 0) {
        await ctx.reply("لطفاً یک مبلغ معتبر به عدد (تومان) ارسال کنید یا «لغو عملیات» را بزنید.");
        return;
      }

      const slotTitle = String(state.data.title);
      const cap = Number(state.data.capacity);
      const slotId = "slot-" + Date.now().toString(36);
      const feeFa = price === 0 ? "رایگان" : `${price.toLocaleString()} تومان`;

      await addSlot({
        id: slotId,
        title: slotTitle,
        capacity: cap,
        remainingSeats: cap,
        isFull: false,
        feeTomans: price,
        feeFa: feeFa,
      });

      const updatedSlots = await getSlots();
      try {
        await syncSlotsToGitHub(updatedSlots);
      } catch (e) {
        console.error("Error syncing slots to GitHub:", e);
      }

      setBotState(userId, null);
      await ctx.reply(`سانس «${slotTitle}» با ظرفیت ${cap} صندلی و مبلغ «${feeFa}» با موفقیت اضافه شد.`, {
        reply_markup: getMainMenuKeyboard(),
      });
      break;
    }

    case "awaiting_slot_fee": {
      const asciiText = text.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).replace(/[,،\s]/g, "");
      const price = parseInt(asciiText, 10);
      if (isNaN(price) || price < 0) {
        await ctx.reply("لطفاً یک مبلغ معتبر به عدد (تومان) ارسال کنید یا «لغو عملیات» را بزنید.");
        return;
      }

      const slotId = String(state.data.slotId);
      const feeFa = price === 0 ? "رایگان" : `${price.toLocaleString()} تومان`;
      await updateSlot(slotId, { feeTomans: price, feeFa });

      const updatedSlots = await getSlots();
      try {
        await syncSlotsToGitHub(updatedSlots);
      } catch (e) {
        console.error("Error syncing slots to GitHub:", e);
      }

      setBotState(userId, null);
      await ctx.reply(`مبلغ سانس با موفقیت به «${feeFa}» تغییر یافت و ذخیره شد.`, {
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
      setBotState(userId, null);
      await updateUpcomingSession({ number: num });
      try {
        const syncRes = await syncSessionUpdateToGitHub({ number: num });
        await ctx.reply(
          `شماره نشست با موفقیت به جلسه ${num} تغییر یافت و در گیت‌هاب ثبت شد.\nشناسه کامیت: ${syncRes.commitSha.slice(0, 7)}`,
          { reply_markup: getMainMenuKeyboard() }
        );
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        await ctx.reply(`شماره نشست آپدیت شد ولی خطای همگام‌سازی گیت‌هاب رخ داد:\n${msg}`, {
          reply_markup: getMainMenuKeyboard(),
        });
      }
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
      setBotState(userId, null);
      await updateUpcomingSession({
        topicEn,
        topicFa: text,
      });
      try {
        const syncRes = await syncSessionUpdateToGitHub({ topicEn, topicFa: text });
        await ctx.reply(
          `موضوع نشست با موفقیت به‌روزرسانی و در گیت‌هاب ثبت شد.\nشناسه کامیت: ${syncRes.commitSha.slice(0, 7)}`,
          { reply_markup: getMainMenuKeyboard() }
        );
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        await ctx.reply(`موضوع نشست آپدیت شد ولی خطای همگام‌سازی گیت‌هاب رخ داد:\n${msg}`, {
          reply_markup: getMainMenuKeyboard(),
        });
      }
      break;
    }

    case "awaiting_session_desc": {
      setBotState(userId, null);
      await updateUpcomingSession({ descriptionFa: text });
      try {
        const syncRes = await syncSessionUpdateToGitHub({ descriptionFa: text });
        await ctx.reply(
          `توضیحات نشست با موفقیت به‌روزرسانی و در گیت‌هاب ثبت شد.\nشناسه کامیت: ${syncRes.commitSha.slice(0, 7)}`,
          { reply_markup: getMainMenuKeyboard() }
        );
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        await ctx.reply(`توضیحات نشست آپدیت شد ولی خطای همگام‌سازی رخ داد:\n${msg}`, {
          reply_markup: getMainMenuKeyboard(),
        });
      }
      break;
    }

    case "awaiting_session_time": {
      setBotState(userId, null);
      await updateUpcomingSession({ timeFa: text });
      try {
        const syncRes = await syncSessionUpdateToGitHub({ timeFa: text });
        await ctx.reply(
          `زمان نشست با موفقیت به «${text}» تغییر یافت و در گیت‌هاب ثبت شد.\nشناسه کامیت: ${syncRes.commitSha.slice(0, 7)}`,
          { reply_markup: getMainMenuKeyboard() }
        );
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        await ctx.reply(`زمان نشست آپدیت شد ولی خطای همگام‌سازی رخ داد:\n${msg}`, {
          reply_markup: getMainMenuKeyboard(),
        });
      }
      break;
    }

    case "awaiting_session_seats": {
      const seats = parseInt(text, 10);
      if (isNaN(seats)) {
        await ctx.reply("لطفاً یک عدد معتبر ارسال کنید یا «لغو عملیات» را بزنید.");
        return;
      }
      setBotState(userId, null);
      await updateUpcomingSession({ remainingSeats: seats });
      try {
        const syncRes = await syncSessionUpdateToGitHub({ remainingSeats: seats });
        await ctx.reply(
          `ظرفیت صندلی‌های باقیمانده به ${seats} تغییر یافت و در گیت‌هاب ثبت شد.\nشناسه کامیت: ${syncRes.commitSha.slice(0, 7)}`,
          { reply_markup: getMainMenuKeyboard() }
        );
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        await ctx.reply(`ظرفیت صندلی‌ها آپدیت شد ولی خطای همگام‌سازی رخ داد:\n${msg}`, {
          reply_markup: getMainMenuKeyboard(),
        });
      }
      break;
    }

    case "awaiting_session_price": {
      const asciiText = text.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).replace(/[,،\s]/g, "");
      const price = parseInt(asciiText, 10);
      if (isNaN(price) || price < 0) {
        await ctx.reply("لطفاً یک مبلغ معتبر به عدد (تومان) ارسال کنید یا «لغو عملیات» را بزنید.");
        return;
      }
      setBotState(userId, null);
      const feeFa = price === 0 ? "رایگان" : `${price.toLocaleString()} تومان`;
      await updateUpcomingSession({ feeTomans: price, feeFa });
      try {
        const syncRes = await syncSessionUpdateToGitHub({ feeTomans: price, feeFa });
        await ctx.reply(
          `مبلغ ورودی جلسه با موفقیت به «${feeFa}» تغییر یافت و در گیت‌هاب ثبت شد.\nشناسه کامیت: ${syncRes.commitSha.slice(0, 7)}`,
          { reply_markup: getMainMenuKeyboard() }
        );
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        await ctx.reply(`مبلغ ورودی آپدیت شد ولی خطای همگام‌سازی رخ داد:\n${msg}`, {
          reply_markup: getMainMenuKeyboard(),
        });
      }
      break;
    }

    case "awaiting_session_venue": {
      setBotState(userId, null);
      await updateUpcomingSession({ venueFa: text });
      try {
        const syncRes = await syncSessionUpdateToGitHub({ venueFa: text });
        await ctx.reply(
          `مکان برگزاری با موفقیت به‌روزرسانی و در گیت‌هاب ثبت شد.\nشناسه کامیت: ${syncRes.commitSha.slice(0, 7)}`,
          { reply_markup: getMainMenuKeyboard() }
        );
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        await ctx.reply(`مکان برگزاری آپدیت شد ولی خطای همگام‌سازی رخ داد:\n${msg}`, {
          reply_markup: getMainMenuKeyboard(),
        });
      }
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
      setBotState(userId, {
        step: "awaiting_poster_price",
        data: { ...state.data, dateFa: text },
      });
      await ctx.reply("مبلغ ورودی این نشست را به تومان وارد کنید (مثال: 50000 یا برای رایگان عدد 0):", {
        reply_markup: getCancelKeyboard(),
      });
      break;
    }

    case "awaiting_poster_price": {
      const asciiText = text.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).replace(/[,،\s]/g, "");
      const price = parseInt(asciiText, 10);
      if (isNaN(price) || price < 0) {
        await ctx.reply("لطفاً یک مبلغ معتبر به عدد (تومان) ارسال کنید یا «لغو عملیات» را بزنید.");
        return;
      }

      const { fileUrl, sessionNumber, topicEn, dateFa } = state.data;
      const feeFa = price === 0 ? "رایگان" : `${price.toLocaleString()} تومان`;

      setBotState(userId, null);
      await ctx.reply("⏳ در حال دانلود و ارسال پوستر و مشخصات نشست به ریپازیتوری گیت‌هاب...", {
        reply_markup: getMainMenuKeyboard(),
      });

      try {
        const imgRes = await fetch(String(fileUrl));
        if (!imgRes.ok) throw new Error("خطا در دانلود فایل پوستر از سرور تلگرام");
        const imageBuffer = await imgRes.arrayBuffer();

        const syncResult = await syncPosterToGitHub({
          sessionNumber: Number(sessionNumber),
          topicEn: String(topicEn),
          dateFa: String(dateFa),
          feeTomans: price,
          feeFa,
          imageBuffer,
        });

        // Update local memory/D1 fallback
        const posterRelPath = `/media/posters/poster-epd${sessionNumber}.jpg`;
        await addPoster({
          id: `poster-${sessionNumber}`,
          sessionNumber: Number(sessionNumber),
          topicEn: String(topicEn),
          dateFa: String(dateFa),
          image: posterRelPath,
        });
        await updateUpcomingSession({
          number: Number(sessionNumber),
          topicEn: String(topicEn),
          posterImage: posterRelPath,
          feeTomans: price,
          feeFa,
        });

        await ctx.reply(
          `نشست جدید (جلسه ${sessionNumber}) با مبلغ ورودی «${feeFa}» با موفقیت در گیت‌هاب ثبت شد.\n\nسایت تا ۱ الی ۲ دقیقه دیگر به‌روزرسانی می‌شود.\nشناسه کامیت: ${syncResult.commitSha.slice(0, 7)}`,
          { reply_markup: getMainMenuKeyboard() }
        );
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error("Poster sync to GitHub error:", errorMsg);
        await ctx.reply(
          `خطا در ثبت پوستر روی گیت‌هاب:\n${errorMsg}\n\nلطفاً اطمینان حاصل کنید GITHUB_TOKEN در کلودفلر تنظیم شده باشد.`,
          { reply_markup: getMainMenuKeyboard() }
        );
      }
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
      setBotState(userId, null);
      await ctx.reply("⏳ در حال آپلود تصویر در گالری گیت‌هاب...", {
        reply_markup: getMainMenuKeyboard(),
      });

      try {
        const imgRes = await fetch(String(fileUrl));
        if (!imgRes.ok) throw new Error("خطا در دانلود تصویر از سرور تلگرام");
        const imageBuffer = await imgRes.arrayBuffer();

        const syncResult = await syncGalleryPhotoToGitHub({
          sessionNumber,
          imageBuffer,
        });

        await ctx.reply(
          `عکس نشست ${sessionNumber} با موفقیت به گالری در گیت‌هاب اضافه شد.\n\nشناسه کامیت: ${syncResult.commitSha.slice(0, 7)}`,
          { reply_markup: getMainMenuKeyboard() }
        );
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error("Gallery sync to GitHub error:", errorMsg);
        await ctx.reply(
          `خطا در ثبت تصویر گالری در گیت‌هاب:\n${errorMsg}`,
          { reply_markup: getMainMenuKeyboard() }
        );
      }
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

    if (state.step === "awaiting_upcoming_poster_photo") {
      const { sessionNumber, topicEn, topicFa, dateFa } = state.data;
      setBotState(userId, null);
      await ctx.reply("⏳ در حال آپلود و جایگزینی پوستر نشست در گیت‌هاب...", {
        reply_markup: getMainMenuKeyboard(),
      });

      try {
        const imgRes = await fetch(String(fileUrl));
        if (!imgRes.ok) throw new Error("خطا در دانلود فایل پوستر از تلگرام");
        const imageBuffer = await imgRes.arrayBuffer();

        const syncResult = await syncPosterToGitHub({
          sessionNumber: Number(sessionNumber),
          topicEn: String(topicEn || "English Public Discussion"),
          topicFa: String(topicFa || ""),
          dateFa: String(dateFa || ""),
          imageBuffer,
        });

        const posterRelPath = `/media/posters/poster-epd${sessionNumber}.jpg`;
        await addPoster({
          id: `poster-${sessionNumber}`,
          sessionNumber: Number(sessionNumber),
          topicEn: String(topicEn || "English Public Discussion"),
          dateFa: String(dateFa || ""),
          image: posterRelPath,
        });
        await updateUpcomingSession({
          number: Number(sessionNumber),
          posterImage: posterRelPath,
        });

        await ctx.reply(
          `پوستر جلسه ${sessionNumber} با موفقیت جایگزین شد و در گیت‌هاب ثبت گردید.\n\nسایت ظرف ۱ الی ۲ دقیقه آینده به‌روزرسانی می‌شود.\nشناسه کامیت: ${syncResult.commitSha.slice(0, 7)}`,
          { reply_markup: getMainMenuKeyboard() }
        );
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        await ctx.reply(`خطا در ثبت پوستر جدید:\n${errorMsg}`, {
          reply_markup: getMainMenuKeyboard(),
        });
      }
      return;
    }

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
  amountTomans?: number;
  refId?: string | number;
  paymentStatus?: string;
}) {
  const token = getBotToken();
  if (!token || token === "placeholder_token_for_build") {
    console.warn("TELEGRAM_BOT_TOKEN is not set; skipping admin notification");
    return;
  }

  const text =
    "ثبتنام جدید در وبسایت EPD\n\n" +
    `نام و نامخانوادگی: ${registration.fullName}\n` +
    `شماره تماس: ${registration.mobile}\n` +
    `ایمیل: ${registration.email}\n` +
    `سانس انتخابی: ${registration.sessionTitle}\n` +
    (registration.languageLevel ? `سطح زبان: ${registration.languageLevel}\n` : "") +
    (registration.amountTomans !== undefined ? `مبلغ ورودی: ${registration.amountTomans === 0 ? "رایگان" : registration.amountTomans.toLocaleString("fa-IR") + " تومان"}\n` : "") +
    (registration.refId ? `کد رهگیری شاپرک (RefID): ${registration.refId}\n` : "") +
    (registration.paymentStatus ? `وضعیت پرداخت: ${registration.paymentStatus}\n` : "") +
    (registration.topicSuggestion ? `موضوع پیشنهادی: ${registration.topicSuggestion}\n` : "") +
    `زمان ثبت: ${new Date().toLocaleTimeString("fa-IR")}`;

  const adminIds = getAdminIds();
  await Promise.allSettled(
    adminIds.map(async (adminId) => {
      try {
        const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: adminId,
            text,
          }),
        });
        if (!res.ok) {
          const errText = await res.text();
          console.error(`Failed to send notification to admin ${adminId}:`, errText);
        }
      } catch (err) {
        console.error(`Failed to send notification to admin ${adminId}:`, err);
      }
    })
  );
}
