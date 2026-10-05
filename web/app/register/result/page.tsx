"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { EpdLogo } from "@/components/ui/logo";
import { DeveloperBadge } from "@/components/ui/developer-badge";
import { strings } from "@/lib/strings";

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const refId = searchParams.get("refId");
  const name = searchParams.get("name");
  const errorParam = searchParams.get("error");

  const isSuccess = status === "success";

  return (
    <div className="min-h-screen bg-ground text-ink p-6 sm:p-12 flex flex-col justify-between max-w-5xl mx-auto selection:bg-brand-teal selection:text-ink">
      <header className="flex items-center justify-between border-b border-border pb-6">
        <Link
          href="/"
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
        >
          <EpdLogo className="h-10 w-auto" />
        </Link>
        <Link
          href="/"
          className="text-xs sm:text-sm font-bold text-ink-muted hover:text-ink transition-colors px-3 py-1.5 border border-border rounded-lg hover:border-brand-primary"
        >
          بازگشت به صفحه اصلی
        </Link>
      </header>

      <main className="my-12 max-w-lg mx-auto w-full">
        {isSuccess ? (
          <div className="bg-surface border border-border p-6 sm:p-8 rounded-2xl shadow-sm space-y-6 text-start">
            <div className="w-14 h-14 rounded-2xl bg-brand-teal/15 text-brand-teal flex items-center justify-center font-black text-2xl">
              ✓
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-extrabold text-ink tracking-tight">
                پرداخت و ثبت‌نام با موفقیت انجام شد
              </h1>
              {name && (
                <p className="text-sm font-bold text-brand-primary">
                  {name} عزیز، صندلی شما در این نشست رزرو شد.
                </p>
              )}
            </div>

            {/* Receipt Box */}
            <div className="bg-ground border border-border/80 rounded-xl p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                <span className="text-ink-muted">کد پیگیری شاپرک (RefID):</span>
                <span className="font-mono font-black text-ink text-sm" dir="ltr">
                  {refId || "تأیید شده"}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                <span className="text-ink-muted">رویداد:</span>
                <span className="font-bold text-ink">EPD Discussion Club</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-muted">وضعیت تراکنش:</span>
                <span className="font-extrabold text-brand-teal">
                  پرداخت موفق شاپرک
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-brand-gold/10 border border-brand-gold/30 rounded-xl text-xs text-ink leading-relaxed">
              اطلاعات دقیق لوکیشن و هماهنگی‌های نشست در کانال تلگرام EPD به آدرس{" "}
              <a
                href="https://t.me/EPDCommunity"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-teal font-bold underline underline-offset-4 hover:opacity-80"
              >
                @EPDCommunity
              </a>{" "}
              اطلاع‌رسانی می‌شود.
            </div>

            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center justify-center w-full px-6 py-3 bg-brand-primary text-surface font-extrabold text-sm rounded-xl hover:opacity-95 transition-opacity shadow-sm"
              >
                بازگشت به صفحه اصلی EPD
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-surface border border-border p-6 sm:p-8 rounded-2xl shadow-sm space-y-6 text-start">
            <div className="w-14 h-14 rounded-2xl bg-danger-border/15 text-danger-text flex items-center justify-center font-black text-2xl">
              ✕
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-extrabold text-ink tracking-tight">
                پرداخت انجام نشد
              </h1>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                {errorParam === "user_canceled"
                  ? "تراکنش توسط شما در درگاه لغو شد."
                  : errorParam === "not_found"
                  ? "اطلاعات نشست پرداخت یافت نشد. در صورت کسر وجه، مبلغ توسط بانک ظرف ۷۲ ساعت عودت داده می‌شود."
                  : errorParam
                  ? decodeURIComponent(errorParam)
                  : "ارتباط با درگاه بانکی برقرار نشد یا پرداخت با خطا مواجه گردید."}
              </p>
            </div>

            <div className="p-3.5 bg-ground border border-border/80 rounded-xl text-xs text-ink-muted leading-relaxed">
              در صورتی که مبلغی از حساب شما کسر شده باشد، طبق پروتکل بانکی شاپرک ظرف حداکثر ۷۲ ساعت به کارت شما بازخواهد گشت.
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/register"
                className="inline-flex items-center justify-center w-full sm:w-1/2 px-5 py-3 bg-brand-primary text-surface font-extrabold text-xs sm:text-sm rounded-xl hover:opacity-95 transition-opacity"
              >
                تلاش مجدد برای ثبت‌نام
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center w-full sm:w-1/2 px-5 py-3 bg-surface border border-border text-ink-muted font-bold text-xs sm:text-sm rounded-xl hover:text-ink hover:border-brand-primary transition-colors"
              >
                بازگشت به صفحه اصلی
              </Link>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-border pt-6 text-xs text-ink-muted flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-start">
        <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3 text-[11px] sm:text-xs">
          <span className="font-medium text-ink">EPD English Discussion Club</span>
          <span className="hidden sm:inline text-border">•</span>
          <span>{strings.landing.footer.allRights}</span>
        </div>
        <DeveloperBadge />
      </footer>
    </div>
  );
}

export default function RegisterResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-ground flex items-center justify-center text-xs text-ink-muted">
          در حال بارگذاری رسید پرداخت...
        </div>
      }
    >
      <PaymentResultContent />
    </Suspense>
  );
}
