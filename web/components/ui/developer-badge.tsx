import React from "react";

interface DeveloperBadgeProps {
  className?: string;
}

export function DeveloperBadge({ className = "" }: DeveloperBadgeProps) {
  return (
    <a
      href="https://cv.alirezarp.ir/"
      target="_blank"
      rel="noopener noreferrer"
      className={`group inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-ground/90 border border-border hover:border-brand-primary/60 text-ink-muted hover:text-ink font-mono text-xs transition-all duration-200 shadow-xs ${className}`}
      title="Alireza Rahimapanah — Full-Stack Developer & Software Engineer"
    >
      <span className="text-brand-primary font-bold group-hover:scale-110 transition-transform">
        &lt;/&gt;
      </span>
      <span className="font-medium tracking-tight">
        Crafted by{" "}
        <span className="text-ink font-semibold group-hover:text-brand-primary transition-colors">
          Alireza
        </span>
      </span>
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
    </a>
  );
}
