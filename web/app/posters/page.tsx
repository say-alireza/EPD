"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { EpdLogo } from "@/components/ui/logo";
import { DeveloperBadge } from "@/components/ui/developer-badge";
import { strings } from "@/lib/strings";
import { assetPath } from "@/lib/asset";
import postersData from "@/data/posters.json";
import { PosterItem } from "@/lib/types";

export default function PostersPage() {
  const { pastPosters } = strings.landing;
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedPoster, setSelectedPoster] = useState<PosterItem | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedPoster(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
                onClick={() => setSelectedPoster(poster)}
                className="bg-surface border border-border rounded-xl p-3 flex flex-col gap-3 group hover:border-brand-primary hover:shadow-md transition-all duration-200 shadow-2xs cursor-pointer"
              >
                <div className="relative w-full aspect-[4/5] bg-black/5 rounded-lg overflow-hidden border border-border/80">
                  <Image
                    src={assetPath(poster.image)}
                    alt={poster.topicEn}
                    width={800}
                    height={1000}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-200 flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-surface/90 text-ink text-[11px] font-bold px-2.5 py-1 rounded-md shadow-sm">
                      مشاهده اندازه کامل
                    </span>
                  </div>
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

      {/* Lightbox Modal */}
      {selectedPoster && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          onClick={() => setSelectedPoster(null)}
        >
          <div
            className="relative max-w-2xl w-full max-h-[92vh] flex flex-col items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPoster(null)}
              className="absolute -top-10 left-0 text-white/80 hover:text-white text-sm font-bold bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg transition-colors cursor-pointer"
            >
              بستن ✕
            </button>
            <div className="relative w-full max-h-[80vh] flex items-center justify-center rounded-xl overflow-hidden border border-white/15 bg-black/50 shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={assetPath(selectedPoster.image)}
                alt={selectedPoster.topicEn}
                className="max-h-[80vh] w-auto max-w-full object-contain rounded-xl"
              />
            </div>
            <div className="w-full flex items-center justify-between text-white/90 text-xs sm:text-sm px-2">
              <span className="font-extrabold text-brand-gold">
                {selectedPoster.sessionLabel || `جلسه ${selectedPoster.sessionNumber}`}
              </span>
              <span className="font-bold font-mono" dir="ltr">
                {selectedPoster.topicEn}
              </span>
              <span className="text-white/70">{selectedPoster.dateFa}</span>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full border-t border-border py-6 bg-surface mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-ink-muted gap-4 text-center sm:text-start">
          <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3 text-[11px] sm:text-xs">
            <span className="font-medium text-ink">EPD English Discussion Club</span>
            <span className="hidden sm:inline text-border">•</span>
            <span>{strings.landing.footer.allRights}</span>
          </div>
          <DeveloperBadge />
        </div>
      </footer>
    </div>
  );
}
