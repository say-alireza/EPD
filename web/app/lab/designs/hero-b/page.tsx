"use client";

import { useState } from "react";
import Link from "next/link";
import { EpdLogo } from "@/components/ui/logo";
import { strings } from "@/lib/strings";

function getFormattedJalaliDate(date: Date = new Date("2026-08-20T18:00:00")): string {
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default function HeroBVariant() {
  const [showPoster, setShowPoster] = useState(true);
  const { hero } = strings.landing;
  const formattedDate = getFormattedJalaliDate();

  return (
    <div className="min-h-screen bg-ground text-ink flex flex-col justify-between p-4 sm:p-6 lg:p-12">
      {/* Dev / Lab Control Toggle */}
      <div className="w-full max-w-5xl mx-auto mb-6 flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-normal text-ink-muted">حالت پوستر:</span>
          <button
            type="button"
            onClick={() => setShowPoster(true)}
            className={`px-4 py-2 text-xs font-extrabold rounded-none border transition-colors ${
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
            className={`px-4 py-2 text-xs font-extrabold rounded-none border transition-colors ${
              !showPoster
                ? "bg-brand-primary text-surface border-brand-primary"
                : "bg-surface text-ink border-border hover:bg-surface-hover"
            } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal`}
          >
            در حال آماده‌سازی (خالی)
          </button>
        </div>
        <span className="text-xs text-ink-muted">Variant B: Oversized Typography & Micro-Poster</span>
      </div>

      {/* Main Hero Container */}
      <main className="w-full max-w-5xl mx-auto my-auto flex flex-col gap-12 text-start">
        <header className="flex flex-col items-start gap-4">
          <EpdLogo className="h-12 w-auto mb-2" />
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-ink leading-tight tracking-tight">
            {hero.headline}
          </h1>
        </header>

        {/* Action + Micro Poster Grid */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start border-t border-border pt-8">
          {/* Main Statement & Primary Register action (7 cols) */}
          <div className="md:col-span-7 flex flex-col items-start gap-6">
            <p className="text-lg sm:text-xl font-normal text-ink leading-relaxed">
              {hero.factLine}
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto">
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-8 py-4 bg-brand-accent text-surface font-extrabold text-base transition-opacity hover:opacity-90 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
              >
                {hero.cta}
              </Link>
              <div className="inline-flex items-center gap-2 ps-1 text-sm font-normal text-ink">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-teal shrink-0" />
                <span>{hero.spotsRemaining}</span>
              </div>
            </div>
          </div>

          {/* Micro Poster / Secondary Ink Card (5 cols) */}
          <aside className="md:col-span-5 w-full">
            {showPoster ? (
              <article className="w-full bg-surface border border-brand-primary p-6 flex flex-col justify-between text-start gap-4">
                <header className="flex items-center justify-between border-b border-border pb-3">
                  <span className="px-2 py-0.5 bg-brand-gold text-ink text-xs font-extrabold">
                    {formattedDate}
                  </span>
                  <span className="text-xs font-normal text-ink-muted">
                    {hero.poster.badge}
                  </span>
                </header>

                <div>
                  <p className="text-xs font-normal text-ink-muted mb-1">موضوع این جلسه</p>
                  <h2 className="text-lg font-extrabold text-ink leading-snug">
                    {hero.poster.topicTitle}
                  </h2>
                </div>

                <footer className="border-t border-border pt-3 text-xs font-normal text-ink-muted flex items-center justify-between">
                  <span dir="ltr">{hero.poster.venueEn}</span>
                  <span dir="ltr">{hero.poster.timeEn}</span>
                </footer>
              </article>
            ) : (
              <article className="w-full bg-surface border border-dashed border-brand-primary p-6 flex flex-col justify-between text-start gap-4">
                <header className="flex items-center justify-between border-b border-border pb-3">
                  <span className="text-xs font-normal text-ink-muted">
                    {hero.poster.badge}
                  </span>
                  <span className="text-xs font-normal text-brand-teal">
                    ظرفیت فعال
                  </span>
                </header>

                <div>
                  <h2 className="text-base font-extrabold text-ink mb-1">
                    {hero.poster.emptyTitle}
                  </h2>
                  <p className="text-xs font-normal text-ink-muted">
                    {hero.poster.emptySubtitle}
                  </p>
                </div>

                <footer className="border-t border-border pt-3 text-xs font-normal text-ink-muted">
                  زمان نشست: {formattedDate}
                </footer>
              </article>
            )}
          </aside>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs font-normal text-ink-muted gap-2">
        <span>EPD English Discussion Club</span>
        <span>تجربه · بازی · توسعه</span>
      </footer>
    </div>
  );
}
