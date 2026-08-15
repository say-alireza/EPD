import { forwardRef, InputHTMLAttributes } from "react";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  error?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = "", error, ...props }, ref) => {
    return (
      <input
        type="checkbox"
        ref={ref}
        aria-invalid={error ? "true" : undefined}
        className={`h-4 w-4 rounded border border-border bg-surface text-brand-primary focus:ring-brand-primary ${
          error ? "border-danger-border ring-1 ring-danger-border" : ""
        } ${className}`}
        {...props}
      />
    );
  }
);


Checkbox.displayName = "Checkbox";
