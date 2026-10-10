"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { EpdLogo } from "@/components/ui/logo";
import { getTelegramWebApp, triggerHaptic, TelegramUser } from "@/lib/telegram-webapp";
import { Session, UpcomingSession } from "@/lib/types";

export default function TelegramMiniApp() {
  const [tgUser, setTgUser] = useState<TelegramUser | null>(null);
  const [session, setSession] = useState<UpcomingSession | null>(null);
  const [slots, setSlots] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [languageLevel, setLanguageLevel] = useState<"beginner" | "intermediate" | "advanced">("intermediate");
  const [socialHandle, setSocialHandle] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successTicket, setSuccessTicket] = useState<{
    id: string;
    fullName: string;
    slotTitle: string;
    date: string;
    venue: string;
  } | null>(null);

  // Initialize Telegram WebApp
  useEffect(() => {
    const tg = getTelegramWebApp();
    if (tg) {
      try {
        tg.ready();
        tg.expand();
      } catch (e) {
        console.error("Failed to initialize Telegram WebApp:", e);
      }
    }

    // Fetch live session and slots
    Promise.all([
      fetch("/api/upcoming/").then((r) => r.json()).catch(() => null),
      fetch("/api/sessions/").then((r) => r.json()).catch(() => []),
    ]).then(([upcomingData, slotsData]) => {
      if (upcomingData) setSession(upcomingData);
      if (Array.isArray(slotsData)) {
        setSlots(slotsData);
        // Pre-select first available slot
        const available = slotsData.find((s) => !s.isFull && s.remainingSeats > 0);
        if (available) setSelectedSlotId(available.id);
      }
      if (tg?.initDataUnsafe?.user) {
        const u = tg.initDataUnsafe.user;
        setTgUser(u);
        const detectedName = [u.first_name, u.last_name].filter(Boolean).join(" ").trim();
        if (detectedName) setFullName(detectedName);
        if (u.username) setSocialHandle(`@${u.username}`);
      }
      setIsLoading(false);
    });
  }, []);

  const selectedSlot = slots.find((s) => s.id === selectedSlotId);
  const feeTomans =
    selectedSlot?.feeTomans !== undefined
      ? selectedSlot.feeTomans
      : (session?.feeTomans ?? 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim()) {
      setErrorMessage("لطفاً نام و نام خانوادگی خود را وارد کنید.");
      triggerHaptic("error");
      return;
    }

    const cleanMobile = mobile.replace(/[\s-]/g, "").replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
    if (!/^09\d{9}$/.test(cleanMobile)) {
      setErrorMessage("شماره موبایل نامعتبر است (مثال: 09123456789).");
      triggerHaptic("error");
      return;
    }

    if (!selectedSlotId) {
      setErrorMessage("لطفاً یکی از سانس‌های فعال را انتخاب کنید.");
      triggerHaptic("error");
      return;
    }

    setIsSubmitting(true);
    triggerHaptic("medium");

    try {
      const res = await fetch("/api/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          mobile: cleanMobile,
          sessionId: selectedSlotId,
          languageLevel,
          socialHandle: socialHandle || (tgUser?.username ? `@${tgUser.username}` : undefined),
          acceptTerms: true,
          heardFrom: "telegram",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "خطا در ثبت اطلاعات");
      }

      triggerHaptic("success");

      // Handle payment redirection if paid
      if (data.paymentUrl) {
        const tg = getTelegramWebApp();
        if (tg?.openLink) {
          tg.openLink(data.paymentUrl);
        } else {
          window.location.href = data.paymentUrl;
        }
        return;
      }

      // Free registration confirmed
      setSuccessTicket({
        id: data.registrationId || "EPD-" + Math.floor(1000 + Math.random() * 9000),
        fullName: fullName.trim(),
        slotTitle: selectedSlot?.title || "سانس انتخابی",
        date: session ? `${session.timeFa}` : "جلسه جاری",
        venue: session?.venueFa || "محل برگزاری EPD",
      });
    } catch (err) {
      triggerHaptic("error");
      setErrorMessage(err instanceof Error ? err.message : "خطایی در ثبت‌نام رخ داد.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    const tg = getTelegramWebApp();
    if (tg?.close) {
      tg.close();
    } else {
      window.history.back();
    }
  };

  return (
    <>
      <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      <div className="min-h-screen bg-ground text-ink px-4 py-5 max-w-md mx-auto flex flex-col justify-between">
        {/* Top App Header */}
        <header className="flex items-center justify-between pb-4 border-b border-border/80">
          <div className="flex items-center gap-2.5">
            <EpdLogo className="h-8 w-auto text-brand-teal" />
            <div>
              <h1 className="text-sm font-bold text-ink leading-tight">باشگاه گفتگوی انگلیسی EPD</h1>
              <p className="text-[11px] text-ink-muted">رزرو صندلی و ثبت‌نام سریع</p>
            </div>
          </div>
          {session && (
            <span className="text-[10px] font-semibold bg-brand-primary/10 text-brand-primary border border-brand-primary/20 px-2.5 py-1 rounded-full">
              نشست #{session.number}
            </span>
          )}
        </header>

        {/* Content Area */}
        <main className="flex-1 py-4 space-y-4">
          {isLoading ? (
            <div className="space-y-3 py-10 text-center">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
              <p className="text-xs text-ink-muted">در حال دریافت مشخصات نشست جاری...</p>
            </div>
          ) : successTicket ? (
            /* Success Ticket */
            <div className="epd-card p-5 space-y-4 text-center border-brand-teal/40">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl font-bold">
                ✓
              </div>
              <div>
                <h2 className="text-base font-bold text-ink">ثبت‌نام شما با موفقیت انجام شد</h2>
                <p className="text-xs text-ink-muted mt-1">صندلی شما در این نشست رزرو گردید.</p>
              </div>

              <div className="bg-ground-muted rounded-xl p-3.5 text-right space-y-2 text-xs border border-border">
                <div className="flex justify-between">
                  <span className="text-ink-muted">نام شرکت‌کننده:</span>
                  <span className="font-semibold text-ink">{successTicket.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">سانس:</span>
                  <span className="font-semibold text-ink">{successTicket.slotTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">زمان:</span>
                  <span className="font-semibold text-ink">{successTicket.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">کد پیگیری:</span>
                  <span className="font-mono font-bold text-brand-teal">{successTicket.id}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-[#1F2B5B] hover:bg-[#182247] transition-colors"
              >
                بازگشت به چت تلگرام
              </button>
            </div>
          ) : (
            <>
              {/* Session Overview Card */}
              {session && (
                <div className="epd-card p-4 space-y-2.5 bg-brand-primary/[0.03]">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-sm font-bold text-ink leading-snug">
                      {session.topicEn || "English Discussion Session"}
                    </h2>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-border/60">
                    <div>
                      <span className="text-ink-muted block text-[10px]">زمان:</span>
                      <span className="font-medium text-ink">{session.timeFa}</span>
                    </div>
                    <div>
                      <span className="text-ink-muted block text-[10px]">محل برگزاری:</span>
                      <span className="font-medium text-ink truncate block" title={session.venueFa}>
                        {session.venueFa}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Registration Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {errorMessage && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs text-center font-medium">
                    {errorMessage}
                  </div>
                )}

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">نام و نام خانوادگی</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="مثال: علی رضایی"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-ground-muted focus:outline-none focus:ring-1 focus:ring-brand-teal transition-colors"
                  />
                </div>

                {/* Mobile Phone */}
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">شماره موبایل (جهت هماهنگی)</label>
                  <input
                    type="tel"
                    dir="ltr"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="09123456789"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-ground-muted focus:outline-none focus:ring-1 focus:ring-brand-teal transition-colors text-right"
                  />
                </div>

                {/* Slots Selection */}
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1.5">انتخاب سانس</label>
                  <div className="space-y-1.5">
                    {slots.map((s) => {
                      const isSelected = s.id === selectedSlotId;
                      const isFull = s.isFull || s.remainingSeats <= 0;
                      return (
                        <div
                          key={s.id}
                          onClick={() => {
                            if (!isFull) {
                              setSelectedSlotId(s.id);
                              triggerHaptic("light");
                            }
                          }}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                            isSelected
                              ? "border-brand-teal bg-brand-teal/5 font-semibold"
                              : isFull
                              ? "opacity-40 border-border bg-ground-muted cursor-not-allowed"
                              : "border-border hover:border-brand-teal/50 bg-ground-muted"
                          }`}
                        >
                          <div>
                            <div className="text-ink">{s.title}</div>
                            <div className="text-[10px] text-ink-muted">
                              {isFull ? "ظرفیت تکمیل" : `${s.remainingSeats} صندلی باقیمانده`}
                            </div>
                          </div>
                          <div className="text-start">
                            <span className="text-[11px] font-bold text-brand-primary">
                              {s.feeFa || (s.feeTomans === 0 ? "رایگان" : `${s.feeTomans?.toLocaleString()} ت`)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Language Level */}
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1.5">سطح زبان انگلیسی شما</label>
                  <div className="grid grid-cols-3 gap-1.5 text-xs">
                    {(
                      [
                        { id: "beginner", title: "مبتدی" },
                        { id: "intermediate", title: "متوسط" },
                        { id: "advanced", title: "پیشرفته" },
                      ] as const
                    ).map((lvl) => {
                      const isSelected = languageLevel === lvl.id;
                      return (
                        <button
                          key={lvl.id}
                          type="button"
                          onClick={() => {
                            setLanguageLevel(lvl.id);
                            triggerHaptic("light");
                          }}
                          className={`py-2 px-1 rounded-xl border transition-colors text-center text-xs ${
                            isSelected
                              ? "border-brand-teal bg-brand-teal text-white font-semibold"
                              : "border-border bg-ground-muted text-ink hover:border-brand-teal/50"
                          }`}
                        >
                          {lvl.title}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit Action Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || slots.length === 0}
                    className="w-full py-3 px-4 rounded-xl font-bold text-xs text-white bg-[#1F2B5B] hover:bg-[#182247] active:scale-[0.99] disabled:opacity-50 transition-all shadow-sm"
                  >
                    {isSubmitting
                      ? "در حال ثبت اطلاعات..."
                      : feeTomans > 0
                      ? `پرداخت ورودی و رزرو (${feeTomans.toLocaleString()} تومان)`
                      : "رزرو قطعی صندلی"}
                  </button>
                </div>
              </form>
            </>
          )}
        </main>

        {/* Minimal Footer */}
        <footer className="pt-3 border-t border-border/60 text-center text-[10px] text-ink-muted">
          باشگاه گفتگوی انگلیسی EPD • نشست‌های هفتگی در کافه‌های مشهد
        </footer>
      </div>
    </>
  );
}
