"use client";

import { useFormContext } from "react-hook-form";
import { RegistrationFormValues } from "@/lib/schema";
import { strings } from "@/lib/strings";
import { Select } from "@/components/ui/select";
import { FieldError } from "@/components/ui/field-error";

export function LanguageLevelField() {
  const {
    register,
    formState: { errors },
  } = useFormContext<RegistrationFormValues>();

  const error = errors.languageLevel?.message;
  const fieldId = "register-languageLevel";
  const errorId = "register-languageLevel-error";

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={fieldId} className="text-sm font-medium text-ink">
        {strings.fields.languageLevel.label}
      </label>
      <Select

        id={fieldId}
        error={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        {...register("languageLevel")}
      >
        <option value="">{strings.fields.languageLevel.placeholder}</option>
        <option value="beginner">{strings.fields.languageLevel.options.beginner}</option>
        <option value="intermediate">{strings.fields.languageLevel.options.intermediate}</option>
        <option value="advanced">{strings.fields.languageLevel.options.advanced}</option>
      </Select>
      <FieldError id={errorId} error={error} />
    </div>
  );
}
