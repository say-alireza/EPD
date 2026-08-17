"use client";

import { useState } from "react";
import Link from "next/link";
import { EpdLogo } from "@/components/ui/logo";
import { strings } from "@/lib/strings";

// Format placeholder Jalali date natively with Intl.DateTimeFormat without extra libraries
function getFormattedJalaliDate(date: Date = new Date("2026-08-20T18:00:00")): string {
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default function HeroAVariant() {
  const [showPoster, setShowPoster] = useState(true);
  const { hero } = strings.landing;
  const formattedDate = getFormattedJalaliDate();

  return (
    <div className="min-h-screen bg-ground text-ink flex flex-col justify-between p-4 sm:p-6 lg:p-12 overflow-x-hidden">
      {/* Top Header: Brand Lockup at start edge (rule: lockup at >=36px) + Dev toggle */}
      <header className="w-full max-w-6xl mx-auto mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4 text-start">
        <Link href="/" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal shrink-0">
          <EpdLogo className="h-9 w-auto" variant="lockup" />
        </Link>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-normal text-ink-muted">حالت پوستر:</span>
          <button
            type="button"
            onClick={() => setShowPoster(true)}
            className={`px-3 py-1.5 text-xs font-extrabold rounded-none border transition-colors ${
              showPoster
                ? "bg-brand-primary text-surface border-brand-primary"
                : "bg-surface text-ink border-border hover:bg-surface-hover"
            } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal`}
          >
            پوستر آماده
          </button>
          <button
            type="button"
            onClick={() => setShowPoster(false)}
            className={`px-3 py-1.5 text-xs font-extrabold rounded-none border transition-colors ${
              !showPoster
                ? "bg-brand-primary text-surface border-brand-primary"
                : "bg-surface text-ink border-border hover:bg-surface-hover"
            } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal`}
          >
            در حال آماده‌سازی
          </button>
        </div>
      </header>

      {/* Main Hero Container */}
      <main className="w-full max-w-6xl mx-auto my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Text & Action Column (8 cols - dominant thesis) */}
        <section className="lg:col-span-8 flex flex-col items-start gap-6 text-start w-full min-w-0">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-ink leading-tight">
            {hero.headline}
          </h1>

          <p className="text-sm sm:text-base lg:text-lg font-normal text-ink-muted leading-relaxed break-words">
            {hero.factLine}
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2 w-full sm:w-auto">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-brand-accent text-surface font-extrabold text-base transition-opacity hover:opacity-90 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
            >
              {hero.cta}
            </Link>

            {/* Plain text remaining capacity indicator with teal dot (not a button or pill) */}
            <div className="inline-flex items-center gap-2 text-sm font-normal text-ink ps-1">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-teal shrink-0" />
              <span>{hero.spotsRemaining}</span>
            </div>
          </div>
        </section>

        {/* Poster Paper Object Column (4 cols - secondary supporting physical object) */}
        <aside className="lg:col-span-4 w-full flex justify-center min-w-0">
          {showPoster ? (
            /* Physical Paper Poster Card: 1px ink border, quiet secondary tone */
            <article className="w-full max-w-sm bg-surface border border-brand-primary p-6 flex flex-col justify-between aspect-[3/4] text-start">
              <header className="flex items-start justify-between border-b border-border pb-3">
                <span className="px-2 py-0.5 bg-brand-gold text-ink text-xs font-extrabold">
                  {formattedDate}
                </span>
                <span className="text-xs font-normal text-ink-muted">
                  {hero.poster.badge}
                </span>
              </header>

              <div className="my-auto py-4 space-y-3">
                <p className="text-xs font-normal text-ink-muted uppercase tracking-wider">
                  Discussion Topic
                </p>
                <h2 className="text-xl font-extrabold text-ink leading-snug break-words">
                  {hero.poster.topicTitle}
                </h2>
                <p className="text-xs font-normal text-ink-muted leading-relaxed break-words">
                  {hero.poster.topicSubtitle}
                </p>
              </div>

              {/* Poster footer with explicit LTR container for Latin time range and venue */}
              <footer className="border-t border-border pt-3 flex items-center justify-between text-xs font-normal text-ink-muted">
                <span dir="ltr">{hero.poster.venueEn}</span>
                <span dir="ltr">{hero.poster.timeEn}</span>
              </footer>
            </article>
          ) : (
            /* Empty State: Ink Manifest Card */
            <article className="w-full max-w-sm bg-surface border border-dashed border-brand-primary p-6 flex flex-col justify-between aspect-[3/4] text-start">
              <header className="border-b border-border pb-3">
                <span className="text-xs font-normal text-ink-muted">
                  {hero.poster.badge}
                </span>
              </header>

              <div className="my-auto py-4 space-y-3">
                <h2 className="text-lg font-extrabold text-ink">
                  {hero.poster.emptyTitle}
                </h2>
                <p className="text-xs font-normal text-ink-muted leading-relaxed">
                  {hero.poster.emptySubtitle}
                </p>
                <div className="p-3 bg-ground border border-border space-y-1 text-xs font-normal text-ink">
                  <div><span className="text-ink-muted">تاریخ: </span>{formattedDate}</div>
                  <div><span className="text-ink-muted">مکان: </span>مشهد، بلوار سجاد</div>
                </div>
              </div>

              <footer className="border-t border-border pt-3 text-xs font-normal text-brand-teal">
                ظرفیت ثبت‌نام فعال است
              </footer>
            </article>
          )}
        </aside>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs font-normal text-ink-muted gap-2">
        <span>EPD English Discussion Club</span>
        <span>تجربه · بازی · توسعه</span>
      </footer>
    </div>
  );
}
