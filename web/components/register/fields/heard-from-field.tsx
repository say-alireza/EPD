"use client";

import { useFormContext } from "react-hook-form";
import { RegistrationFormValues } from "@/lib/schema";
import { strings } from "@/lib/strings";
import { Select } from "@/components/ui/select";
import { FieldError } from "@/components/ui/field-error";

export function HeardFromField() {
  const {
    register,
    formState: { errors },
  } = useFormContext<RegistrationFormValues>();

  const error = errors.heardFrom?.message;
  const fieldId = "register-heardFrom";
  const errorId = "register-heardFrom-error";

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={fieldId} className="text-sm font-medium text-ink flex items-center justify-between">
        <span>{strings.fields.heardFrom.label}</span>
        <span className="text-xs font-normal text-ink-muted">(اختیاری)</span>
      </label>
      <Select
        id={fieldId}
        error={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        {...register("heardFrom")}
      >
        <option value="">نحوه آشنایی (اختیاری)</option>
        <option value="instagram">{strings.fields.heardFrom.options.instagram}</option>
        <option value="telegram">{strings.fields.heardFrom.options.telegram}</option>
        <option value="friend">{strings.fields.heardFrom.options.friend}</option>
        <option value="other">{strings.fields.heardFrom.options.other}</option>
      </Select>
      <FieldError id={errorId} error={error} />
    </div>
  );
}
