"use client";

import { useFormContext } from "react-hook-form";
import { RegistrationFormValues } from "@/lib/schema";
import { strings } from "@/lib/strings";
import { Input } from "@/components/ui/input";
import { FieldError } from "@/components/ui/field-error";

export function ReferralCodeField() {
  const {
    register,
    formState: { errors },
  } = useFormContext<RegistrationFormValues>();

  const error = errors.referralCode?.message;
  const fieldId = "register-referralCode";
  const errorId = "register-referralCode-error";

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={fieldId} className="text-sm font-medium text-ink">
        {strings.fields.referralCode.label}
      </label>
      <Input

        id={fieldId}
        dir="ltr"
        placeholder={strings.fields.referralCode.placeholder}
        error={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        {...register("referralCode")}
      />
      <FieldError id={errorId} error={error} />
    </div>
  );
}
