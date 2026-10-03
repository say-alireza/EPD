import { NextResponse } from "next/server";
import { getRegistrationByAuthority, confirmRegistrationPayment, getSlots } from "@/lib/db";
import { verifyZarinpalPayment } from "@/lib/zarinpal";
import { notifyAdminsNewRegistration } from "@/lib/telegram-bot";

export const runtime = "edge";

const GOOGLE_SHEET_URL =
  "https://script.google.com/macros/s/AKfycbw7MRtf50_Qitg-brmrQjkSd4GKvkBKoHNNiT5prw3SuzactMOMjCOX0BQQPsi2tK6H0A/exec";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const authority = url.searchParams.get("Authority") || url.searchParams.get("authority");
  const status = url.searchParams.get("Status") || url.searchParams.get("status");

  if (!authority) {
    return NextResponse.redirect(
      `${url.origin}/register/result?status=failed&error=missing_authority`
    );
  }

  // ۱. یافتن رکورد ثبت‌نام مرتبط با شناسه authority
  const registration = await getRegistrationByAuthority(authority);
  if (!registration) {
    return NextResponse.redirect(
      `${url.origin}/register/result?status=failed&error=not_found&authority=${authority}`
    );
  }

  // ۲. اگر قبلاً پرداخت و تایید شده، مستقیماً به صفحه رسید موفق برود (جلوگیری از دوباره‌کاری)
  if (registration.paymentStatus === "paid" && registration.paymentRefId) {
    return NextResponse.redirect(
      `${url.origin}/register/result?status=success&refId=${registration.paymentRefId}&sessionId=${registration.sessionId}`
    );
  }

  // ۳. اگر کاربر در درگاه انصراف داده یا شاپرک وضعیت NOK داده است
  if (status !== "OK") {
    return NextResponse.redirect(
      `${url.origin}/register/result?status=failed&error=user_canceled&authority=${authority}`
    );
  }

  // ۴. وریفای نهایی تراکنش با API رسمی زرین‌پال
  const amountTomans = registration.amountTomans || 50000;
  const verifyResult = await verifyZarinpalPayment({
    amountTomans,
    authority,
  });

  if (!verifyResult.success || !verifyResult.refId) {
    return NextResponse.redirect(
      `${url.origin}/register/result?status=failed&error=${encodeURIComponent(
        verifyResult.error || "تراکنش توسط شاپرک تأیید نشد"
      )}&authority=${authority}`
    );
  }

  // ۵. تایید قطعی پرداخت و کسر صندلی در دیتابیس
  const refId = String(verifyResult.refId);
  const updatedReg = await confirmRegistrationPayment(authority, refId);

  // ۶. ارسال نوتیفیکیشن اختصاصی به ادمین‌های تلگرام
  const slots = await getSlots();
  const slot = slots.find(
    (s) => s.id === (updatedReg?.sessionId || registration.sessionId)
  );
  const sessionTitle = slot ? slot.title : registration.sessionId;

  await notifyAdminsNewRegistration({
    fullName: registration.fullName,
    mobile: registration.mobile,
    email: registration.email,
    sessionTitle,
    languageLevel: registration.languageLevel,
    topicSuggestion: registration.topicSuggestion,
    amountTomans,
    refId,
    paymentStatus: "paid",
  }).catch((e) => console.error("Telegram Admin Notification Error:", e));

  // ۷. ثبت در گوگل شیت
  fetch(GOOGLE_SHEET_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: registration.fullName,
      email: registration.email,
      mobile: registration.mobile,
      sessionId: registration.sessionId,
      refId,
      amountTomans,
      status: "paid",
    }),
  }).catch((e) => console.error("Google Sheet Sync Error:", e));

  // ۸. هدایت کاربر به صفحه رسید نهایی پرداخت با کد پیگیری
  return NextResponse.redirect(
    `${url.origin}/register/result?status=success&refId=${refId}&sessionId=${
      registration.sessionId
    }&name=${encodeURIComponent(registration.fullName)}`
  );
}
