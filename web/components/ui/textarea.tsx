import { forwardRef, TextareaHTMLAttributes } from "react";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        aria-invalid={error ? "true" : undefined}
        className={`epd-field text-start disabled:opacity-50 ${
          error ? "border-danger-border ring-1 ring-danger-border" : ""
        } ${className}`}
        {...props}
      />
    );
  }
);



Textarea.displayName = "Textarea";
