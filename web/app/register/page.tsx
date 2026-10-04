import { Metadata } from "next";
import Link from "next/link";
import { RegistrationForm } from "@/components/register/registration-form";
import { EpdLogo } from "@/components/ui/logo";
import { DeveloperBadge } from "@/components/ui/developer-badge";
import { strings } from "@/lib/strings";

export const metadata: Metadata = {
  title: strings.form.title,
};

export default function RegisterPage() {
  return (
    <main className="w-full max-w-xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
      {/* Header section with brand logo & back link */}
      <header className="mb-8 space-y-4 text-start">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <Link
            href="/"
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
          >
            <EpdLogo className="h-10 sm:h-12 w-auto" />
          </Link>
          <Link
            href="/"
            className="text-xs sm:text-sm font-bold text-ink-muted hover:text-ink transition-colors px-3 py-1.5 border border-border rounded-lg hover:border-brand-primary"
          >
            بازگشت به صفحه اصلی
          </Link>
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
            {strings.form.title}
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            {strings.form.subtitle || "برای حضور در نشست بعدی، لطفاً اطلاعات زیر را با دقت تکمیل کنید."}
          </p>
        </div>
      </header>

      {/* Registration Card */}
      <section className="epd-card p-6 sm:p-8">
        <RegistrationForm />
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-12 pt-6 text-xs text-ink-muted flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-start">
        <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3 text-[11px] sm:text-xs">
          <span className="font-medium text-ink">EPD English Discussion Club</span>
          <span className="hidden sm:inline text-border">•</span>
          <span>{strings.landing.footer.allRights}</span>
        </div>
        <DeveloperBadge />
      </footer>
    </main>
  );
}

