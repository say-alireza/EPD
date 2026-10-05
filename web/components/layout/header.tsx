"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { EpdLogo } from "@/components/ui/logo";
import { TelegramIcon, InstagramIcon } from "@/components/ui/icons";
import { strings } from "@/lib/strings";

interface HeaderProps {
  className?: string;
}

export function Header({ className = "" }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { nav } = strings.landing;

  // Close drawer on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Close drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navLinks = [
    { label: nav.currentSession, href: "/#session" },
    { label: nav.posters, href: "/posters" },
    { label: nav.gallery, href: "/gallery" },
    { label: nav.about, href: "/#about" },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full bg-ground/90 backdrop-blur-md border-b border-border transition-all ${className}`}
      >
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5 flex items-center justify-between">
          {/* 1. Brand Logo (Start Edge / Right in RTL) */}
          <Link
            href="/"
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal shrink-0 flex items-center"
            aria-label="صفحه اصلی EPD"
          >
            <EpdLogo className="h-9 sm:h-11 w-auto" variant="lockup" />
          </Link>

          {/* 2. Desktop Navigation (Center) */}
          <nav
            className="hidden md:flex items-center gap-1 lg:gap-2 bg-surface/70 border border-border/80 px-3 py-1.5 rounded-full shadow-2xs"
            aria-label="منوی اصلی"
          >
            {navLinks.map((link) => {
              const isActive =
                link.href === pathname ||
                (link.href.startsWith("/#") && pathname === "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1 text-xs lg:text-sm font-semibold rounded-full transition-colors ${
                    isActive
                      ? "text-brand-primary bg-brand-primary/10"
                      : "text-ink-muted hover:text-ink hover:bg-ground"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* 3. Actions & Socials (End Edge / Left in RTL) */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Telegram Link (Desktop/Tablet) */}
            <a
              href="https://t.me/EPDCommunity"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex p-2 sm:px-2.5 sm:py-2 text-ink-muted hover:text-[#229ED9] border border-border hover:border-[#229ED9]/60 rounded-xl transition-all items-center gap-1.5 bg-surface/80 shadow-2xs hover:shadow-xs"
              title="کانال تلگرام EPD"
              aria-label="کانال تلگرام EPD"
            >
              <TelegramIcon className="w-4 h-4 shrink-0 text-[#229ED9]" />
              <span className="text-xs font-bold hidden lg:inline">تلگرام</span>
            </a>

            {/* Instagram Link (Desktop/Tablet) */}
            <a
              href="https://www.instagram.com/epdcommunity?utm_source=ig_web_button_share_sheet&stkn=ZDNlZDc0MzIxNw=="
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex p-2 sm:px-2.5 sm:py-2 text-ink-muted hover:text-[#E4405F] border border-border hover:border-[#E4405F]/60 rounded-xl transition-all items-center gap-1.5 bg-surface/80 shadow-2xs hover:shadow-xs"
              title="صفحه اینستاگرام EPD"
              aria-label="صفحه اینستاگرام EPD"
            >
              <InstagramIcon className="w-4 h-4 shrink-0 text-[#E4405F]" />
              <span className="text-xs font-bold hidden lg:inline">اینستاگرام</span>
            </a>

            {/* Register CTA (Always visible, compact on mobile) */}
            <Link
              href="/register"
              className="text-xs sm:text-sm font-extrabold text-surface bg-brand-primary hover:bg-brand-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal px-3 sm:px-4 py-2 rounded-xl shadow-2xs shrink-0 inline-flex items-center"
            >
              {nav.register}
            </Link>

            {/* Mobile Hamburger Button (Only on mobile < md) */}
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-ink hover:text-brand-primary bg-surface/80 hover:bg-surface border border-border rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary flex items-center justify-center shrink-0"
              aria-label={isOpen ? "بستن منو" : "باز کردن منو"}
              aria-expanded={isOpen}
            >
              {isOpen ? (
                // Close (X) Icon
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                // Hamburger Icon
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 4. Mobile Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden bg-ink/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* 5. Mobile Drawer Panel */}
      {isOpen && (
        <aside
          className="fixed top-0 bottom-0 right-0 z-50 w-[82%] max-w-xs bg-surface border-l border-border shadow-2xl p-5 flex flex-col justify-between animate-in slide-in-from-right duration-250 md:hidden"
          aria-label="منوی موبایل"
        >
          <div className="flex flex-col gap-6">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-border/80 pb-4">
              <EpdLogo className="h-8 w-auto" variant="lockup" />
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-ink-muted hover:text-ink hover:bg-ground rounded-lg transition-colors"
                aria-label="بستن منو"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex flex-col gap-1.5" aria-label="لینک‌های ناوبری موبایل">
              {navLinks.map((link) => {
                const isActive =
                  link.href === pathname ||
                  (link.href.startsWith("/#") && pathname === "/");
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                      isActive
                        ? "text-brand-primary bg-brand-primary/10"
                        : "text-ink hover:bg-ground"
                    }`}
                  >
                    <span>{link.label}</span>
                    <span className="text-xs text-ink-muted">←</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Drawer Footer & Socials & CTA */}
          <div className="flex flex-col gap-3.5 border-t border-border/80 pt-4">
            <Link
              href="/register"
              onClick={() => setIsOpen(false)}
              className="w-full text-center py-2.5 px-4 rounded-xl text-sm font-extrabold text-surface bg-brand-primary hover:bg-brand-accent transition-colors shadow-sm"
            >
              {nav.register}
            </Link>

            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <a
                href="https://t.me/EPDCommunity"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-border hover:border-[#229ED9]/60 text-ink-muted hover:text-[#229ED9] bg-ground transition-colors"
              >
                <TelegramIcon className="w-3.5 h-3.5 text-[#229ED9]" />
                <span>تلگرام</span>
              </a>
              <a
                href="https://www.instagram.com/epdcommunity?utm_source=ig_web_button_share_sheet&stkn=ZDNlZDc0MzIxNw=="
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-border hover:border-[#E4405F]/60 text-ink-muted hover:text-[#E4405F] bg-ground transition-colors"
              >
                <InstagramIcon className="w-3.5 h-3.5 text-[#E4405F]" />
                <span>اینستاگرام</span>
              </a>
            </div>

            <p className="text-[10px] text-ink-muted text-center leading-normal">
              English Public Discussion · Mashhad
            </p>
          </div>
        </aside>
      )}
    </>
  );
}
