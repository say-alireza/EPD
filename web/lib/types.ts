export interface Session {
  id: string;
  title: string;
  date?: string;
  capacity: number;
  remainingSeats: number;
  isFull: boolean;
}

export interface RegistrationPayload {
  fullName: string;
  mobile: string;
  email: string;
  sessionId: string;
  acceptTerms: true;
  languageLevel?: "beginner" | "intermediate" | "advanced";
  firstTime?: boolean;
  topicSuggestion?: string;
  referralCode?: string;
  heardFrom?: "instagram" | "telegram" | "friend" | "other";
  socialHandle?: string;
}

export interface RegistrationResponse {
  success: boolean;
  registrationId?: string;
  paymentUrl?: string;
  message?: string;
}
