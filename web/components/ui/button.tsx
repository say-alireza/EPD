import { ButtonHTMLAttributes, forwardRef } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", disabled, children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center px-6 py-3 rounded-[10px] font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-50 disabled:cursor-not-allowed text-sm";
    
    const variantStyles =
      variant === "primary"
        ? "bg-brand-primary text-surface hover:opacity-90 focus-visible:ring-brand-primary active:translate-y-[1px]"
        : "bg-surface text-ink border border-border hover:bg-surface-hover focus-visible:ring-brand-primary";

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`${baseStyles} ${variantStyles} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
