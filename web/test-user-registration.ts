import assert from "node:assert";
import { bot } from "./lib/telegram-bot";
import {
  getUpcomingSession,
  getSlots,
  getRegistrations,
  getBotState,
  setBotState,
  addSlot,
} from "./lib/db";

console.log("==================================================");
console.log("TESTING TELEGRAM BOT USER REGISTRATION FLOW");
console.log("==================================================\n");

// Store all outbound API calls made by grammY bot
interface OutgoingCall {
  method: string;
  payload: Record<string, any>;
}
const normalUserId = 77889911;
const mockChat = { id: normalUserId, type: "private" as const, first_name: "Sara" };
const outgoingCalls: OutgoingCall[] = [];

// Install grammY transformer to intercept outbound Telegram calls
bot.api.config.use(async (prev, method, payload, signal) => {
  outgoingCalls.push({ method, payload: payload as Record<string, any> });
  if (method === "getMe") {
    return { ok: true, result: { id: 123456, is_bot: true, first_name: "EPD Bot", username: "EPDCommunityBot" } } as any;
  }
  if (method === "sendMessage") {
    return { ok: true, result: { message_id: Math.floor(Math.random() * 10000), date: Date.now(), chat: { id: (payload as any).chat_id, type: "private" }, text: (payload as any).text } } as any;
  }
  if (method === "editMessageText") {
    return { ok: true, result: { message_id: (payload as any).message_id || 1, date: Date.now(), chat: { id: (payload as any).chat_id, type: "private" }, text: (payload as any).text } } as any;
  }
  if (method === "answerCallbackQuery") {
    return { ok: true, result: true } as any;
  }
  return { ok: true, result: true } as any;
});

