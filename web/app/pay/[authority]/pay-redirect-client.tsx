"use client";

import { useEffect, useState } from "react";

interface PayRedirectClientProps {
  paymentUrl: string;
  authority: string;
}

export function PayRedirectClient({ paymentUrl, authority }: PayRedirectClientProps) {
  const [seconds, setSeconds] = useState(2);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.replace(paymentUrl);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [paymentUrl]);

  return (
    <div className="bg-surface border border-border p-6 sm:p-8 rounded-2xl shadow-sm space-y-6 text-start">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-black text-xl">
          <svg
            className="w-6 h-6 animate-spin text-brand-primary"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            ></path>
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-ink tracking-tight">
            در حال اتصال به درگاه شاپرک
          </h1>
          <p className="text-xs text-ink-muted mt-0.5">
            انتقال خودکار تا {seconds} ثانیه دیگر...
          </p>
        </div>
      </div>

      {/* VPN Warning Box */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-xs space-y-1.5">
        <div className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-400">
          <span>⚠️</span>
          <span>نکته مهم قبل از ورود به بانک:</span>
        </div>
        <p className="text-ink-muted leading-relaxed">
          سامانه شاپرک دسترسی با آی‌پی خارجی را مسدود می‌کند. جهت جلوگیری از بروز اختلال در فرایند پرداخت، لطفاً <strong>فیلترشکن (VPN)</strong> خود را خاموش کنید.
        </p>
      </div>

      {/* Manual Button */}
      <div className="pt-2">
        <a
          href={paymentUrl}
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white font-bold text-sm transition-all shadow-sm"
        >
          <span>ورود به درگاه پرداخت شاپرک</span>
          <span className="font-mono text-xs">←</span>
        </a>
      </div>

      <div className="text-center">
        <span className="text-[11px] text-ink-muted font-mono" dir="ltr">
          شناسه تراکنش: {authority}
        </span>
      </div>
    </div>
  );
}
