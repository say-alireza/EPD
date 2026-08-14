"use client";

import { useFormContext } from "react-hook-form";
import { RegistrationFormValues } from "@/lib/schema";
import { strings } from "@/lib/strings";
import { Input } from "@/components/ui/input";
import { FieldError } from "@/components/ui/field-error";

export function FullNameField() {
  const {
    register,
    formState: { errors },
  } = useFormContext<RegistrationFormValues>();

  const error = errors.fullName?.message;
  const fieldId = "register-fullName";
  const errorId = "register-fullName-error";

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={fieldId} className="text-sm font-medium text-text">
        {strings.fields.fullName.label} <span className="text-danger">*</span>
      </label>
      <Input
        id={fieldId}
        placeholder={strings.fields.fullName.placeholder}
        error={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        {...register("fullName")}
      />
      <FieldError id={errorId} error={error} />
    </div>
  );
}
