import { NextResponse } from "next/server";
import { getSlots } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const slots = await getSlots();
    return NextResponse.json(slots, { status: 200 });
  } catch (error) {
    console.error("GET /api/sessions error:", error);
    return NextResponse.json(
      { error: "خطایی در دریافت لیست سانسها رخ داد." },
      { status: 500 }
    );
  }
}
