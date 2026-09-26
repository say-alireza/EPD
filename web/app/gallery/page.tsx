import { strings } from "@/lib/strings";
import Link from "next/link";
import Image from "next/image";
import { EpdLogo } from "@/components/ui/logo";
import { assetPath } from "@/lib/asset";
import galleryData from "@/data/gallery.json";

export default function GalleryPage() {
  const { gallery } = strings.landing;

  return (
    <div className="min-h-screen bg-ground text-ink flex flex-col justify-between selection:bg-brand-teal selection:text-ink">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-border pb-6">
          <Link
            href="/"
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
          >
            <EpdLogo className="h-10 w-auto" variant="lockup" />
          </Link>
          <Link
            href="/"
            className="text-xs sm:text-sm font-bold text-ink-muted hover:text-ink transition-colors px-3 py-1.5 border border-border rounded-lg hover:border-brand-primary"
          >
            بازگشت به صفحه اصلی
          </Link>
        </header>

        {/* Main Gallery Archive */}
        <main className="my-12 space-y-8 text-start">
          <div className="space-y-2 max-w-2xl">
            <span className="text-xs font-bold text-brand-teal tracking-wider uppercase">
              {gallery.eyebrow}
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-ink">
              {gallery.title}
            </h1>
            <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
              {gallery.subtitle}
            </p>
          </div>

          {galleryData.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryData.map((item) => (
                <article
                  key={item.id}
                  className="bg-surface border border-border rounded-xl overflow-hidden flex flex-col group shadow-xs hover:border-brand-primary transition-all duration-200"
                >
                  <div className="relative w-full aspect-[4/3] bg-ground overflow-hidden">
                    <Image
                      src={assetPath(item.image)}
                      alt={`تصویر دورهمی جلسه ${item.sessionNumber}`}
                      width={600}
                      height={450}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-3 start-3 bg-ink/85 text-surface px-2.5 py-1 rounded text-xs font-bold shadow-xs">
                      جلسه {item.sessionNumber}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="p-12 bg-surface border border-dashed border-border rounded-xl text-center text-sm text-ink-muted">
              {gallery.emptyState}
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-border py-6 bg-surface mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-ink-muted gap-4">
          <span>EPD English Discussion Club</span>
          <span>{strings.landing.footer.allRights}</span>
        </div>
      </footer>
    </div>
  );
}
