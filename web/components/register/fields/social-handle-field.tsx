"use client";

import { useFormContext } from "react-hook-form";
import { RegistrationFormValues } from "@/lib/schema";
import { strings } from "@/lib/strings";
import { Input } from "@/components/ui/input";
import { FieldError } from "@/components/ui/field-error";

export function SocialHandleField() {
  const {
    register,
    formState: { errors },
  } = useFormContext<RegistrationFormValues>();

  const error = errors.socialHandle?.message;
  const fieldId = "register-socialHandle";
  const errorId = "register-socialHandle-error";

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={fieldId} className="text-sm font-medium text-text">
        {strings.fields.socialHandle.label}
      </label>
      <Input
        id={fieldId}
        dir="ltr"
        placeholder={strings.fields.socialHandle.placeholder}
        error={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        {...register("socialHandle")}
      />
      <FieldError id={errorId} error={error} />
    </div>
  );
}
