"use client";

import { useFormContext } from "react-hook-form";
import { RegistrationFormValues } from "@/lib/schema";
import { strings } from "@/lib/strings";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldError } from "@/components/ui/field-error";

export function AcceptTermsField() {
  const {
    register,
    formState: { errors },
  } = useFormContext<RegistrationFormValues>();

  const error = errors.acceptTerms?.message;
  const fieldId = "register-acceptTerms";
  const errorId = "register-acceptTerms-error";

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-start gap-2">
        <Checkbox
          id={fieldId}
          error={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          {...register("acceptTerms")}
        />
        <label htmlFor={fieldId} className="text-sm font-medium text-text cursor-pointer leading-tight">
          {strings.fields.acceptTerms.label} <span className="text-danger">*</span>
        </label>
      </div>
      <FieldError id={errorId} error={error} />
    </div>
  );
}
