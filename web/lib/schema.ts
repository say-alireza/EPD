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
    .optional()
    .or(z.literal(""))
    .refine((val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: strings.validation.emailInvalid,
    }),
  sessionId: z
    .string()
    .trim()
    .min(1, strings.validation.sessionIdRequired),
  acceptTerms: z.literal(true, {
    message: strings.validation.acceptTermsRequired,
  }),
  languageLevel: z
    .union([
      z.enum(["beginner", "intermediate", "advanced"]),
      z.literal(""),
    ])
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
    .union([
      z.enum(["instagram", "telegram", "friend", "other"]),
      z.literal(""),
    ])
    .optional(),
  socialHandle: z
    .string()
    .trim()
    .min(1, strings.validation.socialHandleRequired)
    .max(64, strings.validation.socialHandleMax)
    .regex(/^@?[a-zA-Z0-9_]{3,32}$/, strings.validation.socialHandleInvalid)
    .transform((val) => (val.startsWith("@") ? val : `@${val}`)),
});

export type RegistrationFormValues = z.infer<typeof registrationSchema>;
