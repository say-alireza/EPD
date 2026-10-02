export interface Session {
  id: string;
  title: string;
  date?: string;
  capacity: number;
  remainingSeats: number;
  isFull: boolean;
  feeTomans?: number;
  feeFa?: string;
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
  descriptionFa?: string;
  descriptionEn?: string;
  posterImage?: string | null;
  feeTomans?: number;
  feeFa?: string;
}

export interface PosterItem {
  id: string;
  sessionNumber: number;
  topicEn: string;
  dateFa: string;
  image: string;
  category?: "new-chapter" | "weekly-1405" | "courses";
  sessionLabel?: string;
}

export interface GalleryItem {
  id: string;
  sessionNumber: number;
  image: string;
  category?: "new-chapter" | "weekly-1405" | "courses" | "scoreboard";
  sessionLabel?: string;
  captionFa?: string;
  isScoreboard?: boolean;
  isVideo?: boolean;
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
  paymentStatus?: "free" | "pending" | "paid" | "failed";
  paymentAuthority?: string;
  paymentRefId?: string;
  amountTomans?: number;
  paidAt?: string;
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
