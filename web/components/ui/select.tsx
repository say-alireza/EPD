import { forwardRef, SelectHTMLAttributes } from "react";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", error, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        aria-invalid={error ? "true" : undefined}
        className={`epd-field text-start disabled:opacity-50 ${
          error ? "border-danger-border ring-1 ring-danger-border" : ""
        } ${className}`}
        {...props}
      >
        {children}
      </select>
    );
  }
);


Select.displayName = "Select";
