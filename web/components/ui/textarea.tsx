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
        className={`w-full px-3 py-2 text-start bg-surface text-text border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:opacity-50 ${
          error ? "border-danger" : ""
        } ${className}`}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
