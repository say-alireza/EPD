import { strings } from "@/lib/strings";
import Link from "next/link";
import Image from "next/image";
import { EpdLogo } from "@/components/ui/logo";
import { assetPath } from "@/lib/asset";
import postersData from "@/data/posters.json";

export default function PostersPage() {
  const { pastPosters } = strings.landing;

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

        {/* Main Posters Archive */}
        <main className="my-12 space-y-8 text-start">
          <div className="space-y-2 max-w-2xl">
            <span className="text-xs font-bold text-brand-teal tracking-wider uppercase">
              {pastPosters.eyebrow}
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-ink">
              {pastPosters.title}
            </h1>
            <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
              {pastPosters.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {postersData.map((poster) => (
              <div
                key={poster.id}
                className="bg-surface border border-border rounded-xl p-3 flex flex-col gap-3 group hover:border-brand-primary transition-all duration-200 shadow-2xs"
              >
                <div className="relative w-full aspect-[3/4] bg-ground rounded-lg overflow-hidden border border-border">
                  <Image
                    src={assetPath(poster.image)}
                    alt={poster.topicEn}
                    width={600}
                    height={800}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex flex-col gap-1 text-start">
                  <span className="text-[11px] font-extrabold text-brand-primary">
                    {pastPosters.sessionPrefix} {poster.sessionNumber}
                  </span>
                  <p className="text-xs font-bold text-ink line-clamp-1" dir="ltr">
                    {poster.topicEn}
                  </p>
                  <span className="text-[11px] text-ink-muted">{poster.dateFa}</span>
                </div>
              </div>
            ))}
          </div>
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
