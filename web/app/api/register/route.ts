import { NextResponse } from "next/server";
import { addRegistration, getSlots, getUpcomingSession } from "@/lib/db";
import { notifyAdminsNewRegistration } from "@/lib/telegram-bot";
import { requestZarinpalPayment } from "@/lib/zarinpal";

export const runtime = "edge";

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

    if (!fullName || !mobile || !sessionId || !socialHandle) {
      return NextResponse.json(
        { error: "لطفاً تمام فیلدهای الزامی (نام، شماره تماس، شناسه تلگرام و سانس) را پر کنید." },
        { status: 400 }
      );
    }

    const slots = await getSlots();
    const selectedSlot = slots.find((s) => s.id === sessionId);
    const session = await getUpcomingSession();

    // تعیین مبلغ ورودی: اولویت با مبلغ اختصاصی سانس است
    const feeTomans =
      selectedSlot?.feeTomans !== undefined
        ? selectedSlot.feeTomans
        : (session.feeTomans ?? 0);

    // ۱. اگر نشست یا سانس دارای مبلغ ورودی است (> 0): شروع تراکنش درگاه زرین‌پال
    if (feeTomans > 0) {
      const url = new URL(request.url);
      const isLocal = url.hostname === "localhost" || url.hostname === "127.0.0.1";
      const origin = isLocal ? "https://epdcommunity.ir" : url.origin;
      const callbackUrl = `${origin}/api/payment/callback/`;

      const slotName = selectedSlot?.title ? ` - ${selectedSlot.title.split(":")[0]}` : "";
      const paymentRes = await requestZarinpalPayment({
        amountTomans: feeTomans,
        description: `ثبت‌نام ${fullName} در نشست ${session.number} EPD${slotName}`,
        callbackUrl,
        mobile,
        email: email || undefined,
      });

      if (!paymentRes.success || !paymentRes.authority || !paymentRes.paymentUrl) {
        return NextResponse.json(
          { error: paymentRes.error || "خطا در اتصال به درگاه پرداخت زرین‌پال" },
          { status: 502 }
        );
      }

      // ثبت اولیه با وضعیت در انتظار پرداخت (pending)
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
        paymentStatus: "pending",
        paymentAuthority: paymentRes.authority,
        amountTomans: feeTomans,
      });

      // اطلاع‌رسانی آنی به ادمین‌های تلگرام
      const sessionTitle = selectedSlot ? selectedSlot.title : sessionId;

      await notifyAdminsNewRegistration({
        fullName,
        mobile,
        socialHandle,
        email: email || undefined,
        sessionTitle,
        languageLevel,
        topicSuggestion,
        amountTomans: feeTomans,
        paymentStatus: "در انتظار پرداخت درگاه",
      }).catch((e) => console.error("Telegram Notification Error:", e));

      return NextResponse.json(
        {
          message: "هدایت به درگاه پرداخت",
          paymentUrl: paymentRes.paymentUrl,
          authority: paymentRes.authority,
          registrationId: record.id,
        },
        { status: 200 }
      );
    }

    // ۲. اگر نشست رایگان است (feeTomans === 0): ثبت قطعی مستقیم
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
      paymentStatus: "free",
      amountTomans: 0,
    });

    const sessionTitle = selectedSlot ? selectedSlot.title : sessionId;

    await notifyAdminsNewRegistration({
      fullName,
      mobile,
      socialHandle,
      email: email || undefined,
      sessionTitle,
      languageLevel,
      topicSuggestion,
      amountTomans: 0,
      paymentStatus: "رایگان",
    }).catch((e) => console.error("Telegram Notification Error:", e));

    fetch(GOOGLE_SHEET_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, email, mobile, sessionId, status: "free" }),
    }).catch((e) => console.error("Google Sheet Sync Error:", e));

    return NextResponse.json(
      {
        message: "ثبت‌نام با موفقیت انجام شد.",
        data: record,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("POST /api/register error:", err);
    return NextResponse.json(
      { error: "داده‌های ارسالی نامعتبر است." },
      { status: 400 }
    );
  }
}
