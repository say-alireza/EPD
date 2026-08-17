import { strings } from "@/lib/strings";
import Link from "next/link";
import { EpdLogo } from "@/components/ui/logo";

export default function RegisterSuccessPage() {
  return (
    <div className="min-h-screen bg-ground text-ink p-6 sm:p-12 flex flex-col justify-between max-w-5xl mx-auto">
      <header className="flex items-center justify-between border-b border-border pb-6">
        <Link href="/" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal">
          <EpdLogo className="h-10 w-auto" />
        </Link>
      </header>

      <main className="my-16 space-y-6 text-start max-w-md mx-auto bg-surface border border-border p-8 rounded-xl">
        <div className="w-12 h-12 rounded-full bg-brand-teal/20 text-brand-teal flex items-center justify-center font-bold text-xl mb-4">
          ✓
        </div>
        <h1 className="text-2xl font-extrabold text-ink">
          ثبت‌نام شما با موفقیت ثبت شد
        </h1>
        <p className="text-sm text-ink-muted leading-relaxed">
          اطلاعات نشست و لوکیشن دقیق از طریق پیامک برای شما ارسال خواهد شد.
        </p>
        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center w-full px-6 py-3 bg-brand-primary text-surface font-extrabold text-sm rounded-lg hover:opacity-90 transition-opacity"
          >
            بازگشت به صفحه اصلی
          </Link>
        </div>
      </main>

      <footer className="border-t border-border pt-6 text-xs text-ink-muted flex items-center justify-between">
        <span>EPD English Discussion Club</span>
        <span>{strings.landing.footer.allRights}</span>
      </footer>
    </div>
  );
}
