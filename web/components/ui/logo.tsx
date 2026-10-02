import { assetPath } from "@/lib/asset";

export interface EpdLogoProps {
  className?: string;
  variant?: "lockup" | "mark";
}

export function EpdLogo({ className = "h-12 w-auto" }: EpdLogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={assetPath("/logo.png")}
      alt="EPD Community"
      className={`object-contain ${className}`}
      loading="eager"
    />
  );
}
