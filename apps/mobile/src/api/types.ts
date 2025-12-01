export interface EventSummary {
  id: string;
  title: string;
  start: string;
  end: string;
  city: string | null;
  region: string | null;
  isOnline: boolean;
  headerImageUrl: string | null;
  tags: string[];
  distanceKm: number | null;
}

export interface EventDetail extends EventSummary {
  subtitle: string | null;
  description: string | null;
  status: 'Planned' | 'Confirmed' | 'Completed' | 'Cancelled';
  isPublic: boolean;
  venueName: string | null;
  street: string | null;
  postalCode: string | null;
  state: string | null;
  country: string | null;
  registrationUrl: string | null;
}

export interface RegistrationSummary {
  id: string;
  status: 'registered' | 'pending' | 'rejected' | 'cancelled' | 'attended';
  checkInAt: string | null;
  event: EventSummary;
}

export interface MemberProfile {
  id: string;
  name: string | null;
  company: string | null;
  type: 'contact' | 'lead';
}

export interface AttendeeSummary {
  member: MemberProfile;
  status: RegistrationSummary['status'];
}

export interface ChatMessage {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  createdAt: string;
}

export interface NewsSummary {
  id: string;
  headline: string;
  subline: string | null;
  imageUrl: string | null;
  publishedAt: string;
}

export interface NewsArticle extends NewsSummary {
  content: string;
  author: string;
  downloadUrl: string | null;
}
