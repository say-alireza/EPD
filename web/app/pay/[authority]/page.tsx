import { Suspense } from "react";
import Link from "next/link";
import { EpdLogo } from "@/components/ui/logo";
import { DeveloperBadge } from "@/components/ui/developer-badge";
import { PayRedirectClient } from "./pay-redirect-client";

interface PageProps {
  params: Promise<{ authority: string }>;
}

export default async function PayPage({ params }: PageProps) {
  const { authority } = await params;
  const paymentUrl = `https://payment.zarinpal.com/pg/StartPay/${authority}`;

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-ground text-ink p-6 sm:p-12 flex flex-col justify-between max-w-5xl mx-auto selection:bg-brand-teal selection:text-ink"
    >
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
          صفحه اصلی EPD
        </Link>
      </header>

      <main className="my-12 max-w-lg mx-auto w-full">
        <Suspense fallback={<div className="text-center py-12 text-ink-muted">در حال بارگذاری...</div>}>
          <PayRedirectClient paymentUrl={paymentUrl} authority={authority} />
        </Suspense>
      </main>

      <footer className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-muted">
        <span>© {new Date().getFullYear()} EPD Community. All rights reserved.</span>
        <DeveloperBadge />
      </footer>
    </div>
  );
}
