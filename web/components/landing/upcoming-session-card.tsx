"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { UpcomingSession } from "@/lib/types";
import { assetPath } from "@/lib/asset";

function getFormattedJalaliDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  } catch {
    return isoString;
  }
}

interface UpcomingSessionCardProps {
  initialData: UpcomingSession;
  eyebrow: string;
  dateLabel: string;
  timeLabel: string;
  venueLabel: string;
  emptyTitle: string;
  emptySubtitle: string;
}

export function UpcomingSessionCard({
  initialData,
  eyebrow,
  dateLabel,
  timeLabel,
  venueLabel,
  emptyTitle,
  emptySubtitle,
}: UpcomingSessionCardProps) {
  const [data, setData] = useState<UpcomingSession>(initialData);

  useEffect(() => {
    fetch("/api/upcoming/")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((live) => {
        if (live && (live.number || live.topicEn || live.id)) {
          setData((prev) => ({
            ...prev,
            ...live,
          }));
        }
      })
      .catch(() => {
        // keep fallback data safely
      });
  }, []);

  const formattedDate = getFormattedJalaliDate(data.dateIso);

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-sm hover:border-brand-primary transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="px-2.5 py-1 bg-brand-gold text-ink text-xs font-extrabold rounded">
            جلسه {data.number}
          </span>
          <span className="text-xs font-medium text-ink-muted">
            {eyebrow}
          </span>
        </div>
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-teal">
          <span className="w-2 h-2 rounded-full bg-brand-teal animate-pulse" />
          <span>
            {data.remainingSeats
              ? `${data.remainingSeats.toLocaleString("fa-IR")} صندلی باقیمانده`
              : "ثبتنام فعال"}
          </span>
        </div>
      </div>

      {/* Poster placeholder box with dashed borders */}
      <div className="w-full bg-ground border border-dashed border-brand-primary/40 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-3 overflow-hidden min-h-[220px]">
        {data.posterImage ? (
          <Image
            src={assetPath(data.posterImage)}
            alt={data.topicEn}
            width={400}
            height={500}
            className="w-full max-w-xs h-auto object-contain rounded-lg shadow-xs"
            priority
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-center gap-3 py-4">
            <span className="px-3 py-1 bg-brand-gold/20 text-ink text-xs font-bold rounded-lg">
              EPD Weekly Poster
            </span>
            <div className="space-y-1.5">
              <h3 className="text-base font-extrabold text-ink">
                {emptyTitle}
              </h3>
              <p className="text-xs text-ink-muted leading-relaxed max-w-xs">
                {emptySubtitle}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Time and location details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-border pt-4 text-xs">
        <div>
          <span className="text-ink-muted block">{dateLabel}</span>
          <span className="font-bold text-ink">{formattedDate}</span>
        </div>
        <div>
          <span className="text-ink-muted block">{timeLabel}</span>
          <span className="font-bold text-ink" dir="ltr">
            {data.timeFa}
          </span>
        </div>
        <div className="sm:col-span-2">
          <span className="text-ink-muted block">{venueLabel}</span>
          <span className="font-bold text-ink">{data.venueFa}</span>
        </div>
      </div>
    </div>
  );
}
