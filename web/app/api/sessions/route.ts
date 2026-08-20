import { NextResponse } from "next/server";

export async function GET() {
  try {
    // لیست سانس‌های فعال (فعلاً به‌صورت هاردکد شده تا بعداً به دیتابیس وصل شود)
    const sessions = [
      {
        id: "session-1",
        title: "سانس اول: پنج‌شنبه ساعت ۱۶ تا ۱۸",
        capacity: 15,
        isFull: false,
      },
      {
        id: "session-2",
        title: "سانس دوم: پنج‌شنبه ساعت ۱۸:۳۰ تا ۲۰:۳۰",
        capacity: 15,
        isFull: false,
      },
    ];

    return NextResponse.json(sessions, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "خطایی در دریافت لیست سانس‌ها رخ داد." },
      { status: 500 }
    );
  }
}