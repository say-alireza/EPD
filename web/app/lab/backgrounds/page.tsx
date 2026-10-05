"use client";

import { useState } from "react";
import Link from "next/link";
import { EpdLogo } from "@/components/ui/logo";

type BgType = "grid" | "ambient" | "dots" | "waves" | "clean";

export default function BackgroundsLabPage() {
  const [selectedBg, setSelectedBg] = useState<BgType>("grid");

  return (
    <div className="relative min-h-screen text-ink overflow-x-hidden transition-colors duration-500">
      {/* 1. BACKGROUND LAYERS */}
      {selectedBg === "clean" && (
        <div className="fixed inset-0 -z-10 bg-[#F8F9FA]" />
      )}

      {selectedBg === "grid" && (
        <div className="fixed inset-0 -z-10 bg-[#F8F9FA]">
          {/* Subtle blueprint grid with radial mask */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(27, 37, 64, 0.05) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(27, 37, 64, 0.05) 1px, transparent 1px)
              `,
              backgroundSize: "32px 32px",
              maskImage: "radial-gradient(ellipse 70% 60% at 50% 20%, black 40%, transparent 100%)",
              WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 20%, black 40%, transparent 100%)",
            }}
          />
        </div>
      )}

      {selectedBg === "ambient" && (
        <div className="fixed inset-0 -z-10 bg-[#F8F9FA] overflow-hidden">
          {/* Soft EPD brand ambient glows */}
          <div className="absolute -top-32 -right-32 w-96 sm:w-[520px] h-96 sm:h-[520px] rounded-full bg-brand-teal/10 blur-[100px] pointer-events-none" />
          <div className="absolute top-1/4 -left-32 w-80 sm:w-[480px] h-80 sm:h-[480px] rounded-full bg-brand-primary/5 blur-[120px] pointer-events-none" />
          <div className="absolute -bottom-32 left-1/3 w-80 sm:w-[440px] h-80 sm:h-[440px] rounded-full bg-brand-gold/10 blur-[110px] pointer-events-none" />
        </div>
      )}

      {selectedBg === "dots" && (
        <div className="fixed inset-0 -z-10 bg-[#F8F9FA]">
          {/* Minimal dot matrix with radial mask */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(rgba(27, 37, 64, 0.12) 1.2px, transparent 1.2px)",
              backgroundSize: "24px 24px",
              maskImage: "radial-gradient(ellipse 75% 65% at 50% 25%, black 45%, transparent 100%)",
              WebkitMaskImage: "radial-gradient(ellipse 75% 65% at 50% 25%, black 45%, transparent 100%)",
            }}
          />
        </div>
      )}

      {selectedBg === "waves" && (
        <div className="fixed inset-0 -z-10 bg-[#F8F9FA] overflow-hidden">
          {/* Subtle light contours / waves */}
          <svg
            className="absolute inset-0 w-full h-full opacity-40 pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 900"
            preserveAspectRatio="none"
          >
            <path
              d="M0,160L80,186.7C160,213,320,267,480,266.7C640,267,800,213,960,192C1120,171,1280,181,1360,186.7L1440,192L1440,900L1360,900C1280,900,1120,900,960,900C800,900,640,900,480,900C320,900,160,900,80,900L0,900Z"
              fill="rgba(52, 205, 187, 0.03)"
            />
            <path
              d="M0,320L60,309.3C120,299,240,277,360,288C480,299,600,341,720,336C840,331,960,277,1080,261.3C1200,245,1320,267,1380,277.3L1440,288L1440,900L1380,900C1320,900,1200,900,1080,900C960,900,840,900,720,900C600,900,480,900,360,900C240,900,120,900,60,900L0,900Z"
              fill="rgba(27, 37, 64, 0.02)"
            />
          </svg>
        </div>
      )}

      {/* 2. TOP BAR & PREVIEW CONTROLS */}
      <header className="sticky top-0 z-40 bg-surface/85 backdrop-blur-md border-b border-border shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="shrink-0">
              <EpdLogo className="h-8 w-auto" variant="lockup" />
            </Link>
            <span className="text-xs font-bold text-ink-muted border-s border-border ps-3">
              آزمایشگاه پس‌زمینه‌های تم EPD
            </span>
          </div>

          {/* Interactive Preset Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap bg-ground p-1 rounded-xl border border-border">
            {[
              { id: "grid", label: "گرید مهندسی (Blueprint)" },
              { id: "ambient", label: "هاله‌های نوری ملایم (Ambient)" },
              { id: "dots", label: "ماتریس نقطه‌ای (Dots)" },
              { id: "waves", label: "امواج نرم (Waves)" },
              { id: "clean", label: "سفید مینیمال (Clean)" },
            ].map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setSelectedBg(preset.id as BgType)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  selectedBg === preset.id
                    ? "bg-brand-primary text-white shadow-xs"
                    : "text-ink-muted hover:text-ink hover:bg-surface"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* 3. SIMULATED HERO CONTENT ON TOP OF BACKGROUND */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20 flex flex-col items-center text-center gap-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-teal/30 bg-brand-teal/10 text-brand-teal text-xs font-bold">
          <span>حالت پیش‌نمایش پس‌زمینه</span>
          <span className="text-ink-muted">•</span>
          <span className="text-ink font-mono">{selectedBg}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-ink tracking-tight max-w-2xl leading-tight">
          دورهمی‌های مهندسی نرم‌افزار و انتقال تجربه
        </h1>

        <p className="text-base sm:text-lg text-ink-muted max-w-xl leading-relaxed">
          این یک صفحه پیش‌نمایش زنده است تا دقیقا ببینی هر پس‌زمینه در کنار فونت وزیرمتن، کارت‌ها و پالت رنگی EPD چطور دیده میشه.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="px-6 py-3 rounded-xl bg-brand-primary text-white text-sm font-bold shadow-sm hover:opacity-95 transition-opacity"
          >
            ثبت‌نام در نشست جاری
          </button>
          <Link
            href="/"
            className="px-6 py-3 rounded-xl bg-surface border border-border text-ink text-sm font-bold hover:bg-surface-hover transition-colors"
          >
            بازگشت به سایت اصلی
          </Link>
        </div>

        {/* Demo Cards to test surface contrast */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mt-8 text-start">
          <div className="p-5 rounded-2xl bg-surface border border-border shadow-xs flex flex-col gap-2">
            <span className="text-xs font-bold text-brand-teal">نشست‌های دوره‌ای</span>
            <h3 className="text-base font-extrabold text-ink">گفتگوی عمیق و تخصصی</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              بررسی چالش‌های واقعی کد، ابزارها و معماری در فضای تعاملی و حضوری.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-surface border border-border shadow-xs flex flex-col gap-2">
            <span className="text-xs font-bold text-brand-accent">پذیرش محدود</span>
            <h3 className="text-base font-extrabold text-ink">رزرو سریع صندلی</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              ثبت‌نام آنلاین به همراه اتصال شاپرک جهت تضمین حضور اعضای فعال.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-surface border border-border shadow-xs flex flex-col gap-2">
            <span className="text-xs font-bold text-brand-gold">آرشیو دورهمی‌ها</span>
            <h3 className="text-base font-extrabold text-ink">گالری و ارائه‌ها</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              دسترسی به اسلایدها، پوسترها و عکس‌های یادگاری هر نشست.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
