"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { EpdLogo } from "@/components/ui/logo";

type BgType = "mesh" | "grid-beam" | "particles" | "waves" | "dots";

export default function BackgroundsLabPage() {
  const [selectedBg, setSelectedBg] = useState<BgType>("mesh");
  const [intensity, setIntensity] = useState<number>(60); // 20 to 100%
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Particles / Interactive Network Animation
  useEffect(() => {
    if (selectedBg !== "particles") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const count = 45;
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      radius: Math.random() * 2 + 1.5,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      const alphaMul = intensity / 100;

      // Draw connections
      for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(27, 37, 64, ${(1 - dist / 130) * 0.25 * alphaMul})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // Draw points
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(52, 205, 187, ${0.7 * alphaMul})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, [selectedBg, intensity]);

  // Flowing Waves Animation
  useEffect(() => {
    if (selectedBg !== "waves") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    let step = 0;
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      step += 0.015;
      const alphaMul = intensity / 100;

      const drawWave = (
        yOffset: number,
        frequency: number,
        amplitude: number,
        color: string
      ) => {
        ctx.beginPath();
        ctx.moveTo(0, height);
        for (let x = 0; x <= width; x += 10) {
          const y =
            yOffset +
            Math.sin(x * frequency + step) * amplitude +
            Math.cos(x * 0.005 + step * 0.8) * (amplitude * 0.5);
          ctx.lineTo(x, y);
        }
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
      };

      // 3 Layers of soft waves
      drawWave(
        height * 0.65,
        0.003,
        45,
        `rgba(52, 205, 187, ${0.12 * alphaMul})`
      );
      drawWave(
        height * 0.72,
        0.004,
        35,
        `rgba(27, 37, 64, ${0.08 * alphaMul})`
      );
      drawWave(
        height * 0.8,
        0.002,
        50,
        `rgba(249, 218, 76, ${0.1 * alphaMul})`
      );

      animId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, [selectedBg, intensity]);

  const opacityFactor = intensity / 100;

  return (
    <div className="relative min-h-screen text-ink overflow-x-hidden selection:bg-brand-teal/20">
      {/* ==================== 1. LIVE BACKGROUNDS ==================== */}

      {/* Base Canvas for procedural types */}
      {(selectedBg === "particles" || selectedBg === "waves") && (
        <canvas
          ref={canvasRef}
          className="fixed inset-0 -z-10 pointer-events-none bg-[#F8F9FA]"
        />
      )}

      {/* Option A: Animated Mesh Glow (گرادیانت نوری زنده و روان) */}
      {selectedBg === "mesh" && (
        <div className="fixed inset-0 -z-10 bg-[#F4F6F9] overflow-hidden">
          {/* Cyan / Teal Orb */}
          <div
            className="absolute -top-24 -right-24 w-[500px] h-[500px] rounded-full blur-[90px] animate-pulse"
            style={{
              background: "radial-gradient(circle, #34CDBB 0%, transparent 70%)",
              opacity: 0.35 * opacityFactor,
              animationDuration: "7s",
            }}
          />
          {/* Deep Navy Orb */}
          <div
            className="absolute top-1/3 -left-32 w-[600px] h-[600px] rounded-full blur-[110px]"
            style={{
              background: "radial-gradient(circle, #1B2540 0%, transparent 70%)",
              opacity: 0.25 * opacityFactor,
            }}
          />
          {/* Warm Amber Orb */}
          <div
            className="absolute -bottom-24 right-1/4 w-[450px] h-[450px] rounded-full blur-[100px]"
            style={{
              background: "radial-gradient(circle, #FBC757 0%, transparent 70%)",
              opacity: 0.3 * opacityFactor,
            }}
          />
          {/* Soft White Center Light */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(255,255,255,0.7) 0%, transparent 100%)",
            }}
          />
        </div>
      )}

      {/* Option B: Clear Blueprint Grid with Light Beam (گرید مشخص و خطوط شیک مهندسی) */}
      {selectedBg === "grid-beam" && (
        <div className="fixed inset-0 -z-10 bg-[#F8F9FA]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(27, 37, 64, ${0.18 * opacityFactor}) 1.5px, transparent 1.5px),
                linear-gradient(to bottom, rgba(27, 37, 64, ${0.18 * opacityFactor}) 1.5px, transparent 1.5px)
              `,
              backgroundSize: "36px 36px",
            }}
          />
          {/* Subtle Ambient Vignette */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 50% 25%, transparent 30%, #F8F9FA 90%)",
            }}
          />
        </div>
      )}

      {/* Option C: High-Contrast Clean Dot Matrix (نقاط ماتریس مشخص و تمیز) */}
      {selectedBg === "dots" && (
        <div className="fixed inset-0 -z-10 bg-[#F6F8FA]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(rgba(27, 37, 64, ${0.35 * opacityFactor}) 2px, transparent 2px)`,
              backgroundSize: "28px 28px",
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 75% 65% at 50% 30%, transparent 20%, #F6F8FA 85%)",
            }}
          />
        </div>
      )}

      {/* ==================== 2. CONTROL HEADER ==================== */}
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-border shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="shrink-0">
              <EpdLogo className="h-8 w-auto" variant="lockup" />
            </Link>
            <span className="text-xs font-bold text-ink-muted border-s border-border ps-3">
              آزمایشگاه زنده پس‌زمینه‌ها
            </span>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap bg-ground p-1 rounded-xl border border-border">
            {[
              { id: "mesh", label: "۱. گرادیانت نوری زنده (Mesh)" },
              { id: "grid-beam", label: "۲. گرید مهندسی مشخص (Grid)" },
              { id: "particles", label: "۳. ذرات متصل شناور (Network)" },
              { id: "waves", label: "۴. امواج مواج زنده (Waves)" },
              { id: "dots", label: "۵. نقاط ماتریس واضح (Dots)" },
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

          {/* Opacity / Intensity Slider */}
          <div className="flex items-center gap-2 bg-ground px-3 py-1.5 rounded-xl border border-border text-xs">
            <span className="font-bold text-ink-muted">وضوح:</span>
            <input
              type="range"
              min="20"
              max="100"
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              className="w-20 accent-brand-teal cursor-pointer"
            />
            <span className="font-mono text-ink font-bold w-7 text-end">{intensity}%</span>
          </div>
        </div>
      </header>

      {/* ==================== 3. CONTENT ON TOP OF BACKGROUND ==================== */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20 flex flex-col items-center text-center gap-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-teal/40 bg-surface/80 backdrop-blur-xs text-brand-teal text-xs font-bold shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-brand-teal animate-ping" />
          <span>پیش‌نمایش فعال: {selectedBg}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-ink tracking-tight max-w-2xl leading-tight">
          دورهمی‌های مهندسی نرم‌افزار و انتقال تجربه
        </h1>

        <p className="text-base sm:text-lg text-ink-muted max-w-xl leading-relaxed">
          حالا تمام پترن‌ها واضح، پویا و زنده هستند. اسلایدر بالای صفحه رو هم می‌تونی کم و زیاد کنی تا بهترین تعادل بین خوانایی متن و جذابیت پس‌زمینه رو پیدا کنی.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="px-6 py-3 rounded-xl bg-brand-primary text-white text-sm font-bold shadow-md hover:opacity-95 transition-all"
          >
            ثبت‌نام در نشست جاری
          </button>
          <Link
            href="/"
            className="px-6 py-3 rounded-xl bg-surface/90 border border-border text-ink text-sm font-bold hover:bg-surface transition-colors shadow-2xs"
          >
            بازگشت به سایت اصلی
          </Link>
        </div>

        {/* Demo Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mt-8 text-start">
          <div className="p-5 rounded-2xl bg-surface/90 backdrop-blur-xs border border-border shadow-xs flex flex-col gap-2">
            <span className="text-xs font-bold text-brand-teal">نشست‌های دوره‌ای</span>
            <h3 className="text-base font-extrabold text-ink">گفتگوی عمیق و تخصصی</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              بررسی چالش‌های واقعی کد، ابزارها و معماری در فضای تعاملی و حضوری.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-surface/90 backdrop-blur-xs border border-border shadow-xs flex flex-col gap-2">
            <span className="text-xs font-bold text-brand-accent">پذیرش محدود</span>
            <h3 className="text-base font-extrabold text-ink">رزرو سریع صندلی</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              ثبت‌نام آنلاین به همراه اتصال شاپرک جهت تضمین حضور اعضای فعال.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-surface/90 backdrop-blur-xs border border-border shadow-xs flex flex-col gap-2">
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
