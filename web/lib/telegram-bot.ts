import { Bot, InlineKeyboard, Keyboard } from "grammy";
import {
  getUpcomingSession,
  updateUpcomingSession,
  getSlots,
  updateSlot,
  addSlot,
  deleteSlot,
  getRegistrations,
  addRegistration,
  deleteRegistration,
  getPosters,
  addPoster,
  deletePoster,
  getGallery,
  deleteGalleryItem,
  getBotState,
  setBotState,
} from "./db";
import { requestZarinpalPayment } from "./zarinpal";
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
    .text("لیست ثبت‌نام‌ها")
    .text("مشخصات نشست جاری")
    .row()
    .text("مدیریت سانس‌ها و ظرفیت")
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

function getUserMainMenuKeyboard() {
  return new Keyboard()
    .webApp("رزرو صندلی (مینی‌اپ)", "https://epdcommunity.ir/miniapp")
    .row()
    .text("رزرو صندلی / ثبت‌نام")
    .row()
    .text("مشخصات نشست جاری")
    .text("ارتباط با پشتیبانی")
    .resized()
    .persistent();
}

function getUserCancelKeyboard() {
  return new Keyboard().text("لغو عملیات").resized().persistent();
}

function getUserPhoneKeyboard() {
  return new Keyboard()
    .requestContact("ارسال شماره موبایل")
    .row()
    .text("لغو عملیات")
    .resized()
    .persistent();
}

function cleanPhoneNumber(raw: string): string {
  const ascii = raw
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632))
    .replace(/[^\d+]/g, "");
  let phone = ascii;
  if (phone.startsWith("+98")) {
    phone = "0" + phone.slice(3);
  } else if (phone.startsWith("98") && phone.length === 12) {
    phone = "0" + phone.slice(2);
  }
  return phone;
}

async function formatUserSessionOverview(): Promise<string> {
  const session = await getUpcomingSession();
  const slots = await getSlots();
  let text = "باشگاه گفتگوی انگلیسی EPD مشهد\n\n";
  text += `نشست شماره ${session.number}: ${session.topicEn || ""}\n`;
  if (session.topicFa) text += `${session.topicFa}\n`;
  text += "\n";
  if (session.dateIso) {
    try {
      const d = new Date(session.dateIso);
      const faDate = !isNaN(d.getTime())
        ? new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
            weekday: "long",
            day: "numeric",
            month: "long",
          }).format(d)
        : session.dateIso;
      text += `تاریخ: ${faDate}\n`;
    } catch {
      text += `تاریخ: ${session.dateIso}\n`;
    }
  }
  if (session.timeFa) text += `ساعت: ${session.timeFa}\n`;
  text += `محل برگزاری: ${session.venueFa || "مشهد (کافه منتخب)"}\n`;
  const feeLabel = session.feeTomans
    ? `${session.feeTomans.toLocaleString("fa-IR")} تومان`
    : "رایگان";
  text += `مبلغ ورودی: ${feeLabel}\n`;
  text += `ظرفیت کل باقیمانده: ${session.remainingSeats.toLocaleString("fa-IR")} صندلی\n\n`;

  text += "سانس‌های فعال این هفته:\n";
  if (slots.length === 0) {
    text += "• هنوز سانسی تعریف نشده است.\n";
  } else {
    slots.forEach((s) => {
      const status = s.remainingSeats > 0 ? `${s.remainingSeats} صندلی خالی` : "تکمیل ظرفیت";
      const feeText =
        s.feeTomans !== undefined
          ? s.feeTomans === 0
            ? "رایگان"
            : `${s.feeTomans.toLocaleString("fa-IR")} تومان`
          : "";
      text += `• ${s.title} — ${status}${feeText ? ` (${feeText})` : ""}\n`;
    });
  }

  return text;
}

// ----------------------------------------------------
// BOT COMMANDS & HANDLERS
// ----------------------------------------------------

