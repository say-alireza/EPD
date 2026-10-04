import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ثبت‌نام نشست‌های EPD",
    template: "%s | EPD",
  },
  description: "باشگاه هفتگی گفت‌وگوی آزاد انگلیسی EPD در مشهد",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
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
  return (
    <html
      lang="fa"
      dir="rtl"
      className="font-sans h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-ground text-ink selection:bg-brand-teal selection:text-ink">
        {children}
      </body>
    </html>
  );
}
