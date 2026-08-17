import { strings } from "@/lib/strings";
import Link from "next/link";
import { EpdLogo } from "@/components/ui/logo";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-ground text-ink p-6 sm:p-12 flex flex-col justify-between max-w-5xl mx-auto">
      <header className="flex items-center justify-between border-b border-border pb-6">
        <Link href="/" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal">
          <EpdLogo className="h-10 w-auto" />
        </Link>
        <Link
          href="/"
          className="text-xs font-bold text-ink-muted hover:text-ink transition-colors"
        >
          بازگشت به صفحه اصلی
        </Link>
      </header>

      <main className="my-16 space-y-6 text-start">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-ink">
          {strings.landing.footer.terms}
        </h1>
        <div className="space-y-4 text-sm text-ink-muted leading-relaxed">
          <p>
            ۱. حضور در جلسات مستلزم ثبت‌نام قبلی از طریق وب‌سایت است.
          </p>
          <p>
            ۲. زبان رسمی تمام طول جلسه انگلیسی بوده و صحبت به زبان فارسی مجاز نیست.
          </p>
          <p>
            ۳. لغو ثبت‌نام و عودت وجه تا ۲۴ ساعت قبل از برگزاری امکان‌پذیر است.
          </p>
        </div>
      </main>

      <footer className="border-t border-border pt-6 text-xs text-ink-muted flex items-center justify-between">
        <span>EPD English Discussion Club</span>
        <span>{strings.landing.footer.allRights}</span>
      </footer>
    </div>
  );
}
