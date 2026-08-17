export interface EpdLogoProps {
  className?: string;
  variant?: "lockup" | "mark";
}

export function EpdLogo({ className = "h-12 w-auto", variant = "lockup" }: EpdLogoProps) {
  if (variant === "mark") {
    return (
      <svg
        viewBox="0 0 440 150"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="EPD Mark"
        role="img"
      >
        {/* Outer Rounded Container with Bottom-Right Gap */}
        <path
          d="M 60 20 H 380 A 30 30 0 0 1 410 50 V 100 A 30 30 0 0 1 380 130 H 345"
          stroke="#1B2540"
          strokeWidth="9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 235 130 H 60 A 30 30 0 0 1 30 100 V 50 A 30 30 0 0 1 60 20"
          stroke="#1B2540"
          strokeWidth="9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Three Accent Dots in Bottom-Right Gap */}
        <circle cx="265" cy="130" r="7" fill="#FBC757" />
        <circle cx="290" cy="130" r="7" fill="#FA5041" />
        <circle cx="315" cy="130" r="7" fill="#34CDBB" />

        {/* Letter E */}
        <path
          d="M 90 48 V 102"
          stroke="#1B2540"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <path
          d="M 90 48 H 122"
          stroke="#1B2540"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <path
          d="M 129 48 H 145"
          stroke="#FBC757"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <path
          d="M 90 75 H 132"
          stroke="#1B2540"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <path
          d="M 90 102 H 145"
          stroke="#1B2540"
          strokeWidth="9"
          strokeLinecap="round"
        />

        {/* Letter P */}
        <path
          d="M 195 102 L 195 48"
          stroke="#1B2540"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <path
          d="M 195 48 H 222 C 238 48 238 75 222 75 H 195"
          stroke="#FA5041"
          strokeWidth="9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Letter D */}
        <path
          d="M 285 48 H 315 C 333 48 343 60 343 75"
          stroke="#1B2540"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <path
          d="M 343 75 C 343 90 333 102 315 102"
          stroke="#34CDBB"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <path
          d="M 315 102 H 285 V 48"
          stroke="#1B2540"
          strokeWidth="9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 440 210"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="EPD Logo"
      role="img"
    >
      {/* Outer Rounded Container with Bottom-Right Gap */}
      <path
        d="M 60 20 H 380 A 30 30 0 0 1 410 50 V 100 A 30 30 0 0 1 380 130 H 345"
        stroke="#1B2540"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 235 130 H 60 A 30 30 0 0 1 30 100 V 50 A 30 30 0 0 1 60 20"
        stroke="#1B2540"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Three Accent Dots in Bottom-Right Gap */}
      <circle cx="265" cy="130" r="7" fill="#FBC757" />
      <circle cx="290" cy="130" r="7" fill="#FA5041" />
      <circle cx="315" cy="130" r="7" fill="#34CDBB" />

      {/* Letter E */}
      <path
        d="M 90 48 V 102"
        stroke="#1B2540"
        strokeWidth="9"
        strokeLinecap="round"
      />
      {/* Top bar (navy base + gold tip) */}
      <path
        d="M 90 48 H 122"
        stroke="#1B2540"
        strokeWidth="9"
        strokeLinecap="round"
      />
      <path
        d="M 129 48 H 145"
        stroke="#FBC757"
        strokeWidth="9"
        strokeLinecap="round"
      />
      {/* Middle bar */}
      <path
        d="M 90 75 H 132"
        stroke="#1B2540"
        strokeWidth="9"
        strokeLinecap="round"
      />
      {/* Bottom bar */}
      <path
        d="M 90 102 H 145"
        stroke="#1B2540"
        strokeWidth="9"
        strokeLinecap="round"
      />

      {/* Letter P */}
      <path
        d="M 195 102 L 195 48"
        stroke="#1B2540"
        strokeWidth="9"
        strokeLinecap="round"
      />
      {/* Upper Loop in Coral */}
      <path
        d="M 195 48 H 222 C 238 48 238 75 222 75 H 195"
        stroke="#FA5041"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Letter D */}
      <path
        d="M 285 48 H 315 C 333 48 343 60 343 75"
        stroke="#1B2540"
        strokeWidth="9"
        strokeLinecap="round"
      />
      <path
        d="M 343 75 C 343 90 333 102 315 102"
        stroke="#34CDBB"
        strokeWidth="9"
        strokeLinecap="round"
      />
      <path
        d="M 315 102 H 285 V 48"
        stroke="#1B2540"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Subtitle */}
      <text
        x="220"
        y="180"
        textAnchor="middle"
        fill="#1B2540"
        fontSize="13"
        fontWeight="700"
        letterSpacing="4"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        EXPERIENCE <tspan fill="#FA5041">•</tspan> PLAY <tspan fill="#34CDBB">•</tspan> DEVELOP
      </text>
    </svg>
  );
}
