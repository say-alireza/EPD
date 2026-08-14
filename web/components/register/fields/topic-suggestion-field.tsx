"use client";

import { useFormContext } from "react-hook-form";
import { RegistrationFormValues } from "@/lib/schema";
import { strings } from "@/lib/strings";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/components/ui/field-error";

export function TopicSuggestionField() {
  const {
    register,
    formState: { errors },
  } = useFormContext<RegistrationFormValues>();

  const error = errors.topicSuggestion?.message;
  const fieldId = "register-topicSuggestion";
  const errorId = "register-topicSuggestion-error";

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={fieldId} className="text-sm font-medium text-text">
        {strings.fields.topicSuggestion.label}
      </label>
      <Textarea
        id={fieldId}
        rows={3}
        placeholder={strings.fields.topicSuggestion.placeholder}
        error={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        {...register("topicSuggestion")}
      />
      <FieldError id={errorId} error={error} />
    </div>
  );
}
