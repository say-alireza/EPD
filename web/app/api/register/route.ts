import { NextResponse } from "next/server";

export const runtime = "edge";

const GOOGLE_SHEET_URL =
  "https://script.google.com/macros/s/AKfycbw7MRtf50_Qitg-brmrQjkSd4GKvkBKoHNNiT5prw3SuzactMOMjCOX0BQQPsi2tK6H0A/exec";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, email, mobile, sessionId } = body || {};

    if (!fullName || !email || !mobile || !sessionId) {
      return NextResponse.json(
        { error: "لطفاً تمام فیلدهای الزامی را پر کنید." },
        { status: 400 }
      );
    }

    // ۱. ذخیره‌سازی در دیتابیس Cloudflare D1
    try {
      // @ts-ignore
      const DB = process.env.DB;
      if (DB) {
        await DB.prepare(
          "INSERT INTO registrations (full_name, email, mobile, session_id) VALUES (?, ?, ?, ?)"
        )
          .bind(fullName, email, mobile, sessionId)
          .run();
      }
    } catch (dbError) {
      console.error("D1 Database Insert Error:", dbError);
    }

    // ۲. ارسال اتوماتیک و هم‌زمان به Google Sheet (بدون معطل کردن پاسخ کاربر)
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
        data: { fullName, email, mobile, sessionId },
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "داده‌های ارسالی نامعتبر است." },
      { status: 400 }
    );
  }
}