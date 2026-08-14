"use client";

import { useFormContext } from "react-hook-form";
import { RegistrationFormValues } from "@/lib/schema";
import { strings } from "@/lib/strings";
import { Input } from "@/components/ui/input";
import { FieldError } from "@/components/ui/field-error";

export function EmailField() {
  const {
    register,
    formState: { errors },
  } = useFormContext<RegistrationFormValues>();

  const error = errors.email?.message;
  const fieldId = "register-email";
  const errorId = "register-email-error";

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={fieldId} className="text-sm font-medium text-text">
        {strings.fields.email.label} <span className="text-danger">*</span>
      </label>
      <Input
        id={fieldId}
        type="email"
        dir="ltr"
        placeholder={strings.fields.email.placeholder}
        error={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        {...register("email")}
      />
      <FieldError id={errorId} error={error} />
    </div>
  );
}
