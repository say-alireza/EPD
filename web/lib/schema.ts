import { z } from "zod";
import { strings } from "./strings";

export function toAsciiDigits(str: string): string {
  return str
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632));
}

export const registrationSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, strings.validation.fullNameMin)
    .max(70, strings.validation.fullNameMax),
  mobile: z
    .string()
    .transform((val) => toAsciiDigits(val.trim()))
    .pipe(z.string().regex(/^09\d{9}$/, strings.validation.mobileInvalid)),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email(strings.validation.emailInvalid),
  sessionId: z
    .string()
    .trim()
    .min(1, strings.validation.sessionIdRequired),
  acceptTerms: z.literal(true, {
    message: strings.validation.acceptTermsRequired,
  }),
  languageLevel: z
    .enum(["beginner", "intermediate", "advanced"])
    .optional(),
  firstTime: z.boolean().optional(),
  topicSuggestion: z
    .string()
    .trim()
    .max(300, strings.validation.topicSuggestionMax)
    .optional()
    .or(z.literal("")),
  referralCode: z
    .string()
    .trim()
    .max(32, strings.validation.referralCodeMax)
    .optional()
    .or(z.literal("")),
  heardFrom: z
    .enum(["instagram", "telegram", "friend", "other"])
    .optional(),
  socialHandle: z
    .string()
    .trim()
    .max(64, strings.validation.socialHandleMax)
    .optional()
    .or(z.literal("")),
});

export type RegistrationFormValues = z.infer<typeof registrationSchema>;
