"use client";

import { useFormContext } from "react-hook-form";
import { RegistrationFormValues } from "@/lib/schema";
import { strings } from "@/lib/strings";
import { Select } from "@/components/ui/select";
import { FieldError } from "@/components/ui/field-error";
import { Session } from "@/lib/types";

interface SessionFieldProps {
  sessions: Session[];
  isLoading: boolean;
  error?: string | null;
}

export function SessionField({ sessions, isLoading, error: fetchError }: SessionFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext<RegistrationFormValues>();

  const error = errors.sessionId?.message || fetchError;
  const fieldId = "register-sessionId";
  const errorId = "register-sessionId-error";

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={fieldId} className="text-sm font-medium text-text">
        {strings.fields.sessionId.label} <span className="text-danger">*</span>
      </label>
      <Select
        id={fieldId}
        disabled={isLoading || sessions.length === 0}
        error={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        {...register("sessionId")}
      >
        <option value="">
          {isLoading
            ? strings.fields.sessionId.loading
            : strings.fields.sessionId.placeholder}
        </option>
        {sessions.map((session) => {
          const isFull = session.isFull || session.remainingSeats <= 0;
          return (
            <option key={session.id} value={session.id} disabled={isFull}>
              {session.title}{" "}
              {isFull
                ? `(${strings.fields.sessionId.full})`
                : strings.fields.sessionId.remainingSeats(session.remainingSeats)}
            </option>
          );
        })}
      </Select>
      {sessions.length === 0 && !isLoading && !fetchError && (
        <p className="text-xs text-text opacity-70">
          {strings.form.noSessionsAvailable}
        </p>
      )}
      <FieldError id={errorId} error={error || undefined} />
    </div>
  );
}
