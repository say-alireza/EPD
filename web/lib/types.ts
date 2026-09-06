export interface Session {
  id: string;
  title: string;
  date?: string;
  capacity: number;
  remainingSeats: number;
  isFull: boolean;
}

export interface UpcomingSession {
  id: string;
  number: number;
  dateIso: string;
  timeFa: string;
  timeEn?: string;
  venueFa: string;
  venueEn?: string;
  levelFa: string;
  remainingSeats: number;
  topicEn: string;
  topicFa: string;
  posterImage?: string | null;
}

export interface PosterItem {
  id: string;
  sessionNumber: number;
  topicEn: string;
  dateFa: string;
  image: string;
}

export interface GalleryItem {
  id: string;
  sessionNumber: number;
  image: string;
}

export interface RegistrationRecord {
  id: string;
  fullName: string;
  mobile: string;
  email: string;
  sessionId: string;
  sessionTitle?: string;
  languageLevel?: "beginner" | "intermediate" | "advanced";
  firstTime?: boolean;
  topicSuggestion?: string;
  referralCode?: string;
  heardFrom?: "instagram" | "telegram" | "friend" | "other";
  socialHandle?: string;
  createdAt: string;
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
