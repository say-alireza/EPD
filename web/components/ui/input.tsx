import { forwardRef, InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        aria-invalid={error ? "true" : undefined}
        className={`epd-field text-start ${
          error ? "border-danger-border ring-1 ring-danger-border" : ""
        } ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
