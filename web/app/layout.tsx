import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";

const vazir = Vazirmatn({
  subsets: ["arabic", "latin"],
  display: "swap",
  variable: "--font-vazir",
});

export const metadata: Metadata = {
  title: "ثبت‌نام نشست‌های EPD",
  description: "سامانه ثبت‌نام نشست‌های گفتگو و توسعه EPD",
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
      className={`${vazir.variable} font-sans h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ground text-ink selection:bg-brand-teal selection:text-ink">

        {children}
      </body>
    </html>
  );
}
