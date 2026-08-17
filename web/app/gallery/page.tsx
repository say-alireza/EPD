import { strings } from "@/lib/strings";
import Link from "next/link";
import { EpdLogo } from "@/components/ui/logo";

export default function GalleryPage() {
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
          {strings.landing.gallery.title}
        </h1>
        <p className="text-base text-ink-muted leading-relaxed">
          {strings.landing.gallery.subtitle}
        </p>
        <div className="p-8 bg-surface border border-dashed border-border rounded-xl text-center text-sm text-ink-muted">
          آرشیو کامل تصاویر هفتگی به زودی بارگذاری خواهد شد.
        </div>
      </main>

      <footer className="border-t border-border pt-6 text-xs text-ink-muted flex items-center justify-between">
        <span>EPD English Discussion Club</span>
        <span>{strings.landing.footer.allRights}</span>
      </footer>
    </div>
  );
}
