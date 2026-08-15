"use client";

import { useFormContext } from "react-hook-form";
import { RegistrationFormValues } from "@/lib/schema";
import { strings } from "@/lib/strings";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldError } from "@/components/ui/field-error";

export function FirstTimeField() {
  const {
    register,
    formState: { errors },
  } = useFormContext<RegistrationFormValues>();

  const error = errors.firstTime?.message;
  const fieldId = "register-firstTime";
  const errorId = "register-firstTime-error";

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Checkbox
          id={fieldId}
          error={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          {...register("firstTime")}
        />
        <label htmlFor={fieldId} className="text-sm font-medium text-ink cursor-pointer">
          {strings.fields.firstTime.label}
        </label>
      </div>
      <FieldError id={errorId} error={error} />
    </div>

  );
}
