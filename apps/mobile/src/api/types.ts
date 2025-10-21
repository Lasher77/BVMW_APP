export interface EventSummary {
  id: string;
  title: string;
  start: string;
  end: string;
  city: string | null;
  isOnline: boolean;
  headerImageUrl: string | null;
  tags: string[];
  distance: number | null;
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
