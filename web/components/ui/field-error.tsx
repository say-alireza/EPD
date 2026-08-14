import { HTMLAttributes } from "react";

export interface FieldErrorProps extends HTMLAttributes<HTMLParagraphElement> {
  error?: string;
  id?: string;
}

export function FieldError({ error, id, className = "", ...props }: FieldErrorProps) {
  if (!error) return null;

  return (
    <p
      id={id}
      role="alert"
      className={`text-sm text-danger mt-1 ${className}`}
      {...props}
    >
      {error}
    </p>
  );
}
