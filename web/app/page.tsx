import Link from "next/link";
import Image from "next/image";
import localFont from "next/font/local";
import { EpdLogo } from "@/components/ui/logo";
import { Enamad } from "@/components/ui/enamad";
import { DeveloperBadge } from "@/components/ui/developer-badge";
import { TelegramIcon, InstagramIcon } from "@/components/ui/icons";
import { strings } from "@/lib/strings";
import { assetPath } from "@/lib/asset";
import { UpcomingSessionCard } from "@/components/landing/upcoming-session-card";
import nextSessionData from "@/data/next-session.json";
import galleryData from "@/data/gallery.json";
import postersData from "@/data/posters.json";

const boldUo = localFont({
  src: "../public/fonts/BoldodemoRegular.otf",
  display: "swap",
});

export default function HomePage() {
  const { hero, nextSessionPoster, gallery, pastPosters, faq, footer } =
    strings.landing;

  const galleryItems = galleryData.slice(0, 6);

  return (
    <div className="min-h-screen bg-ground text-ink flex flex-col selection:bg-brand-teal selection:text-ink">
      {/* 1. Header — logo, social icon links & primary CTA */}
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex items-center justify-between border-b border-border">
        <Link
          href="/"
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal shrink-0"
        >
          <EpdLogo className="h-9 sm:h-11 w-auto" variant="lockup" />
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="https://t.me/EPDCommunity"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 sm:px-3 sm:py-2 text-ink-muted hover:text-[#229ED9] border border-border hover:border-[#229ED9]/60 rounded-xl transition-all flex items-center gap-2 bg-surface/80 shadow-2xs hover:shadow-xs"
            title="کانال تلگرام EPD"
            aria-label="کانال تلگرام EPD"
          >
            <TelegramIcon className="w-4 h-4 shrink-0 text-[#229ED9]" />
            <span className="text-xs font-bold hidden md:inline">تلگرام</span>
          </a>
          <a
            href="https://www.instagram.com/epdcommunity?utm_source=ig_web_button_share_sheet&stkn=ZDNlZDc0MzIxNw=="
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 sm:px-3 sm:py-2 text-ink-muted hover:text-[#E4405F] border border-border hover:border-[#E4405F]/60 rounded-xl transition-all flex items-center gap-2 bg-surface/80 shadow-2xs hover:shadow-xs"
            title="صفحه اینستاگرام EPD"
            aria-label="صفحه اینستاگرام EPD"
          >
            <InstagramIcon className="w-4 h-4 shrink-0 text-[#E4405F]" />
            <span className="text-xs font-bold hidden md:inline">اینستاگرام</span>
          </a>
          <Link
            href="/register"
            className="text-xs sm:text-sm font-extrabold text-surface bg-brand-primary hover:bg-brand-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal px-3.5 sm:px-4 py-2 rounded-xl shadow-2xs shrink-0"
          >
            {strings.landing.nav.register}
          </Link>
        </div>
      </header>

      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col gap-14 sm:gap-24">
        {/* 2. Hero — Clean, High-Impact Design */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center text-start">
          {/* Right Column (lg:col-span-7) */}
          <div className="lg:col-span-7 flex flex-col items-start gap-6">
            {/* Main Headline & Description */}
            <div className="space-y-4 w-full">
              <h1
                className={`text-4xl sm:text-6xl lg:text-7xl text-brand-primary leading-[1.15] tracking-wide uppercase ${boldUo.className}`}
                dir="ltr"
              >
                EPD <span className="font-sans font-light select-none text-brand-primary/60 mx-1.5 sm:mx-2">-</span> AN EXCUSE FOR SPEAKING
              </h1>
              <p className="text-base sm:text-lg font-normal text-ink-muted leading-relaxed max-w-xl">
                {hero.subtitle}
              </p>
            </div>

            {/* Feature Labels — flat text, no border/hover to avoid button-like affordance */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs font-medium text-ink-muted">
              <span>{hero.tags.discussion}</span>
              <span className="text-border" aria-hidden="true">/</span>
              <span>{hero.tags.games}</span>
              <span className="text-border" aria-hidden="true">/</span>
              <span>{hero.tags.experience}</span>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-3 w-full sm:w-auto">
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-8 py-4 bg-brand-primary text-surface font-extrabold text-base transition-all hover:bg-brand-primary/90 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal rounded-xl shadow-xs"
              >
                {hero.cta}
              </Link>
              <Link
                href="/gallery"
                className="inline-flex items-center justify-center px-6 py-4 bg-surface text-ink font-bold text-sm border border-border hover:border-brand-primary transition-all rounded-xl shadow-xs"
              >
                {hero.secondaryCta}
              </Link>
            </div>

            {/* Telegram Channel Announcement Note */}
            <div className="pt-1">
              <a
                href="https://t.me/EPDCommunity"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 text-xs font-medium text-ink-muted hover:text-ink transition-colors bg-surface border border-border px-3.5 py-2 rounded-lg shadow-2xs hover:border-brand-primary"
              >
                <span className="w-2 h-2 rounded-full bg-brand-teal animate-pulse" />
                <span>اطلاع‌رسانی کافه، موضوعات و رویدادهای هفتگی در کانال تلگرام EPD</span>
              </a>
            </div>
          </div>

          {/* Left Column (lg:col-span-5) — Upcoming Session Details */}
          <div className="lg:col-span-5 w-full">
            <UpcomingSessionCard
              initialData={nextSessionData}
              eyebrow={nextSessionPoster.eyebrow}
              dateLabel={nextSessionPoster.dateLabel}
              timeLabel={nextSessionPoster.timeLabel}
              venueLabel={nextSessionPoster.venueLabel}
              emptyTitle={hero.poster.emptyTitle}
              emptySubtitle={hero.poster.emptySubtitle}
            />
          </div>
        </section>

        {/* 3. Weekly photo gallery — clean compact badge with session tag */}
        <section className="flex flex-col gap-8 text-start">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-brand-teal tracking-wider uppercase">
                {gallery.eyebrow}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-ink">
                {gallery.title}
              </h2>
            </div>
            <Link
              href="/gallery"
              className="text-xs sm:text-sm font-bold text-brand-primary hover:text-brand-accent transition-colors underline self-start sm:self-auto"
            >
              {gallery.viewAll}
            </Link>
          </div>

          {galleryItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryItems.map((item) => (
                <article
                  key={item.id}
                  className="bg-surface border border-border rounded-xl overflow-hidden flex flex-col group shadow-xs hover:border-brand-primary transition-all duration-200"
                >
                  <div className="relative w-full aspect-[4/3] bg-ground overflow-hidden">
                    <Image
                      src={assetPath(item.image)}
                      alt={item.sessionLabel || `جلسه ${item.sessionNumber}`}
                      width={600}
                      height={450}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-2 start-2 bg-ink/80 text-surface px-2.5 py-1 rounded text-[11px] font-bold">
                      {item.sessionLabel || `جلسه ${item.sessionNumber}`}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="p-8 bg-surface border border-dashed border-border rounded-xl text-center text-sm text-ink-muted">
              {gallery.emptyState}
            </div>
          )}
        </section>

        {/* 4. EPD Quest for Victory — Game League & Scoreboard */}
        <section className="bg-surface border border-border rounded-2xl p-6 sm:p-10 flex flex-col lg:flex-row gap-8 items-center text-start">
          <div className="flex-1 flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-brand-primary">
              <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
              <span>لیگ بازی‌های انگلیسی · EPD QUEST FOR VICTORY</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink leading-tight">
              رقابت، هیجان و تقویت مکالمه در قالب بازی‌های گروهی
            </h2>
            <p className="text-sm text-ink-muted leading-relaxed">
              در کنار نشست‌های هفتگی Free Discussion، لیگ اختصاصی بازی‌های EPD با چالش‌هایی نظیر Alias، Heads-Up، Guessmoji، Spy و Taboo برگزار می‌شود. شرکت‌کنندگان در تیم‌ها به رقابت می‌پردازند، ستاره و امتیاز جمع می‌کنند و نتایج در اسکوربورد لیگ ثبت می‌شود.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="bg-ground border border-border rounded-lg p-3">
                <span className="text-ink-muted block text-[11px]">محل برگزاری</span>
                <span className="font-bold text-ink">اعلام در کانال تلگرام</span>
              </div>
              <div className="bg-ground border border-border rounded-lg p-3">
                <span className="text-ink-muted block text-[11px]">بازی‌های پرطرفدار</span>
                <span className="font-bold text-ink">Alias · Spy · Taboo</span>
              </div>
              <div className="bg-ground border border-border rounded-lg p-3 col-span-2 sm:col-span-1">
                <span className="text-ink-muted block text-[11px]">سیستم مسابقات</span>
                <span className="font-bold text-ink">امتیازدهی و اسکوربورد</span>
              </div>
            </div>
            <div className="pt-2">
              <Link
                href="/gallery"
                className="inline-flex items-center gap-2 text-xs font-bold text-brand-primary hover:text-brand-accent transition-colors underline"
              >
                مشاهده تصاویر بازی‌ها و اسکوربورد در گالری ←
              </Link>
            </div>
          </div>
          <div className="w-full lg:w-96 shrink-0">
            <div className="relative aspect-[16/10] sm:aspect-[4/3] rounded-xl overflow-hidden border border-border bg-ground shadow-sm">
              <video
                src={assetPath("/media/gallery/quest-scoreboard.mp4")}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-2.5 start-2.5 bg-ink/85 text-surface text-[11px] font-bold px-2.5 py-1 rounded shadow-xs">
                اسکوربورد رسمی مسابقات Quest
              </span>
            </div>
          </div>
        </section>

        {/* 5. Past posters — compact strip, link to /posters */}
        <section className="flex flex-col gap-8 text-start">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-brand-teal tracking-wider uppercase">
                {pastPosters.eyebrow}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-ink">
                {pastPosters.title}
              </h2>
              <p className="text-sm text-ink-muted">
                {pastPosters.subtitle}
              </p>
            </div>
            <Link
              href="/posters"
              className="text-xs sm:text-sm font-bold text-brand-primary hover:text-brand-accent transition-colors underline self-start sm:self-auto"
            >
              {pastPosters.viewAll}
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {postersData.slice(0, 8).map((poster) => (
              <div
                key={poster.id}
                className="bg-surface border border-border rounded-xl p-3 flex flex-col gap-3 group hover:border-brand-primary transition-all duration-200"
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
        </section>

        {/* 5. FAQ — six questions as native <details> elements */}
        <section className="flex flex-col gap-8 text-start max-w-4xl mx-auto w-full">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-brand-teal tracking-wider uppercase">
              {faq.eyebrow}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink">
              {faq.title}
            </h2>
            <p className="text-sm text-ink-muted">
              {faq.subtitle}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {faq.items.map((item, idx) => (
              <details
                key={idx}
                className="group bg-surface border border-border rounded-xl p-5 open:ring-1 open:ring-brand-primary transition-all duration-150"
              >
                <summary className="font-bold text-sm sm:text-base text-ink cursor-pointer list-none flex items-center justify-between gap-4 select-none">
                  <span>{item.question}</span>
                  <span className="text-ink-muted text-lg transition-transform duration-200 group-open:rotate-45 shrink-0">
                    +
                  </span>
                </summary>
                <div className="pt-4 text-xs sm:text-sm text-ink-muted leading-relaxed border-t border-border mt-3">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </section>
      </main>

      {/* 6. Footer — address, contact channels, social links, link to /terms */}
      <footer className="w-full bg-surface border-t border-border mt-12 sm:mt-16 py-8 sm:py-12">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8 sm:gap-10 text-start">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Col 1: Brand & About */}
            <div className="flex flex-col gap-3 sm:gap-4 sm:col-span-2 lg:col-span-1">
              <EpdLogo className="h-8 sm:h-9 w-auto self-start" variant="lockup" />
              <p className="text-xs text-ink-muted leading-relaxed max-w-sm">
                {footer.aboutText}
              </p>
            </div>

            {/* Col 2: Quick Links */}
            <div className="flex flex-col gap-2.5 text-xs">
              <span className="font-bold text-ink">{footer.linksTitle}</span>
              <div className="flex flex-col gap-2 pt-1">
                <Link href="/register" className="text-ink-muted hover:text-ink transition-colors">
                  {hero.cta}
                </Link>
                <Link href="/gallery" className="text-ink-muted hover:text-ink transition-colors">
                  {gallery.title}
                </Link>
                <Link href="/posters" className="text-ink-muted hover:text-ink transition-colors">
                  {pastPosters.title}
                </Link>
                <Link href="/terms" className="text-ink-muted hover:text-ink transition-colors">
                  {footer.terms}
                </Link>
              </div>
            </div>

            {/* Col 3: Contact & Venue */}
            <div className="flex flex-col gap-2.5 text-xs">
              <span className="font-bold text-ink">{footer.contactLabel}</span>
              <div className="flex flex-col gap-2 pt-1 text-ink-muted">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] text-ink-muted/80">{footer.addressLabel}</span>
                  <p className="text-ink text-xs leading-relaxed">{footer.addressValue}</p>
                </div>
                <div className="flex flex-col gap-1 pt-1">
                  <span className="text-[11px] text-ink-muted/80">{footer.supportLabel}</span>
                  <a
                    href="https://t.me/EPDsupport"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary hover:text-brand-accent transition-colors self-start"
                  >
                    <span className="font-mono" dir="ltr">{footer.supportHandle}</span>
                    <span className="text-[10px] text-ink-muted">({footer.telegram.split(" ")[0]})</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Col 4: Social & Trust (Enamad) */}
            <div className="flex flex-col gap-4 text-xs sm:col-span-2 lg:col-span-1">
              <div className="flex flex-col gap-2">
                <span className="font-bold text-ink">{footer.socialTitle}</span>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <a
                    href="https://t.me/EPDCommunity"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-ground/80 border border-border text-ink-muted hover:text-[#229ED9] hover:border-[#229ED9]/50 hover:bg-surface transition-all shadow-2xs group"
                    title="کانال تلگرام EPD"
                  >
                    <TelegramIcon className="w-4 h-4 text-[#229ED9] transition-transform group-hover:scale-110" />
                    <span className="font-semibold text-xs text-ink group-hover:text-[#229ED9] transition-colors">{footer.telegram}</span>
                  </a>
                  <a
                    href="https://www.instagram.com/epdcommunity?utm_source=ig_web_button_share_sheet&stkn=ZDNlZDc0MzIxNw=="
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-ground/80 border border-border text-ink-muted hover:text-[#E4405F] hover:border-[#E4405F]/50 hover:bg-surface transition-all shadow-2xs group"
                    title="صفحه اینستاگرام EPD"
                  >
                    <InstagramIcon className="w-4 h-4 text-[#E4405F] transition-transform group-hover:scale-110" />
                    <span className="font-semibold text-xs text-ink group-hover:text-[#E4405F] transition-colors">{footer.instagram}</span>
                  </a>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <span className="font-bold text-ink">{footer.trustTitle}</span>
                <div className="flex items-start">
                  <Enamad />
                </div>
              </div>
            </div>
          </div>

          {/* Sub-footer Bar with Developer Signature */}
          <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-ink-muted gap-4 text-center sm:text-start">
            <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3 text-[11px] sm:text-xs">
              <span className="font-medium text-ink">EPD English Discussion Club</span>
              <span className="hidden sm:inline text-border">•</span>
              <span>{footer.allRights}</span>
            </div>

            {/* Developer Terminal Signature */}
            <DeveloperBadge />
          </div>
        </div>
      </footer>
    </div>
  );
}
