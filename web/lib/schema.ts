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

export const PERSIAN_MONTHS: Record<string, number> = {
  "فروردین": 1,
  "اردیبهشت": 2,
  "خرداد": 3,
  "تیر": 4,
  "مرداد": 5,
  "شهریور": 6,
  "مهر": 7,
  "آبان": 8,
  "آذر": 9,
  "دی": 10,
  "بهمن": 11,
  "اسفند": 12,
};

export function jalaliToGregorian(jy: number, jm: number, jd: number): [number, number, number] {
  let gy = jy <= 979 ? 621 : 1600;
  jy -= jy <= 979 ? 0 : 979;
  let days = 365 * jy + Math.floor(jy / 33) * 8 + Math.floor(((jy % 33) + 3) / 4) + 78 + jd;
  days += jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186;
  let gyYear = gy + 400 * Math.floor(days / 146097);
  days %= 146097;
  if (days > 36524) {
    days--;
    gyYear += 100 * Math.floor(days / 36524);
    days %= 36524;
    if (days >= 365) days++;
  }
  gyYear += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    gyYear += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  const sal_a = [0, 31, (gyYear % 4 === 0 && gyYear % 100 !== 0) || gyYear % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gmMonth = 0;
  while (gmMonth < 12 && days >= sal_a[gmMonth + 1]) {
    days -= sal_a[gmMonth + 1];
    gmMonth++;
  }
  return [gyYear, gmMonth + 1, days + 1];
}

export interface ParsedPersianDateTime {
  dateIso: string | null;
  dateFa: string | null;
  timeFa: string;
  hasDate: boolean;
}

export function parsePersianDateTime(input: string): ParsedPersianDateTime {
  const normalized = toAsciiDigits(input)
    .replace(/[\u200c\u200b]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  let detectedMonth: number | null = null;
  let detectedMonthName = "";
  for (const [mName, mNum] of Object.entries(PERSIAN_MONTHS)) {
    if (normalized.includes(mName)) {
      detectedMonth = mNum;
      detectedMonthName = mName;
      break;
    }
  }

  let dateIso: string | null = null;
  let dateFa: string | null = null;
  let hasDate = false;

  if (detectedMonth !== null) {
    const dayRegex = new RegExp("(?:([0-9]{1,2})[ ]*" + detectedMonthName + "|" + detectedMonthName + "[ ]*([0-9]{1,2}))");
    const dayMatch = normalized.match(dayRegex);
    const day = dayMatch ? parseInt(dayMatch[1] || dayMatch[2], 10) : null;

    const yearMatch = normalized.match(/140[0-9]/);
    const year = yearMatch ? parseInt(yearMatch[0], 10) : 1405;

    if (day && day >= 1 && day <= 31) {
      hasDate = true;
      const [gy, gm, gd] = jalaliToGregorian(year, detectedMonth, day);
      const isoDate = new Date(Date.UTC(gy, gm - 1, gd, 6, 30, 0));
      dateIso = isoDate.toISOString();

      const weekdays = ["چهارشنبه", "پنج شنبه", "پنج‌شنبه", "سه شنبه", "سه‌شنبه", "یکشنبه", "دوشنبه", "جمعه", "شنبه"];
      let weekdayFound = "";
      for (const w of weekdays) {
        if (normalized.includes(w)) {
          weekdayFound = w.replace("سه شنبه", "سه‌شنبه").replace("پنج شنبه", "پنج‌شنبه");
          break;
        }
      }
      dateFa = weekdayFound ? `${weekdayFound}، ${day} ${detectedMonthName} ${year}` : `${day} ${detectedMonthName} ${year}`;
    }
  }

  const timeRegex = /(?:ساعت\s*)?([0-9]{1,2}(?::[0-9]{2})?)\s*(?:تا|الی|-)\s*([0-9]{1,2}(?::[0-9]{2})?)/;
  const timeMatch = normalized.match(timeRegex);
  let timeFa = "";
  if (timeMatch) {
    timeFa = `${timeMatch[1]} الی ${timeMatch[2]}`;
  } else if (!hasDate) {
    timeFa = input.trim();
  } else {
    timeFa = input.trim();
  }

  return { dateIso, dateFa, timeFa, hasDate };
}