async function runRegistrationTests() {
  const normalUserId = 77889911; // Non-admin user ID
  let updateIdCounter = 100;

  // Find or create a free test slot (fee = 0)
  const currentSlots = await getSlots();
  let freeTestSlot = currentSlots.find((s) => s.remainingSeats > 0 && (!s.feeTomans || s.feeTomans === 0));
  if (!freeTestSlot) {
    const slotId = "slot-free-" + Date.now();
    await addSlot({
      id: slotId,
      title: "سانس تست رایگان",
      capacity: 10,
      remainingSeats: 10,
      isFull: false,
      feeTomans: 0,
      feeFa: "رایگان",
    });
    const updated = await getSlots();
    freeTestSlot = updated.find((s) => s.id === slotId)!;
  }
  const testSlot = freeTestSlot;

  // Initialize grammY bot info
  await bot.init();

  // --------------------------------------------------------------------------
  // TEST 1: Non-Admin /start Command
  // --------------------------------------------------------------------------
  console.log("-> [Test 1] Regular user triggers /start...");
  outgoingCalls.length = 0;
  await bot.handleUpdate({
    update_id: ++updateIdCounter,
    message: {
      message_id: 1,
      date: Math.floor(Date.now() / 1000),
      chat: mockChat,
      from: { id: normalUserId, is_bot: false, first_name: "Sara", username: "sara_dev" },
      text: "/start",
      entities: [{ type: "bot_command", offset: 0, length: 6 }],
    },
  });

  const startMsg = outgoingCalls.find((c) => c.method === "sendMessage");
  console.log("Calls captured:", outgoingCalls.length, outgoingCalls);
  assert(startMsg, "Bot must send a reply to /start");
  assert(startMsg.payload.text.includes("باشگاه گفتگوی انگلیسی EPD"), "Welcome message must include club title");
  assert(startMsg.payload.reply_markup?.keyboard, "Must provide user reply keyboard");
  const buttons = startMsg.payload.reply_markup.keyboard.flat().map((b: any) => b.text);
  assert(buttons.includes("رزرو صندلی / ثبت‌نام"), "Must have reservation button");
  assert(buttons.includes("مشخصات نشست جاری"), "Must have session details button");
  assert(buttons.includes("ارتباط با پشتیبانی"), "Must have support button");
  console.log("  ✓ /start verified: Shows session card and user menu.\n");

  // --------------------------------------------------------------------------
  // TEST 2: «مشخصات نشست جاری» and «ارتباط با پشتیبانی» Buttons
  // --------------------------------------------------------------------------
  console.log("-> [Test 2] Regular user taps «مشخصات نشست جاری» & «ارتباط با پشتیبانی»...");
  outgoingCalls.length = 0;
  await bot.handleUpdate({
    update_id: ++updateIdCounter,
    message: {
      message_id: 2,
      date: Math.floor(Date.now() / 1000),
      chat: mockChat,
      from: { id: normalUserId, is_bot: false, first_name: "Sara" },
      text: "مشخصات نشست جاری",
    },
  });
  const sessionMsg = outgoingCalls.find((c) => c.method === "sendMessage");
  assert(sessionMsg && sessionMsg.payload.text.includes("نشست شماره"), "Must show session number");

  outgoingCalls.length = 0;
  await bot.handleUpdate({
    update_id: ++updateIdCounter,
    message: {
      message_id: 3,
      date: Math.floor(Date.now() / 1000),
      chat: mockChat,
      from: { id: normalUserId, is_bot: false, first_name: "Sara" },
      text: "ارتباط با پشتیبانی",
    },
  });
  const supportMsg = outgoingCalls.find((c) => c.method === "sendMessage");
  assert(supportMsg && supportMsg.payload.text.includes("@EPDCommunity"), "Must show support channel");
  assert(supportMsg && supportMsg.payload.text.includes("@epdsupport"), "Must show support handle");
  assert(!supportMsg.payload.text.includes("@say_alireza"), "Must not include personal handle");
  console.log("  ✓ Information buttons verified successfully.\n");

  // --------------------------------------------------------------------------
  // TEST 3: Initiate Registration -> Step 1: Full Name
  // --------------------------------------------------------------------------
  console.log("-> [Test 3] Regular user taps «رزرو صندلی / ثبت‌نام»...");
  outgoingCalls.length = 0;
  await bot.handleUpdate({
    update_id: ++updateIdCounter,
    message: {
      message_id: 4,
      date: Math.floor(Date.now() / 1000),
      chat: mockChat,
      from: { id: normalUserId, is_bot: false, first_name: "Sara" },
      text: "رزرو صندلی / ثبت‌نام",
    },
  });

  const state1 = getBotState(normalUserId);
  assert.strictEqual(state1?.step, "user_reg_name", "State must be user_reg_name");
  const namePrompt = outgoingCalls.find((c) => c.method === "sendMessage");
  assert(namePrompt && namePrompt.payload.text.includes("نام و نام خانوادگی"), "Must prompt for full name");
  console.log("  ✓ Reservation initiated: State transitioned to user_reg_name.\n");

  // --------------------------------------------------------------------------
  // TEST 4: Validation on Name (Too short) -> Then valid name
  // --------------------------------------------------------------------------
  console.log("-> [Test 4] Testing Name Validation...");
  // Send 1 char (too short)
  outgoingCalls.length = 0;
  await bot.handleUpdate({
    update_id: ++updateIdCounter,
    message: {
      message_id: 5,
      date: Math.floor(Date.now() / 1000),
      chat: mockChat,
      from: { id: normalUserId, is_bot: false, first_name: "Sara" },
      text: "ع",
    },
  });
  const errShortName = outgoingCalls.find((c) => c.method === "sendMessage");
  assert(errShortName && errShortName.payload.text.includes("معتبر"), "Must reject name with fewer than 3 chars");

  // Send valid name:
  outgoingCalls.length = 0;
  await bot.handleUpdate({
    update_id: ++updateIdCounter,
    message: {
      message_id: 7,
      date: Math.floor(Date.now() / 1000),
      chat: mockChat,
      from: { id: normalUserId, is_bot: false, first_name: "Sara" },
      text: "سارا احمدی",
    },
  });

  const state2 = getBotState(normalUserId);
  assert.strictEqual(state2?.step, "user_reg_mobile", "State must advance to user_reg_mobile");
  assert.strictEqual(state2?.data.fullName, "سارا احمدی", "Saved full name must match");
  console.log("  ✓ Name validated and saved: State transitioned to user_reg_mobile.\n");

  // --------------------------------------------------------------------------
  // TEST 5: Phone Validation (Invalid phone -> Valid phone with Persian digits)
  // --------------------------------------------------------------------------
  console.log("-> [Test 5] Testing Mobile Validation & Persian Digit Normalization...");
  outgoingCalls.length = 0;
  await bot.handleUpdate({
    update_id: ++updateIdCounter,
    message: {
      message_id: 8,
      date: Math.floor(Date.now() / 1000),
      chat: mockChat,
      from: { id: normalUserId, is_bot: false, first_name: "Sara" },
      text: "0912345", // too short
    },
  });
  const errPhone = outgoingCalls.find((c) => c.method === "sendMessage");
  assert(errPhone && errPhone.payload.text.includes("شماره موبایل نامعتبر"), "Must reject invalid phone");

  // Valid phone typed with Persian digits
  outgoingCalls.length = 0;
  await bot.handleUpdate({
    update_id: ++updateIdCounter,
    message: {
      message_id: 9,
      date: Math.floor(Date.now() / 1000),
      chat: mockChat,
      from: { id: normalUserId, is_bot: false, first_name: "Sara" },
      text: "۰۹۱۵۱۲۳۴۵۶۷",
    },
  });

  const state3 = getBotState(normalUserId);
  assert.strictEqual(state3?.step, "user_reg_slot", "State must advance to user_reg_slot");
  assert.strictEqual(state3?.data.mobile, "09151234567", "Phone must be normalized to ASCII standard");
  const slotsMsg = outgoingCalls.find((c) => c.method === "sendMessage");
  assert(slotsMsg && slotsMsg.payload.reply_markup?.inline_keyboard, "Must present slots inline keyboard");
  console.log("  ✓ Mobile number normalized & validated: Slots inline keyboard presented.\n");

  // --------------------------------------------------------------------------
  // TEST 6: Slot Selection via Inline Keyboard Callback
  // --------------------------------------------------------------------------
  console.log(`-> [Test 6] User taps slot inline button: user_slot_${testSlot.id}...`);
  outgoingCalls.length = 0;
  await bot.handleUpdate({
    update_id: ++updateIdCounter,
    callback_query: {
      id: "cb_1",
      from: { id: normalUserId, is_bot: false, first_name: "Sara" },
      message: { message_id: 10, date: Math.floor(Date.now() / 1000), chat: mockChat, text: "انتخاب سانس" },
      chat_instance: "inst1",
      data: `user_slot_${testSlot.id}`,
    },
  });

  const state4 = getBotState(normalUserId);
  assert.strictEqual(state4?.step, "user_reg_level", "State must advance to user_reg_level");
  assert.strictEqual(state4?.data.slotId, testSlot.id, "Selected slot ID must match");
  const editLevelMsg = outgoingCalls.find((c) => c.method === "editMessageText");
  assert(editLevelMsg && editLevelMsg.payload.reply_markup?.inline_keyboard, "Must present English level inline keyboard");
  console.log("  ✓ Slot selected: Language level keyboard displayed.\n");

  // --------------------------------------------------------------------------
  // TEST 7: English Level Selection & Final Confirmation
  // --------------------------------------------------------------------------
  console.log("-> [Test 7] User taps language level button: user_lvl_intermediate...");
  const initialRemaining = testSlot.remainingSeats;
  outgoingCalls.length = 0;

  await bot.handleUpdate({
    update_id: ++updateIdCounter,
    callback_query: {
      id: "cb_2",
      from: { id: normalUserId, is_bot: false, first_name: "Sara", username: "sara_dev" },
      message: { message_id: 10, date: Math.floor(Date.now() / 1000), chat: mockChat, text: "انتخاب سطح" },
      chat_instance: "inst1",
      data: "user_lvl_intermediate",
    },
  });

  // State should be cleared
  const finalState = getBotState(normalUserId);
  assert.strictEqual(finalState, null, "Bot state must be cleared after completion");

  // Confirmation ticket message should be edited into the inline message
  const ticketMsg = outgoingCalls.find((c) => c.method === "editMessageText");
  assert(ticketMsg && ticketMsg.payload.text.includes("ثبت‌نام شما با موفقیت قطعی شد"), "Ticket receipt must be displayed");
  assert(ticketMsg.payload.text.includes("سارا احمدی"), "Must display registrant name");
  assert(ticketMsg.payload.text.includes("09151234567"), "Must display phone number");

  // Verify registration record exists in DB
  const regs = await getRegistrations();
  const createdReg = regs.find((r) => r.mobile === "09151234567" && r.fullName === "سارا احمدی");
  assert(createdReg, "Registration must exist in database");
  assert.strictEqual(createdReg.languageLevel, "intermediate", "Language level must be recorded");

  // Verify remaining seats decremented
  const slotsAfter = await getSlots();
  const slotAfter = slotsAfter.find((s) => s.id === testSlot.id);
  assert(slotAfter, "Slot must still exist");
  assert.strictEqual(slotAfter.remainingSeats, initialRemaining - 1, "Remaining seats must be decremented by 1");

  console.log("  ✓ Registration completed: Ticket displayed, DB record inserted, seat count decremented.\n");

  // --------------------------------------------------------------------------
  // TEST 8: Cancellation Flow (/cancel and user_cancel_reg)
  // --------------------------------------------------------------------------
  console.log("-> [Test 8] Testing Cancellation Handling...");
  // Start flow again
  await bot.handleUpdate({
    update_id: ++updateIdCounter,
    message: {
      message_id: 11,
      date: Math.floor(Date.now() / 1000),
      chat: mockChat,
      from: { id: normalUserId, is_bot: false, first_name: "Sara" },
      text: "رزرو صندلی / ثبت‌نام",
    },
  });
  assert.strictEqual(getBotState(normalUserId)?.step, "user_reg_name");

  // Send /cancel
  outgoingCalls.length = 0;
  await bot.handleUpdate({
    update_id: ++updateIdCounter,
    message: {
      message_id: 12,
      date: Math.floor(Date.now() / 1000),
      chat: mockChat,
      from: { id: normalUserId, is_bot: false, first_name: "Sara" },
      text: "/cancel",
      entities: [{ type: "bot_command", offset: 0, length: 7 }],
    },
  });
  assert.strictEqual(getBotState(normalUserId), null, "State must be reset after /cancel");
  const cancelMsg = outgoingCalls.find((c) => c.method === "sendMessage");
  assert(cancelMsg && cancelMsg.payload.text.includes("لغو شد"), "Must confirm cancellation");
  console.log("  ✓ Cancellation flow verified successfully.\n");

  console.log("==================================================");
  console.log("ALL 8 BOT REGISTRATION TEST SUITES PASSED! (100% OK)");
  console.log("==================================================");
}

runRegistrationTests().catch((err) => {
  console.error("\n❌ TEST FAILED:", err);
  process.exit(1);
});