bot.command("start", async (ctx) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  setBotState(userId, null);

  if (isAdmin(userId)) {
    await ctx.reply(
      "پنل مدیریت باشگاه EPD\n\nبرای دسترسی به بخش‌های مختلف از دکمه‌های کیبورد زیر استفاده کنید:",
      { reply_markup: getMainMenuKeyboard() }
    );
  } else {
    const overview = await formatUserSessionOverview();
    await ctx.reply(
      `سلام! به ربات باشگاه گفتگوی انگلیسی EPD خوش آمدید.\n\n${overview}\nجهت حضور در این نشست، دکمه «رزرو صندلی / ثبت‌نام» را لمس کنید:`,
      { reply_markup: getUserMainMenuKeyboard() }
    );
  }
});

bot.command("cancel", async (ctx) => {
  const userId = ctx.from?.id;
  if (userId) setBotState(userId, null);
  const kb = isAdmin(userId) ? getMainMenuKeyboard() : getUserMainMenuKeyboard();
  await ctx.reply("عملیات جاری لغو شد.", {
    reply_markup: kb,
  });
});

bot.hears("لغو عملیات", async (ctx) => {
  const userId = ctx.from?.id;
  if (userId) setBotState(userId, null);
  const kb = isAdmin(userId) ? getMainMenuKeyboard() : getUserMainMenuKeyboard();
  await ctx.reply("عملیات جاری لغو شد.", {
    reply_markup: kb,
  });
});

bot.hears("بازگشت به منوی اصلی", async (ctx) => {
  const userId = ctx.from?.id;
  if (userId) setBotState(userId, null);
  const kb = isAdmin(userId) ? getMainMenuKeyboard() : getUserMainMenuKeyboard();
  await ctx.reply("منوی اصلی:", {
    reply_markup: kb,
  });
});

// ----------------------------------------------------
// MAIN MENU HEARS
// ----------------------------------------------------

function formatRegistrationsReport(
  regs: Awaited<ReturnType<typeof getRegistrations>>,
  slots: Awaited<ReturnType<typeof getSlots>>
): string {
  let text = `گزارش ثبت‌نام‌ها (تعداد کل: ${regs.length})\n\n`;
  const recent = regs.slice(0, 15);

  recent.forEach((r, idx) => {
    const slot = slots.find((s) => s.id === r.sessionId);
    const slotName = slot ? slot.title.split(":")[0] : r.sessionId;
    text += `${idx + 1}. ${r.fullName}\n`;
    text += `   شماره تماس: ${r.mobile}\n`;
    if (r.socialHandle) text += `   تلگرام: ${r.socialHandle}\n`;
    if (r.email) text += `   ایمیل: ${r.email}\n`;
    text += `   سانس: ${slotName}\n`;
    if (r.languageLevel) text += `   سطح زبان: ${r.languageLevel}\n`;

    let statusText = "ثبت‌نام رایگان";
    if (r.paymentStatus === "paid") {
      statusText = `پرداخت قطعی شاپرک (کد: ${r.paymentRefId || "تأییدشده"})`;
    } else if (r.paymentStatus === "pending") {
      statusText = "در انتظار پرداخت درگاه (تکمیل‌نشده)";
    } else if (r.paymentStatus === "failed") {
      statusText = "پرداخت لغوشده / ناموفق";
    }
    text += `   وضعیت: ${statusText}\n`;
    text += `   تاریخ: ${new Date(r.createdAt).toLocaleDateString("fa-IR")}\n\n`;
  });

  return text;
}

function getRegistrationsKeyboard(regs: Awaited<ReturnType<typeof getRegistrations>>): InlineKeyboard {
  const kb = new InlineKeyboard().text("به‌روزرسانی گزارش", "inline_refresh_registrations");
  if (regs.length > 0) {
    kb.row().text("حذف یکی از ثبت‌نام‌ها", "menu_delete_registration");
  }
  return kb;
}

