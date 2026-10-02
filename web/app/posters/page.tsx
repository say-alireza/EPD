"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { EpdLogo } from "@/components/ui/logo";
import { strings } from "@/lib/strings";
import { assetPath } from "@/lib/asset";
import postersData from "@/data/posters.json";
import { PosterItem } from "@/lib/types";

export default function PostersPage() {
  const { pastPosters } = strings.landing;
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories = [
    { id: "all", label: "همه پوسترها", count: postersData.length },
    {
      id: "new-chapter",
      label: "فصل جدید (نشست‌های ۲۰۰ تا ۲۱۲)",
      count: postersData.filter((p) => p.category === "new-chapter").length,
    },
    {
      id: "weekly-1405",
      label: "نشست‌های تابستان ۱۴۰۵ (۱۹۰ تا ۱۹۹)",
      count: postersData.filter((p) => p.category === "weekly-1405").length,
    },
    {
      id: "courses",
      label: "دوره‌های آموزشی پیشین (دوره ۹ تا ۱۱)",
      count: postersData.filter((p) => p.category === "courses").length,
    },
  ];

  const filteredPosters = (postersData as PosterItem[]).filter((p) => {
    if (activeCategory === "all") return true;
    return p.category === activeCategory;
  });

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
          <div className="space-y-3 max-w-3xl">
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

          {/* Timeline & Numbering Context Banner */}
          <div className="bg-surface border border-border/80 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1 text-xs sm:text-sm">
              <span className="font-extrabold text-brand-primary block">
                تایم‌لاین و تاریخچه بیش از ۲۰۰ نشست EPD
              </span>
              <p className="text-ink-muted leading-relaxed">
                از خرداد ۱۴۰۱ تا اوایل ۱۴۰۵، نشست‌های EPD در قالب دوره‌های جامع (دوره‌های ۱ تا ۱۱ — شامل بیش از ۱۷۰ جلسه) برگزار می‌شد. از تابستان ۱۴۰۵، ساختار جلسات به شماره‌گذاری هفتگی تک‌جلسه‌ای ارتقا یافت و تا نشست ۲۱۲ کنونی ادامه دارد.
              </p>
            </div>
            <span className="px-3 py-1.5 bg-brand-gold/15 text-brand-primary font-mono font-black text-xs rounded-lg shrink-0">
              +۲۰۰ Sessions
            </span>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4">
            {categories.map((cat) => {
              const active = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
                    active
                      ? "bg-brand-primary text-surface shadow-2xs"
                      : "bg-surface text-ink-muted border border-border hover:text-ink hover:border-brand-primary"
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      active
                        ? "bg-surface/20 text-surface"
                        : "bg-ground text-ink-muted"
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Posters Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredPosters.map((poster) => (
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
                    {poster.sessionLabel || `${pastPosters.sessionPrefix} ${poster.sessionNumber}`}
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
