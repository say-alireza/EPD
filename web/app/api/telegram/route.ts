import { webhookCallback } from "grammy";
import { bot } from "@/lib/telegram-bot";

export const runtime = "nodejs";

const handleWebhook = webhookCallback(bot, "std/http");

export async function POST(req: Request) {
  try {
    return await handleWebhook(req);
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return new Response("OK", { status: 200 });
  }
}

export async function GET() {
  return new Response("EPD Telegram Bot Webhook Active", { status: 200 });
}
