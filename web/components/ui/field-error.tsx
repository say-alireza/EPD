import { HTMLAttributes } from "react";

export interface FieldErrorProps extends HTMLAttributes<HTMLParagraphElement> {
  error?: string;
  id?: string;
}

export function FieldError({ error, id, className = "", ...props }: FieldErrorProps) {
  return (
    <div className="min-h-5 mt-1">
      {error && (
        <p
          id={id}
          role="alert"
          className={`text-xs text-danger-text flex items-center gap-1.5 ${className}`}
          {...props}
        >
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-danger-border shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
