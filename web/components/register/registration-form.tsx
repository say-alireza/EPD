"use client";

import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { registrationSchema, RegistrationFormValues } from "@/lib/schema";
import { createRegistration, getSessions } from "@/lib/api";
import { Session } from "@/lib/types";
import { strings } from "@/lib/strings";
import { Button } from "@/components/ui/button";
import {
  FullNameField,
  MobileField,
  EmailField,
  SessionField,
  LanguageLevelField,
  FirstTimeField,
  TopicSuggestionField,
  HeardFromField,
  SocialHandleField,
  ReferralCodeField,
  AcceptTermsField,
} from "./fields";

export function RegistrationForm() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const methods = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      fullName: "",
      mobile: "",
      email: "",
      sessionId: "",
      topicSuggestion: "",
      referralCode: "",
      socialHandle: "",
      firstTime: false,
    },
  });

  const { handleSubmit, formState: { isSubmitting } } = methods;

  useEffect(() => {
    getSessions()
      .then((data) => {
        setSessions(data);
        setIsLoadingSessions(false);
      })
      .catch(() => {
        setSessionError(strings.form.fetchSessionsError);
        setIsLoadingSessions(false);
      });
  }, []);

  const onSubmit = async (values: RegistrationFormValues) => {
    setSubmitError(null);
    try {
      const response = await createRegistration({
        fullName: values.fullName,
        mobile: values.mobile,
        email: values.email,
        sessionId: values.sessionId,
        acceptTerms: true,
        languageLevel: values.languageLevel,
        firstTime: values.firstTime,
        topicSuggestion: values.topicSuggestion || undefined,
        referralCode: values.referralCode || undefined,
        heardFrom: values.heardFrom,
        socialHandle: values.socialHandle || undefined,
      });

      if (response.paymentUrl) {
        window.location.assign(response.paymentUrl);
      } else {
        router.push("/register/success");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : strings.form.generalError;
      setSubmitError(message);
    }
  };

  const onError = () => {
    const firstInvalid = document.querySelector<HTMLElement>("[aria-invalid='true']");
    firstInvalid?.focus();
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit, onError)} noValidate className="space-y-6">
        {submitError && (
          <div role="alert" className="p-3 border border-danger text-danger bg-surface rounded-md text-sm">
            {submitError}
          </div>
        )}

        <div className="space-y-4">
          <FullNameField />
          <MobileField />
          <EmailField />
          <SessionField sessions={sessions} isLoading={isLoadingSessions} error={sessionError} />
        </div>

        <fieldset className="border border-border p-4 rounded-md space-y-4">
          <legend className="px-2 text-sm font-medium text-text">
            {strings.form.optionalSectionTitle}
          </legend>
          <LanguageLevelField />
          <FirstTimeField />
          <TopicSuggestionField />
          <HeardFromField />
          <SocialHandleField />
          <ReferralCodeField />
        </fieldset>

        <div className="space-y-4">
          <AcceptTermsField />
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? strings.form.submitting : strings.form.submit}
          </Button>
        </div>
      </form>
      
    </FormProvider>
  );
}
