import { NextResponse } from "next/server";
import { addRegistration, getSlots } from "@/lib/db";
import { notifyAdminsNewRegistration } from "@/lib/telegram-bot";

export const runtime = "nodejs";

const GOOGLE_SHEET_URL =
  "https://script.google.com/macros/s/AKfycbw7MRtf50_Qitg-brmrQjkSd4GKvkBKoHNNiT5prw3SuzactMOMjCOX0BQQPsi2tK6H0A/exec";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      fullName,
      email,
      mobile,
      sessionId,
      languageLevel,
      firstTime,
      topicSuggestion,
      referralCode,
      heardFrom,
      socialHandle,
    } = body || {};

    if (!fullName || !email || !mobile || !sessionId) {
      return NextResponse.json(
        { error: "لطفاً تمام فیلدهای الزامی را پر کنید." },
        { status: 400 }
      );
    }

    // ۱. ثبت در دیتابیس D1 و کَش سیستم
    const record = await addRegistration({
      fullName,
      email,
      mobile,
      sessionId,
      languageLevel,
      firstTime: Boolean(firstTime),
      topicSuggestion,
      referralCode,
      heardFrom,
      socialHandle,
    });

    // ۲. دریافت عنوان سانس جهت ارسال در نوتیفیکیشن
    const slots = await getSlots();
    const slot = slots.find((s) => s.id === sessionId);
    const sessionTitle = slot ? slot.title : sessionId;

    // ۳. ارسال آنی نوتیفیکیشن تلگرام به ادمینها
    notifyAdminsNewRegistration({
      fullName,
      mobile,
      email,
      sessionTitle,
      languageLevel,
      topicSuggestion,
    }).catch((telegramError) =>
      console.error("Telegram Notification Error:", telegramError)
    );

    // ۴. همگامسازی همزمان با Google Sheet
    fetch(GOOGLE_SHEET_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, email, mobile, sessionId }),
    }).catch((sheetError) =>
      console.error("Google Sheet Sync Error:", sheetError)
    );

    return NextResponse.json(
      {
        message: "اطلاعات با موفقیت دریافت و ثبت شد.",
        data: record,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("POST /api/register error:", err);
    return NextResponse.json(
      { error: "دادههای ارسالی نامعتبر است." },
      { status: 400 }
    );
  }
}
