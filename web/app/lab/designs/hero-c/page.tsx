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

export default function HeroCVariant() {
  const [showPoster, setShowPoster] = useState(true);
  const { hero } = strings.landing;
  const formattedDate = getFormattedJalaliDate();

  return (
    <div className="min-h-screen bg-ground text-ink flex flex-col justify-between p-4 sm:p-6 lg:p-12">
      {/* Dev / Lab Control Toggle */}
      <div className="w-full max-w-6xl mx-auto mb-6 flex items-center justify-between border-b border-border pb-4">
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
        <span className="text-xs text-ink-muted">Variant C: Editorial Split with Data Matrix</span>
      </div>

      {/* Main Container */}
      <main className="w-full max-w-6xl mx-auto my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left/Start Column: Brand + Headline + Data Matrix + CTA (7 cols) */}
        <section className="lg:col-span-7 bg-surface border border-border p-6 sm:p-10 flex flex-col justify-between gap-8 text-start">
          <div className="space-y-6">
            <header className="flex items-center justify-between border-b border-border pb-4">
              <EpdLogo className="h-10 w-auto" />
              <div className="inline-flex items-center gap-2 text-xs font-normal text-ink ps-1">
                <span className="w-2 h-2 rounded-full bg-brand-teal shrink-0" />
                <span>{hero.spotsRemaining}</span>
              </div>
            </header>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-ink leading-snug">
              {hero.headline}
            </h1>
          </div>

          {/* Structured Factual Session Matrix (2x2 grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-y border-border py-6">
            <div className="space-y-1">
              <span className="text-xs font-normal text-ink-muted">
                {hero.details.locationLabel}
              </span>
              <p className="text-sm font-extrabold text-ink">
                {hero.details.locationValue}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-normal text-ink-muted">
                {hero.details.timeLabel}
              </span>
              <p className="text-sm font-extrabold text-ink">
                {hero.details.timeValue}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-normal text-ink-muted">
                {hero.details.levelLabel}
              </span>
              <p className="text-sm font-extrabold text-ink">
                {hero.details.levelValue}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-normal text-ink-muted">
                {hero.details.capacityLabel}
              </span>
              <p className="text-sm font-extrabold text-ink">
                {hero.details.capacityValue}
              </p>
            </div>
          </div>

          {/* Register Action */}
          <div>
            <Link
              href="/register"
              className="w-full inline-flex items-center justify-center px-6 py-4 bg-brand-accent text-surface font-extrabold text-base transition-opacity hover:opacity-90 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
            >
              {hero.cta}
            </Link>
          </div>
        </section>

        {/* Right/End Column: Dedicated Paper Poster (5 cols) */}
        <aside className="lg:col-span-5 flex">
          {showPoster ? (
            <article className="w-full bg-surface border border-brand-primary p-6 sm:p-8 flex flex-col justify-between text-start">
              <header className="flex items-center justify-between border-b border-border pb-4">
                <span className="px-2 py-1 bg-brand-gold text-ink text-xs font-extrabold">
                  {formattedDate}
                </span>
                <span className="text-xs font-normal text-ink-muted">
                  {hero.poster.badge}
                </span>
              </header>

              <div className="my-auto py-8 space-y-4">
                <span className="text-xs font-normal text-ink-muted uppercase tracking-widest">
                  Topic of the Week
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-ink leading-tight">
                  {hero.poster.topicTitle}
                </h2>
                <p className="text-sm font-normal text-ink-muted leading-relaxed">
                  {hero.poster.topicSubtitle}
                </p>
              </div>

              <footer className="border-t border-border pt-4 text-xs font-normal text-ink-muted flex items-center justify-between">
                <span dir="ltr">{hero.poster.venueEn}</span>
                <span dir="ltr">{hero.poster.timeEn}</span>
              </footer>
            </article>
          ) : (
            <article className="w-full bg-surface border border-dashed border-brand-primary p-6 sm:p-8 flex flex-col justify-between text-start">
              <header className="flex items-center justify-between border-b border-border pb-4">
                <span className="text-xs font-normal text-ink-muted">
                  {hero.poster.badge}
                </span>
                <span className="text-xs font-normal text-brand-teal">
                  ثبت‌نام باز
                </span>
              </header>

              <div className="my-auto py-8 space-y-4">
                <h2 className="text-xl font-extrabold text-ink">
                  {hero.poster.emptyTitle}
                </h2>
                <p className="text-sm font-normal text-ink-muted leading-relaxed">
                  {hero.poster.emptySubtitle}
                </p>
                <div className="p-4 bg-ground border border-border text-xs font-normal text-ink space-y-1">
                  <div>تاریخ: {formattedDate}</div>
                  <div>مکان: مشهد، بلوار سجاد</div>
                </div>
              </div>

              <footer className="border-t border-border pt-4 text-xs font-normal text-ink-muted">
                ظرفیت این نشست در حال تکمیل است
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
