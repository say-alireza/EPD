import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ثبتنام نشستهای EPD",
  description: "سامانه ثبتنام نشستهای گفتگو و توسعه EPD",
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
