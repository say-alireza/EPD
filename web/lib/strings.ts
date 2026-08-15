export const strings = {
  form: {
    title: "فرم ثبت‌نام",
    subtitle: "برای حضور در نشست بعدی، لطفاً اطلاعات زیر را با دقت تکمیل کنید.",
    optionalSectionTitle: "اطلاعات تکمیلی (اختیاری)",
    submit: "تکمیل ثبت‌نام و پرداخت",
    submitting: "در حال انتقال به درگاه…",
    generalError: "خطایی در ثبت‌نام رخ داد. لطفاً دوباره تلاش کنید.",
    fetchSessionsError: "خطا در دریافت لیست رویدادها. لطفاً صفحه را تازه‌سازی کنید.",
    noSessionsAvailable: "هیچ رویدادی در حال حاضر برای ثبت‌نام در دسترس نیست.",
  },
  fields: {
    fullName: {
      label: "نام و نام خانوادگی",
      placeholder: "مثال: علی رضایی",
    },
    mobile: {
      label: "شماره موبایل",
      placeholder: "۰۹۱۲۳۴۵۶۷۸۹",
      hint: "شماره ۱۱ رقمی با ۰۹ شروع شود",
    },
    email: {
      label: "ایمیل",
      placeholder: "example@domain.com",
    },
    sessionId: {
      label: "انتخاب رویداد / جلسه",
      placeholder: "یک رویداد را انتخاب کنید",
      full: "تکمیل ظرفیت",
      remainingSeats: (seats: number) => `(${seats} صندلی خالی)`,
      loading: "در حال بارگذاری رویدادها…",
    },
    languageLevel: {
      label: "سطح زبان انگلیسی",
      placeholder: "سطح خود را انتخاب کنید",
      options: {
        beginner: "مقدماتی (Beginner)",
        intermediate: "متوسط (Intermediate)",
        advanced: "پیشرفته (Advanced)",
      },
    },
    firstTime: {
      label: "اولین بار است در رویداد شرکت می‌کنم",
    },
    topicSuggestion: {
      label: "موضوع پیشنهادی برای رویدادهای آینده",
      placeholder: "پیشنهادات خود را بنویسید…",
    },
    heardFrom: {
      label: "نحوه آشنایی با ما",
      placeholder: "انتخاب کنید",
      options: {
        instagram: "اینستاگرام",
        telegram: "تلگرام",
        friend: "معرفی دوستان",
        other: "سایر روش‌ها",
      },
    },
    socialHandle: {
      label: "شناسه کاربری (اینستاگرام یا تلگرام)",
      placeholder: "@username",
    },
    referralCode: {
      label: "کد معرفی",
      placeholder: "در صورت داشتن کد وارد کنید",
    },
    acceptTerms: {
      label: "قوانین و شرایط شرکت در رویداد را مطالعه کرده و می‌پذیرم.",
    },
  },
  validation: {
    fullNameMin: "نام و نام خانوادگی باید حداقل ۳ کاراکتر باشد",
    fullNameMax: "نام و نام خانوادگی نباید بیش از ۷۰ کاراکتر باشد",
    mobileInvalid: "شماره موبایل معتبر نیست (باید ۱۱ رقم و با ۰۹ آغاز شود)",
    emailInvalid: "ایمیل وارد شده معتبر نیست",
    sessionIdRequired: "لطفاً یک جلسه را انتخاب کنید",
    acceptTermsRequired: "پذیرش قوانین الزامی است",
    topicSuggestionMax: "موضوع پیشنهادی نمی‌تواند بیش از ۳۰۰ کاراکتر باشد",
    referralCodeMax: "کد معرفی نمی‌تواند بیش از ۳۲ کاراکتر باشد",
    socialHandleMax: "شناسه کاربری نمی‌تواند بیش از ۶۴ کاراکتر باشد",
  },
} as const;
