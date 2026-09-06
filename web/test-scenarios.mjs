import assert from "assert";
import {
  getUpcomingSession,
  updateUpcomingSession,
  getSlots,
  addSlot,
  updateSlot,
  deleteSlot,
  getRegistrations,
  addRegistration,
  getPosters,
  addPoster,
  deletePoster,
  getGallery,
  addGalleryItem,
  deleteGalleryItem,
  getBotState,
  setBotState,
} from "./lib/db.ts";

console.log("==================================================");
console.log("STARTING COMPREHENSIVE BOT & DATABASE TEST RUN");
console.log("==================================================\n");

async function runTests() {
  const adminId = 96092687;

  // ----------------------------------------------------
  // TEST 1: Session Details & Edit Flow
  // ----------------------------------------------------
  console.log("-> [Test 1] Testing Session Details & Updates...");
  const initialSession = await getUpcomingSession();
  assert(initialSession.number !== undefined, "Initial session must have a number");

  await updateUpcomingSession({
    number: 14,
    topicEn: "Digital Minimalism",
    topicFa: "مینیمالیسم دیجیتال و تمرکز",
    remainingSeats: 10,
    venueFa: "مشهد، بلوار سجاد",
  });

  const updatedSession = await getUpcomingSession();
  assert.strictEqual(updatedSession.number, 14, "Session number should be 14");
  assert.strictEqual(updatedSession.topicEn, "Digital Minimalism", "Topic EN should match");
  assert.strictEqual(updatedSession.remainingSeats, 10, "Remaining seats should be 10");
  console.log("  ✓ Session details updated and verified successfully.");

  // ----------------------------------------------------
  // TEST 2: Slots CRUD & Capacity Control
  // ----------------------------------------------------
  console.log("\n-> [Test 2] Testing Slots Management (Add, Toggle, Delete)...");
  const initialSlots = await getSlots();
  const initialCount = initialSlots.length;

  // 2.1 Add slot
  const testSlotId = "slot-test-" + Date.now();
  await addSlot({
    id: testSlotId,
    title: "سانس آزمایشی: سهشنبه ساعت ۱۸",
    capacity: 12,
    remainingSeats: 12,
    isFull: false,
  });

  const slotsAfterAdd = await getSlots();
  assert.strictEqual(slotsAfterAdd.length, initialCount + 1, "Slot count should increment by 1");
  const addedSlot = slotsAfterAdd.find((s) => s.id === testSlotId);
  assert(addedSlot, "Added slot should exist");
  assert.strictEqual(addedSlot.capacity, 12, "Capacity should be 12");
  console.log("  ✓ Added new slot successfully.");

  // 2.2 Toggle slot (close it)
  await updateSlot(testSlotId, { isFull: true, remainingSeats: 0 });
  const slotsAfterToggle = await getSlots();
  const toggledSlot = slotsAfterToggle.find((s) => s.id === testSlotId);
  assert(toggledSlot, "Toggled slot should exist");
  assert.strictEqual(toggledSlot.isFull, true, "Slot should be marked isFull = true");
  assert.strictEqual(toggledSlot.remainingSeats, 0, "Remaining seats should be 0 when closed");
  console.log("  ✓ Toggled slot capacity (closed) successfully.");

  // 2.3 Delete slot
  const deleted = await deleteSlot(testSlotId);
  assert(deleted, "deleteSlot should return true");
  const slotsAfterDelete = await getSlots();
  assert.strictEqual(slotsAfterDelete.length, initialCount, "Slot count should return to initial");
  assert(!slotsAfterDelete.some((s) => s.id === testSlotId), "Deleted slot should not exist");
  console.log("  ✓ Deleted slot successfully.");

  // ----------------------------------------------------
  // TEST 3: Poster Upload & Management Flow
  // ----------------------------------------------------
  console.log("\n-> [Test 3] Testing Poster Upload & Delete Flow...");
  const testPosterId = "poster-test-" + Date.now();

  await addPoster({
    id: testPosterId,
    sessionNumber: 15,
    topicEn: "Atomic Habits",
    dateFa: "پنجشنبه ۹ شهریور",
    image: "https://example.com/poster-15.jpg",
  });

  const postersAfterAdd = await getPosters();
  const addedPoster = postersAfterAdd.find((p) => p.id === testPosterId);
  assert(addedPoster, "Poster should be added to archive");
  assert.strictEqual(addedPoster.sessionNumber, 15, "Poster session number should be 15");
  console.log("  ✓ Poster added to archive successfully.");

  // Delete poster
  await deletePoster(testPosterId);
  const postersAfterDelete = await getPosters();
  assert(!postersAfterDelete.some((p) => p.id === testPosterId), "Deleted poster should not exist");
  console.log("  ✓ Poster deleted successfully.");

  // ----------------------------------------------------
  // TEST 4: Gallery Photo Upload & Management Flow
  // ----------------------------------------------------
  console.log("\n-> [Test 4] Testing Gallery Upload with Session Tag & Delete...");
  const testGalleryId = "gallery-test-" + Date.now();

  await addGalleryItem({
    id: testGalleryId,
    sessionNumber: 14,
    image: "https://example.com/gallery-14-01.jpg",
  });

  const galleryAfterAdd = await getGallery();
  const addedGallery = galleryAfterAdd.find((g) => g.id === testGalleryId);
  assert(addedGallery, "Gallery photo should be added");
  assert.strictEqual(addedGallery.sessionNumber, 14, "Gallery photo session number should be 14");
  console.log("  ✓ Gallery photo added with session number tag successfully.");

  // Delete gallery item
  await deleteGalleryItem(testGalleryId);
  const galleryAfterDelete = await getGallery();
  assert(!galleryAfterDelete.some((g) => g.id === testGalleryId), "Deleted gallery photo should not exist");
  console.log("  ✓ Gallery photo deleted successfully.");

  // ----------------------------------------------------
  // TEST 5: Registration & Auto-Capacity Decrement Flow
  // ----------------------------------------------------
  console.log("\n-> [Test 5] Testing Registration & Capacity Auto-Decrement...");
  const targetSlot = slotsAfterDelete[0];
  const prevSlotSeats = targetSlot.remainingSeats;

  const newReg = await addRegistration({
    fullName: "علیرضا تستی",
    mobile: "09120000000",
    email: "test@epdcommunity.ir",
    sessionId: targetSlot.id,
    languageLevel: "intermediate",
    firstTime: true,
    topicSuggestion: "Leadership in Tech",
  });

  assert(newReg.id, "Registration must receive an ID");
  const allRegs = await getRegistrations();
  assert(allRegs.some((r) => r.id === newReg.id), "Registration must be stored in database");

  const slotAfterReg = (await getSlots()).find((s) => s.id === targetSlot.id);
  assert(slotAfterReg, "Target slot should exist");
  assert.strictEqual(slotAfterReg.remainingSeats, prevSlotSeats - 1, "Slot seats must decrement by 1");
  console.log("  ✓ Registration saved and seat capacity auto-decremented successfully.");

  // ----------------------------------------------------
  // TEST 6: Bot State Machine & Cancel Flow
  // ----------------------------------------------------
  console.log("\n-> [Test 6] Testing Bot State Machine & Cancel Flow...");
  setBotState(adminId, { step: "awaiting_new_slot_title", data: {} });
  assert.strictEqual(getBotState(adminId)?.step, "awaiting_new_slot_title", "State must be set");

  setBotState(adminId, null);
  assert.strictEqual(getBotState(adminId), null, "State must be cleared on cancel");
  console.log("  ✓ State transitions and cancel handling verified successfully.");

  console.log("\n==================================================");
  console.log("ALL 6 TEST SUITES PASSED WITH 100% ACCURACY!");
  console.log("==================================================");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
