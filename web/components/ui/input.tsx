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
        className={`w-full px-3 py-2 text-start bg-surface text-text border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:opacity-50 ${
          error ? "border-danger" : ""
        } ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