// 1. Registrations List
bot.hears("لیست ثبت‌نام‌ها", async (ctx) => {
  const userId = ctx.from?.id;
  if (!isAdmin(userId)) return;

  const regs = await getRegistrations();
  const slots = await getSlots();

  if (regs.length === 0) {
    await ctx.reply("هنوز ثبت‌نامی در سیستم ثبت نشده است.", {
      reply_markup: getMainMenuKeyboard(),
    });
    return;
  }

  const text = formatRegistrationsReport(regs, slots);
  const kb = getRegistrationsKeyboard(regs);
  await ctx.reply(text, { reply_markup: kb });
});

// 2. Current Session Details
bot.hears("مشخصات نشست جاری", async (ctx) => {
  const userId = ctx.from?.id;
  if (!isAdmin(userId)) {
    const overview = await formatUserSessionOverview();
    await ctx.reply(overview, { reply_markup: getUserMainMenuKeyboard() });
    return;
  }

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

// 2.1 User Registration Flow Initiation
bot.hears("رزرو صندلی / ثبت‌نام", async (ctx) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  const session = await getUpcomingSession();
  const slots = await getSlots();
  const availableSlots = slots.filter((s) => s.remainingSeats > 0 && !s.isFull);

  if (availableSlots.length === 0 || session.remainingSeats <= 0) {
    await ctx.reply(
      "متأسفانه ظرفیت صندلی‌های نشست جاری به پایان رسیده است.\nاطلاعیه نشست‌های بعدی در کانال تلگرام @EPDCommunity اعلام خواهد شد.",
      { reply_markup: getUserMainMenuKeyboard() }
    );
    return;
  }

  setBotState(userId, { step: "user_reg_name", data: {} });
  await ctx.reply(
    "فرآیند رزرو صندلی در نشست EPD\n\nلطفاً نام و نام خانوادگی خود را به زبان فارسی یا انگلیسی وارد کنید:",
    { reply_markup: getUserCancelKeyboard() }
  );
});

// 2.2 User Support Contact
bot.hears("ارتباط با پشتیبانی", async (ctx) => {
  const text =
    "باشگاه گفتگوی انگلیسی EPD مشهد\n\n" +
    "کانال تلگرام:\n" +
    "\u200E@EPDCommunity\n\n" +
    "آیدی پشتیبانی:\n" +
    "\u200E@epdsupport\n\n" +
    "نشست‌های هفتگی گفتگوی آزاد در کافه‌های منتخب مشهد";

  await ctx.reply(text, { reply_markup: getUserMainMenuKeyboard() });
});

// 3. Manage Slots & Capacity (Add, Delete, Toggle)
bot.hears("مدیریت سانس‌ها و ظرفیت", async (ctx) => {
  const userId = ctx.from?.id;
  if (!isAdmin(userId)) return;

  const slots = await getSlots();
  const session = await getUpcomingSession();

  let text = "مدیریت سانس‌ها و ظرفیت صندلی‌ها:\n\n";
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
  let text = `مدیریت تصاویر گالری (تعداد کل عکس‌ها: ${gallery.length})\n\n`;
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
    "- با افزودن یا حذف سانس، لیست بلافاصله در فرم ثبت‌نام سایت آپدیت می‌شود.\n" +
    "- با آپلود پوستر، اطلاعات جلسه جدید روی صفحه اصلی و آرشیو مینشیند.\n" +
    "- با آپلود عکس گالری، تصویر همراه با برچسب شماره جلسه به گالری اضافه می‌شود.";

  await ctx.reply(text, { reply_markup: getMainMenuKeyboard() });
});

// ----------------------------------------------------
// INLINE CALLBACKS & ACTIONS
// ----------------------------------------------------

bot.callbackQuery("inline_refresh_registrations", async (ctx) => {
  await ctx.answerCallbackQuery("به‌روزرسانی شد");
  const regs = await getRegistrations();
  const slots = await getSlots();

  if (regs.length === 0) {
    await ctx.editMessageText("هنوز ثبت‌نامی در سیستم ثبت نشده است.");
    return;
  }

  const text = formatRegistrationsReport(regs, slots);
  const kb = getRegistrationsKeyboard(regs);
  await ctx.editMessageText(text, { reply_markup: kb });
});

bot.callbackQuery("menu_delete_registration", async (ctx) => {
  const userId = ctx.from?.id;
  if (!isAdmin(userId)) return;

  const regs = await getRegistrations();
  if (regs.length === 0) {
    await ctx.answerCallbackQuery("هیچ ثبت‌نامی در سیستم وجود ندارد.");
    return;
  }

  const kb = new InlineKeyboard();
  regs.slice(0, 10).forEach((r, idx) => {
    const shortName = r.fullName.length > 20 ? r.fullName.substring(0, 18) + "..." : r.fullName;
    kb.text(`حذف: ${idx + 1}. ${shortName}`, `del_ask_${r.id}`).row();
  });
  kb.text("بازگشت به گزارش", "inline_refresh_registrations");

  await ctx.editMessageText("ثبت‌نام مورد نظر برای حذف را انتخاب کنید:", {
    reply_markup: kb,
  });
  await ctx.answerCallbackQuery();
});

bot.callbackQuery(/^del_ask_(.+)$/, async (ctx) => {
  const userId = ctx.from?.id;
  if (!isAdmin(userId)) return;

  const regId = ctx.match[1];
  const regs = await getRegistrations();
  const target = regs.find((r) => r.id === regId);

  if (!target) {
    await ctx.answerCallbackQuery("ثبت‌نام مورد نظر یافت نشد.");
    return;
  }

  const kb = new InlineKeyboard()
    .text("بله، حذف شود", `del_confirm_${regId}`)
    .text("انصراف", "menu_delete_registration");

  await ctx.editMessageText(
    `آیا از حذف ثبت‌نام «${target.fullName}» (${target.mobile}) اطمینان دارید؟\n\nدر صورت تأیید، این رکورد به‌طور کامل از دیتابیس پاک شده و در صورت کسر صندلی، ظرفیت آزاد خواهد شد.`,
    { reply_markup: kb }
  );
  await ctx.answerCallbackQuery();
});

bot.callbackQuery(/^del_confirm_(.+)$/, async (ctx) => {
  const userId = ctx.from?.id;
  if (!isAdmin(userId)) return;

  const regId = ctx.match[1];
  const regs = await getRegistrations();
  const target = regs.find((r) => r.id === regId);
  const targetName = target ? target.fullName : "کاربر";

  await deleteRegistration(regId);
  await ctx.answerCallbackQuery("ثبت‌نام حذف شد.");

  const updatedRegs = await getRegistrations();
  const slots = await getSlots();

  if (updatedRegs.length === 0) {
    await ctx.editMessageText(
      `ثبت‌نام «${targetName}» با موفقیت حذف شد.\n\nدر حال حاضر هیچ ثبت‌نام دیگری وجود ندارد.`
    );
    return;
  }

  const text = formatRegistrationsReport(updatedRegs, slots);
  const kb = getRegistrationsKeyboard(updatedRegs);

  await ctx.editMessageText(
    `ثبت‌نام «${targetName}» با موفقیت حذف شد.\n\n${text}`,
    { reply_markup: kb }
  );
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

  let text = "مدیریت سانس‌ها و ظرفیت صندلی‌ها (به‌روزرسانی شد):\n\n";
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

  let text = "مدیریت سانس‌ها و ظرفیت صندلی‌ها (سانس حذف شد):\n\n";
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
  await ctx.reply("تعداد صندلی‌های باقیمانده را به صورت عدد ارسال کنید (مثال: 8):", {
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
// USER REGISTRATION CALLBACKS
// ----------------------------------------------------

bot.callbackQuery(/^user_slot_(.+)$/, async (ctx) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  const slotId = ctx.match[1];
  const state = getBotState(userId);
  if (!state || state.step !== "user_reg_slot") {
    await ctx.answerCallbackQuery({ text: "مراحل ثبت‌نام منقضی شده است. لطفاً مجدداً شروع کنید." });
    return;
  }

  const slots = await getSlots();
  const slot = slots.find((s) => s.id === slotId);
  if (!slot || slot.remainingSeats <= 0 || slot.isFull) {
    await ctx.answerCallbackQuery({ text: "متأسفانه ظرفیت این سانس تکمیل شده است." });
    return;
  }

  setBotState(userId, {
    step: "user_reg_level",
    data: {
      ...state.data,
      slotId: slot.id,
      slotTitle: slot.title,
    },
  });

  const levelKb = new InlineKeyboard()
    .text("مبتدی (Beginner)", "user_lvl_beginner")
    .row()
    .text("متوسط (Intermediate)", "user_lvl_intermediate")
    .row()
    .text("پیشرفته (Advanced)", "user_lvl_advanced")
    .row()
    .text("لغو عملیات", "user_cancel_reg");

  await ctx.answerCallbackQuery();
  await ctx.editMessageText(
    `سانس انتخابی: ${slot.title}\n\nلطفاً سطح تقریبی تسلط خود به مکالمه انگلیسی را انتخاب کنید:`,
    { reply_markup: levelKb }
  );
});

bot.callbackQuery(/^user_lvl_(.+)$/, async (ctx) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  const level = ctx.match[1];
  const state = getBotState(userId);
  if (!state || state.step !== "user_reg_level") {
    await ctx.answerCallbackQuery({ text: "مراحل ثبت‌نام منقضی شده است. لطفاً مجدداً شروع کنید." });
    return;
  }

  const fullName = String(state.data.fullName || "");
  const mobile = String(state.data.mobile || "");
  const slotId = String(state.data.slotId || "");

  const session = await getUpcomingSession();
  const slots = await getSlots();
  const slot = slots.find((s) => s.id === slotId);

  if (!slot || slot.remainingSeats <= 0 || slot.isFull) {
    setBotState(userId, null);
    await ctx.answerCallbackQuery({ text: "متأسفانه ظرفیت این سانس تکمیل شده است." });
    await ctx.editMessageText("متأسفانه ظرفیت این سانس به پایان رسیده است.");
    return;
  }

  const feeTomans =
    slot.feeTomans !== undefined ? slot.feeTomans : (session.feeTomans ?? 0);

  const socialHandle = ctx.from?.username
    ? `@${ctx.from.username}`
    : `tg_${userId}`;

  const levelFaMap: Record<string, string> = {
    beginner: "مبتدی",
    intermediate: "متوسط",
    advanced: "پیشرفته",
  };
  const levelFa = levelFaMap[level] || level;

  // FREE REGISTRATION (Fee = 0)
  if (feeTomans <= 0) {
    setBotState(userId, null);
    try {
      const reg = await addRegistration({
        fullName,
        mobile,
        sessionId: slot.id,
        languageLevel: level as "beginner" | "intermediate" | "advanced",
        socialHandle,
        paymentStatus: "free",
        amountTomans: 0,
      });

      await ctx.answerCallbackQuery({ text: "ثبت‌نام شما با موفقیت تأیید شد!" });

      const ticketText =
        "ثبت‌نام شما با موفقیت قطعی شد!\n\n" +
        `کد پیگیری: ${reg.id}\n` +
        `نام و نام خانوادگی: ${fullName}\n` +
        `شماره تماس: ${mobile}\n` +
        `شناسه تلگرام:\n\u200E${socialHandle}\n` +
        `نشست: جلسه ${session.number} (${session.topicEn || ""})\n` +
        `سانس: ${slot.title}\n` +
        `سطح زبان: ${levelFa}\n` +
        `محل برگزاری: ${session.venueFa || "مشهد"}\n` +
        `مبلغ ورودی: رایگان\n\n` +
        "صندلی شما رزرو شد؛ منتظر دیدارتان در این رویداد هستیم!";

      await ctx.editMessageText(ticketText);
      await ctx.reply("برای مشاهده مشخصات نشست یا ارتباط با تیم، از منوی زیر استفاده کنید:", {
        reply_markup: getUserMainMenuKeyboard(),
      });

      // Notify Admins
      await notifyAdminsNewRegistration({
        fullName,
        mobile,
        socialHandle,
        sessionTitle: `جلسه ${session.number} — ${slot.title}`,
        languageLevel: levelFa,
        amountTomans: 0,
        paymentStatus: "ثبت‌نام قطعی (رایگان از طریق ربات تلگرام)",
      });
    } catch (err) {
      console.error("Bot free registration error:", err);
      await ctx.answerCallbackQuery({ text: "خطایی رخ داد." });
      await ctx.editMessageText("متأسفانه در ثبت اطلاعات خطایی رخ داد. لطفاً با پشتیبانی در ارتباط باشید.");
    }
    return;
  }

  // PAID REGISTRATION (Fee > 0)
  try {
    const callbackUrl = "https://epdcommunity.ir/api/payment/callback/";
    const zarin = await requestZarinpalPayment({
      amountTomans: feeTomans,
      description: `ثبت‌نام نشست ${session.number} EPD - ${fullName}`,
      callbackUrl,
      mobile,
    });

    if (!zarin.success || !zarin.paymentUrl || !zarin.authority) {
      setBotState(userId, null);
      await ctx.answerCallbackQuery({ text: "خطا در اتصال به درگاه بانکی." });
      await ctx.editMessageText(
        `خطا در برقراری ارتباط با درگاه پرداخت شاپرک:\n${zarin.error || "خطای ناشناخته"}\n\nلطفاً دقایقی دیگر مجدداً تلاش کنید.`
      );
      await ctx.reply("منوی اصلی EPD:", { reply_markup: getUserMainMenuKeyboard() });
      return;
    }

    // Save pending registration
    await addRegistration({
      fullName,
      mobile,
      sessionId: slot.id,
      languageLevel: level as "beginner" | "intermediate" | "advanced",
      socialHandle,
      paymentStatus: "pending",
      paymentAuthority: zarin.authority,
      amountTomans: feeTomans,
    });

    setBotState(userId, null);
    await ctx.answerCallbackQuery({ text: "لینک پرداخت شاپرک آماده شد." });

    const payKb = new InlineKeyboard()
      .url(`پرداخت درگاه شاپرک (${feeTomans.toLocaleString("fa-IR")} تومان)`, zarin.paymentUrl)
      .row()
      .text("لغو و بازگشت", "user_cancel_reg");

    const payText =
      "صندلی شما به مدت ۱۵ دقیقه رزرو موقت شد.\n\n" +
      `نام: ${fullName}\n` +
      `نشست: جلسه ${session.number} (${slot.title})\n` +
      `مبلغ ورودی: ${feeTomans.toLocaleString("fa-IR")} تومان\n\n` +
      "جهت قطعی شدن رزرو، روی دکمه زیر کلیک کرده و پرداخت خود را انجام دهید:";

    await ctx.editMessageText(payText, { reply_markup: payKb });
    await ctx.reply("پس از پرداخت موفقیت‌آمیز درگاه شاپرک، صندلی شما به صورت خودکار قطعی خواهد شد.", {
      reply_markup: getUserMainMenuKeyboard(),
    });
  } catch (err) {
    console.error("Bot payment registration error:", err);
    await ctx.answerCallbackQuery({ text: "خطا در پرداخت." });
    await ctx.editMessageText("متأسفانه در اتصال به درگاه پرداخت مشکلی پیش آمد.");
  }
});

bot.callbackQuery("user_cancel_reg", async (ctx) => {
  const userId = ctx.from?.id;
  if (userId) setBotState(userId, null);
  await ctx.answerCallbackQuery({ text: "ثبت‌نام لغو شد." });
  await ctx.editMessageText("فرآیند ثبت‌نام لغو شد.");
  const kb = isAdmin(userId) ? getMainMenuKeyboard() : getUserMainMenuKeyboard();
  await ctx.reply("منوی اصلی باشگاه EPD:", {
    reply_markup: kb,
  });
});

async function handleUserMobileSubmitted(
  ctx: {
    reply: (text: string, other?: Record<string, unknown>) => Promise<unknown>;
  },
  userId: number,
  state: { step: string; data: Record<string, unknown> },
  phone: string
) {
  if (!/^09\d{9}$/.test(phone)) {
    await ctx.reply(
      "شماره موبایل نامعتبر است. لطفاً یک شماره ۱۱ رقمی معتبر با پیش‌شماره ۰۹ (مثال: 09151234567) وارد کنید یا دکمه «ارسال شماره موبایل» را لمس کنید:"
    );
    return;
  }

  const slots = await getSlots();
  const availableSlots = slots.filter((s) => s.remainingSeats > 0 && !s.isFull);
  if (availableSlots.length === 0) {
    setBotState(userId, null);
    await ctx.reply("متأسفانه در این لحظه ظرفیت تمام سانس‌ها تکمیل شد.", {
      reply_markup: getUserMainMenuKeyboard(),
    });
    return;
  }

  setBotState(userId, {
    step: "user_reg_slot",
    data: { ...state.data, mobile: phone },
  });

  const inline = new InlineKeyboard();
  availableSlots.forEach((s) => {
    const feeText =
      s.feeTomans !== undefined
        ? s.feeTomans === 0
          ? "رایگان"
          : `${s.feeTomans.toLocaleString("fa-IR")} ت`
        : "";
    const label = `${s.title} (${s.remainingSeats} صندلی ${feeText ? `• ${feeText}` : ""})`;
    inline.text(label, `user_slot_${s.id}`).row();
  });
  inline.text("لغو عملیات", "user_cancel_reg");

  await ctx.reply(
    `شماره تماس تأیید شد: ${phone}\n\nلطفاً یکی از سانس‌های زیر را برای شرکت در رویداد انتخاب کنید:`,
    {
      reply_markup: inline,
    }
  );
}

// ----------------------------------------------------
// MESSAGE & CONVERSATION HANDLER
// ----------------------------------------------------

bot.on("message:contact", async (ctx) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  const state = getBotState(userId);
  if (state?.step === "user_reg_mobile") {
    const raw = ctx.message.contact.phone_number;
    const phone = cleanPhoneNumber(raw);
    await handleUserMobileSubmitted(ctx, userId, state, phone);
  }
});

bot.on("message:text", async (ctx) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  const state = getBotState(userId);
  const text = ctx.message.text.trim();
  if (text === "لغو عملیات" || text === "/cancel") {
    setBotState(userId, null);
    const kb = isAdmin(userId) ? getMainMenuKeyboard() : getUserMainMenuKeyboard();
    await ctx.reply("عملیات لغو شد.", { reply_markup: kb });
    return;
  }

  // Handle user registration text steps
  if (state?.step === "user_reg_name") {
    if (text.length < 3 || text.length > 70) {
      await ctx.reply("لطفاً نام و نام خانوادگی معتبر (بین ۳ تا ۷۰ حرف) وارد کنید:");
      return;
    }
    setBotState(userId, {
      step: "user_reg_mobile",
      data: { fullName: text },
    });
    await ctx.reply(
      "لطفاً شماره موبایل خود را وارد کنید (یا دکمه «ارسال شماره موبایل» زیر را بزنید):",
      { reply_markup: getUserPhoneKeyboard() }
    );
    return;
  }

  if (state?.step === "user_reg_mobile") {
    const phone = cleanPhoneNumber(text);
    await handleUserMobileSubmitted(ctx, userId, state, phone);
    return;
  }

  if (!isAdmin(userId)) return;
  if (!state) return;

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
  socialHandle?: string;
  email?: string;
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
    "ثبت‌نام جدید در وبسایت EPD\n\n" +
    `نام و نام‌خانوادگی: ${registration.fullName}\n` +
    `شماره تماس: ${registration.mobile}\n` +
    (registration.socialHandle ? `شناسه تلگرام: ${registration.socialHandle}\n` : "") +
    (registration.email ? `ایمیل: ${registration.email}\n` : "") +
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
