"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { EpdLogo } from "@/components/ui/logo";
import { strings } from "@/lib/strings";
import { assetPath } from "@/lib/asset";
import galleryData from "@/data/gallery.json";
import { GalleryItem } from "@/lib/types";

export default function GalleryPage() {
  const { gallery } = strings.landing;
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedItem(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const categories = [
    { id: "all", label: "همه تصاویر", count: galleryData.length },
    {
      id: "scoreboard",
      label: "لیگ بازی‌ها و اسکوربورد (Quest for Victory)",
      count: galleryData.filter((i) => i.category === "scoreboard" || i.isScoreboard).length,
    },
    {
      id: "new-chapter",
      label: "فصل جدید (نشست‌های ۲۰۰ تا ۲۱۲)",
      count: galleryData.filter((i) => i.category === "new-chapter").length,
    },
    {
      id: "weekly-1405",
      label: "نشست‌های تابستان ۱۴۰۵ (۱۹۰ تا ۱۹۹)",
      count: galleryData.filter((i) => i.category === "weekly-1405").length,
    },
    {
      id: "courses",
      label: "دوره‌های آموزشی پیشین (دوره ۸ تا ۱۱)",
      count: galleryData.filter((i) => i.category === "courses").length,
    },
  ];

  const filteredItems = (galleryData as GalleryItem[]).filter((item) => {
    if (activeCategory === "all") return true;
    if (activeCategory === "scoreboard") {
      return item.category === "scoreboard" || item.isScoreboard;
    }
    return item.category === activeCategory;
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

        {/* Main Gallery Archive */}
        <main className="my-12 space-y-8 text-start">
          <div className="space-y-3 max-w-3xl">
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

          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <article
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="bg-surface border border-border rounded-xl overflow-hidden flex flex-col group shadow-xs hover:border-brand-primary hover:shadow-md transition-all duration-200 cursor-pointer"
                >
                  <div className="relative w-full aspect-[4/3] bg-ground overflow-hidden">
                    {item.isVideo || item.image.endsWith(".mp4") ? (
                      <video
                        src={assetPath(item.image)}
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                        autoPlay
                        loop
                        muted
                        playsInline
                      />
                    ) : (
                      <Image
                        src={assetPath(item.image)}
                        alt={`تصویر ${item.sessionLabel || `جلسه ${item.sessionNumber}`}`}
                        width={800}
                        height={600}
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-200 flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-surface/90 text-ink text-[11px] font-bold px-2.5 py-1 rounded-md shadow-sm">
                        {item.isVideo || item.image.endsWith(".mp4") ? "پخش ویدیوی کامل" : "مشاهده اندازه کامل"}
                      </span>
                    </div>
                    <div className="absolute bottom-3 start-3 bg-ink/85 text-surface px-2.5 py-1 rounded text-xs font-bold shadow-xs">
                      {item.sessionLabel || `جلسه ${item.sessionNumber}`}
                    </div>
                    {item.isScoreboard && (
                      <div className="absolute top-3 end-3 bg-brand-primary text-surface px-2.5 py-1 rounded text-[11px] font-extrabold shadow-xs">
                        لیگ Quest for Victory
                      </div>
                    )}
                  </div>
                  {item.captionFa && (
                    <div className="p-3 text-xs text-ink-muted border-t border-border/60">
                      {item.captionFa}
                    </div>
                  )}
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

      {/* Lightbox Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[92vh] flex flex-col items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute -top-10 left-0 text-white/80 hover:text-white text-sm font-bold bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg transition-colors cursor-pointer"
            >
              بستن ✕
            </button>
            <div className="relative w-full max-h-[80vh] flex items-center justify-center rounded-xl overflow-hidden border border-white/15 bg-black/50 shadow-2xl">
              {selectedItem.isVideo || selectedItem.image.endsWith(".mp4") ? (
                <video
                  src={assetPath(selectedItem.image)}
                  className="max-h-[80vh] w-auto max-w-full object-contain rounded-xl"
                  controls
                  autoPlay
                  loop
                  playsInline
                />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={assetPath(selectedItem.image)}
                  alt={selectedItem.captionFa || `جلسه ${selectedItem.sessionNumber}`}
                  className="max-h-[80vh] w-auto max-w-full object-contain rounded-xl"
                />
              )}
            </div>
            <div className="w-full flex items-center justify-between text-white/90 text-xs sm:text-sm px-2">
              <span className="font-extrabold text-brand-gold">
                {selectedItem.sessionLabel || `جلسه ${selectedItem.sessionNumber}`}
              </span>
              {selectedItem.captionFa && (
                <span className="text-white/80">{selectedItem.captionFa}</span>
              )}
            </div>
          </div>
        </div>
      )}

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
