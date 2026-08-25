import Link from "next/link";
import Image from "next/image";
import { EpdLogo } from "@/components/ui/logo";
import { Typewriter } from "@/components/ui/typewriter";
import { strings } from "@/lib/strings";
import { assetPath } from "@/lib/asset";
import nextSessionData from "@/data/next-session.json";
import galleryData from "@/data/gallery.json";
import postersData from "@/data/posters.json";

function getFormattedJalaliDate(isoString: string): string {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default function HomePage() {
  const { hero, nextSessionPoster, gallery, pastPosters, faq, footer } =
    strings.landing;

  const formattedDate = getFormattedJalaliDate(nextSessionData.dateIso);
  const galleryItems = galleryData.slice(0, 6);

  return (
    <div className="min-h-screen bg-ground text-ink flex flex-col selection:bg-brand-teal selection:text-ink">
      {/* 1. Header — 48px (h-12) lockup at start edge, one CTA link */}
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between border-b border-border">
        <Link
          href="/"
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
        >
          <EpdLogo className="h-12 w-auto" variant="lockup" />
        </Link>
        <Link
          href="/register"
          className="text-xs sm:text-sm font-bold text-ink hover:text-brand-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal px-3 py-1.5 border border-border rounded-lg hover:border-brand-primary"
        >
          {strings.landing.nav.register}
        </Link>
      </header>

      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-24">
        {/* 2. Hero — Redesigned Two-Column Layout */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-start">
          {/* Right Column (lg:col-span-7) */}
          <div className="lg:col-span-7 flex flex-col items-start gap-6">
            {/* Capacity badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-accent/10 text-brand-accent text-xs sm:text-sm font-bold">
              <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" />
              <span>{nextSessionData.remainingSeats ? `${nextSessionData.remainingSeats.toLocaleString("fa-IR")} صندلی باقیمانده...` : "۶ صندلی باقیمانده..."}</span>
            </div>

            {/* Main heading with Typewriter */}
            <div className="space-y-4 w-full">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-ink leading-tight tracking-tight min-h-[3.5rem] sm:min-h-[4.5rem]">
                <Typewriter
                  words={[
                    "An excuse for speaking",
                    "An excuse for connecting",
                    "An excuse for learning",
                    "مکانی برای مکالمه واقعی",
                  ]}
                />
              </h1>
              <p className="text-base sm:text-lg font-normal text-ink-muted leading-relaxed max-w-xl">
                {hero.factLine}
              </p>
            </div>

            {/* Primary CTA registration button */}
            <div className="pt-2">
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-8 py-4 bg-brand-accent text-surface font-extrabold text-base transition-opacity hover:opacity-90 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal rounded-lg shadow-sm"
              >
                {hero.cta}
              </Link>
            </div>
          </div>

          {/* Left Column (lg:col-span-5) — Upcoming Session Details */}
          <div className="lg:col-span-5 w-full">
            <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-1 bg-brand-gold text-ink text-xs font-extrabold rounded">
                    جلسه {nextSessionData.number}
                  </span>
                  <span className="text-xs font-medium text-ink-muted">
                    {nextSessionPoster.eyebrow}
                  </span>
                </div>
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-teal">
                  <span className="w-2 h-2 rounded-full bg-brand-teal animate-pulse" />
                  <span>ثبت‌نام فعال</span>
                </div>
              </div>

              {/* Poster placeholder box with dashed borders */}
              <div className="w-full bg-ground border border-dashed border-brand-primary/40 rounded-xl p-6 flex flex-col items-center justify-center text-center gap-3 overflow-hidden min-h-[220px]">
                {nextSessionData.posterImage ? (
                  <Image
                    src={assetPath(nextSessionData.posterImage)}
                    alt={nextSessionData.topicEn}
                    width={400}
                    height={500}
                    className="w-full max-w-xs h-auto object-contain rounded-lg shadow-xs"
                    priority
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center gap-3 py-4">
                    <div className="w-12 h-12 rounded-full bg-brand-gold/20 text-brand-gold flex items-center justify-center font-bold text-lg">
                      🎨
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-base font-extrabold text-ink">
                        {hero.poster.emptyTitle}
                      </h3>
                      <p className="text-xs text-ink-muted leading-relaxed max-w-xs">
                        {hero.poster.emptySubtitle}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Time and location details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-border pt-4 text-xs">
                <div>
                  <span className="text-ink-muted block">{nextSessionPoster.dateLabel}</span>
                  <span className="font-bold text-ink">{formattedDate}</span>
                </div>
                <div>
                  <span className="text-ink-muted block">{nextSessionPoster.timeLabel}</span>
                  <span className="font-bold text-ink" dir="ltr">
                    {nextSessionData.timeFa}
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-ink-muted block">{nextSessionPoster.venueLabel}</span>
                  <span className="font-bold text-ink">{nextSessionData.venueFa}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Weekly photo gallery — clean compact badge with session tag */}
        <section className="flex flex-col gap-8 text-start">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-brand-teal tracking-wider uppercase">
                {gallery.eyebrow}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-ink">
                {gallery.title}
              </h2>
            </div>
            <Link
              href="/gallery"
              className="text-xs sm:text-sm font-bold text-brand-primary hover:text-brand-accent transition-colors underline self-start sm:self-auto"
            >
              {gallery.viewAll}
            </Link>
          </div>

          {galleryItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryItems.map((item) => (
                <article
                  key={item.id}
                  className="bg-surface border border-border rounded-xl overflow-hidden flex flex-col group shadow-xs hover:border-brand-primary transition-all duration-200"
                >
                  <div className="relative w-full aspect-[4/3] bg-ground overflow-hidden">
                    <Image
                      src={assetPath(item.image)}
                      alt={`جلسه ${item.sessionNumber}`}
                      width={600}
                      height={450}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-2 start-2 bg-ink/80 text-surface px-2.5 py-1 rounded text-[11px] font-bold">
                      جلسه {item.sessionNumber}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="p-8 bg-surface border border-dashed border-border rounded-xl text-center text-sm text-ink-muted">
              {gallery.emptyState}
            </div>
          )}
        </section>

        {/* 4. Past posters — compact strip, link to /posters */}
        <section className="flex flex-col gap-8 text-start">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-brand-teal tracking-wider uppercase">
                {pastPosters.eyebrow}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-ink">
                {pastPosters.title}
              </h2>
              <p className="text-sm text-ink-muted">
                {pastPosters.subtitle}
              </p>
            </div>
            <Link
              href="/posters"
              className="text-xs sm:text-sm font-bold text-brand-primary hover:text-brand-accent transition-colors underline self-start sm:self-auto"
            >
              {pastPosters.viewAll}
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {postersData.map((poster) => (
              <div
                key={poster.id}
                className="bg-surface border border-border rounded-xl p-3 flex flex-col gap-3 group hover:border-brand-primary transition-all duration-200"
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
        </section>

        {/* 5. FAQ — six questions as native <details> elements */}
        <section className="flex flex-col gap-8 text-start max-w-4xl mx-auto w-full">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-brand-teal tracking-wider uppercase">
              {faq.eyebrow}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink">
              {faq.title}
            </h2>
            <p className="text-sm text-ink-muted">
              {faq.subtitle}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {faq.items.map((item, idx) => (
              <details
                key={idx}
                className="group bg-surface border border-border rounded-xl p-5 open:ring-1 open:ring-brand-primary transition-all duration-150"
              >
                <summary className="font-bold text-sm sm:text-base text-ink cursor-pointer list-none flex items-center justify-between gap-4 select-none">
                  <span>{item.question}</span>
                  <span className="text-ink-muted text-lg transition-transform duration-200 group-open:rotate-45 shrink-0">
                    +
                  </span>
                </summary>
                <div className="pt-4 text-xs sm:text-sm text-ink-muted leading-relaxed border-t border-border mt-3">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </section>
      </main>

      {/* 6. Footer — address, contact channels, social links, link to /terms */}
      <footer className="w-full bg-surface border-t border-border mt-16 py-12">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-12 text-start">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col gap-4">
              <EpdLogo className="h-9 w-auto self-start" variant="lockup" />
              <p className="text-xs text-ink-muted leading-relaxed">
                {footer.aboutText}
              </p>
            </div>

            <div className="flex flex-col gap-2 text-xs">
              <span className="font-bold text-ink">{footer.addressLabel}</span>
              <p className="text-ink-muted">{footer.addressValue}</p>
              <div className="pt-2">
                <span className="font-bold text-ink block">{footer.contactLabel}</span>
                <p className="text-ink-muted" dir="ltr">{footer.phone}</p>
                <p className="text-ink-muted" dir="ltr">{footer.email}</p>
              </div>
            </div>

            <div className="flex flex-col gap-2 text-xs">
              <span className="font-bold text-ink">{footer.linksTitle}</span>
              <Link href="/register" className="text-ink-muted hover:text-ink transition-colors">
                {hero.cta}
              </Link>
              <Link href="/gallery" className="text-ink-muted hover:text-ink transition-colors">
                {gallery.title}
              </Link>
              <Link href="/posters" className="text-ink-muted hover:text-ink transition-colors">
                {pastPosters.title}
              </Link>
              <Link href="/terms" className="text-ink-muted hover:text-ink transition-colors">
                {footer.terms}
              </Link>
            </div>

            <div className="flex flex-col gap-2 text-xs">
              <span className="font-bold text-ink">{footer.socialTitle}</span>
              <a
                href="https://t.me/EPDSupport"
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink-muted hover:text-ink transition-colors"
              >
                {footer.telegram}
              </a>
              <a
                href="https://instagram.com/epdclub"
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink-muted hover:text-ink transition-colors"
              >
                {footer.instagram}
              </a>
            </div>
          </div>

          <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-ink-muted gap-4">
            <span>EPD English Discussion Club</span>
            <span>{footer.allRights}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
