import { NextResponse } from "next/server";

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

    // ponytail: basic validation only; replace with zod registrationSchema on full DB integration
    return NextResponse.json(
      { message: "اطلاعات با موفقیت دریافت شد.", data: { fullName, email, mobile, sessionId } },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "داده‌های ارسالی نامعتبر است." },
      { status: 400 }
    );
  }
}
