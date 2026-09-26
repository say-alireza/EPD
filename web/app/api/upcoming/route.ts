import { NextResponse } from "next/server";
import { getUpcomingSession } from "@/lib/db";

export const runtime = "edge";

export async function GET() {
  try {
    const session = await getUpcomingSession();
    return NextResponse.json(session, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("GET /api/upcoming error:", error);
    return NextResponse.json(
      { error: "خطایی در دریافت مشخصات نشست رخ داد." },
      { status: 500 }
    );
  }
}
