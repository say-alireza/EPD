"use client";

import { useFormContext } from "react-hook-form";
import { RegistrationFormValues } from "@/lib/schema";
import { strings } from "@/lib/strings";
import { Input } from "@/components/ui/input";
import { FieldError } from "@/components/ui/field-error";

export function MobileField() {
  const {
    register,
    formState: { errors },
  } = useFormContext<RegistrationFormValues>();

  const error = errors.mobile?.message;
  const fieldId = "register-mobile";
  const errorId = "register-mobile-error";
  const hintId = "register-mobile-hint";

  const ariaDescribedBy = [
    error ? errorId : null,
    strings.fields.mobile.hint ? hintId : null,
  ]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={fieldId} className="text-sm font-medium text-ink">
        {strings.fields.mobile.label} <span className="text-brand-accent">*</span>
      </label>
      <Input
        id={fieldId}
        type="tel"
        dir="ltr"
        placeholder={strings.fields.mobile.placeholder}
        error={Boolean(error)}
        aria-describedby={ariaDescribedBy}
        {...register("mobile")}
      />
      {strings.fields.mobile.hint && (
        <span id={hintId} className="text-xs text-ink-muted">
          {strings.fields.mobile.hint}
        </span>
      )}
      <FieldError id={errorId} error={error} />
    </div>

  );
}
