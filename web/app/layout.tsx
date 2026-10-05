import type { Metadata } from "next";
import "./globals.css";
import { strings } from "@/lib/strings";

const siteUrl = "https://epdcommunity.ir";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "باشگاه فری دیسکاشن EPD مشهد | گفتگوی آزاد انگلیسی و دورهمی زبان",
    template: "%s | باشگاه انگلیسی EPD مشهد",
  },
  description:
    "ثبت‌نام آنلاین در نشست‌های هفتگی فری دیسکاشن (Free Discussion) و گفتگوی آزاد انگلیسی در کافه‌های مشهد. تقویت اسپیکینگ، تمرین مکالمه و دورهمی دوستانه در کلوب EPD.",
  keywords: [
    "فری دیسکاشن مشهد",
    "free discussion mashhad",
    "گفتگوی زبان مشهد",
    "دورهمی زبان انگلیسی مشهد",
    "مکالمه زبان انگلیسی مشهد",
    "بحث آزاد انگلیسی مشهد",
    "کافه زبان مشهد",
    "تقویت اسپیکینگ مشهد",
    "کلاس مکالمه مشهد",
    "EPD مشهد",
    "epdcommunity",
  ],
  authors: [{ name: "EPD Community", url: siteUrl }],
  creator: "EPD Community",
  publisher: "EPD Community",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    url: siteUrl,
    siteName: "باشگاه گفتگوی آزاد انگلیسی EPD مشهد",
    title: "باشگاه فری دیسکاشن EPD مشهد | گفتگوی آزاد انگلیسی",
    description:
      "دورهمی‌های هفتگی بحث آزاد و مکالمه زبان انگلیسی در کافه‌های مشهد. تقویت اسپیکینگ در محیطی صمیمی و بدون قضاوت.",
    images: [
      {
        url: "/og-image.png",
        width: 512,
        height: 512,
        alt: "لوگوی رسمی باشگاه گفتگوی آزاد انگلیسی EPD مشهد",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "باشگاه فری دیسکاشن EPD مشهد",
    description: "نشست‌های هفتگی گفتگوی آزاد انگلیسی و تقویت مکالمه در مشهد",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  verification: {
    google: "google278cad6e1d517435",
  },
  other: {
    enamad: "7474898",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { faq } = strings.landing;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "EducationalOrganization",
        "@id": `${siteUrl}/#organization`,
        name: "باشگاه گفتگوی انگلیسی EPD مشهد",
        alternateName: "EPD English Free Discussion Club",
        url: siteUrl,
        logo: `${siteUrl}/og-image.png`,
        description:
          "باشگاه هفتگی مکالمه آزاد انگلیسی در مشهد با هدف ساختن فضایی پویا، صمیمی و استاندارد برای توسعه مهارت‌های ارتباطی و فردی.",
        address: {
          "@type": "PostalAddress",
          addressLocality: "مشهد",
          addressRegion: "خراسان رضوی",
          addressCountry: "IR",
        },
        sameAs: [
          "https://t.me/EPDCommunity",
          "https://www.instagram.com/epdcommunity",
        ],
      },
      {
        "@type": "SocialEvent",
        "@id": `${siteUrl}/#event`,
        name: "دورهمی هفتگی فری دیسکاشن EPD مشهد",
        alternateName: "Weekly English Discussion Meetup in Mashhad",
        description:
          "دورهمی هفتگی گفتگوی آزاد انگلیسی (Free Discussion) و تمرین مکالمه زبان در کافه‌های منتخب مشهد.",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        eventStatus: "https://schema.org/EventScheduled",
        location: {
          "@type": "Place",
          name: "مشهد، کافه‌های دورهمی EPD",
          address: {
            "@type": "PostalAddress",
            addressLocality: "مشهد",
            addressRegion: "خراسان رضوی",
            addressCountry: "IR",
          },
        },
        organizer: {
          "@id": `${siteUrl}/#organization`,
        },
        offers: {
          "@type": "Offer",
          url: `${siteUrl}/register`,
          price: "50000",
          priceCurrency: "IRT",
          availability: "https://schema.org/InStock",
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${siteUrl}/#faq`,
        mainEntity: faq.items.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };

  return (
    <html
      lang="fa"
      dir="rtl"
      className="font-sans h-full antialiased"
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-ground text-ink selection:bg-brand-teal selection:text-ink">
        {children}
      </body>
    </html>
  );
}
