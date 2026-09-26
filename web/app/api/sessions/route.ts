import { NextResponse } from "next/server";
import { getSlots } from "@/lib/db";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const slots = await getSlots();
    return NextResponse.json(slots, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("GET /api/sessions error:", error);
    return NextResponse.json(
      { error: "خطایی در دریافت لیست سانسها رخ داد." },
      { status: 500 }
    );
  }
}
