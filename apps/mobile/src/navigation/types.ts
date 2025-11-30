import type { NavigatorScreenParams } from '@react-navigation/native';

export type EventsStackParamList = {
  EventsList: undefined;
  EventDetail: { eventId: string };
  EventChat: { eventId: string; partnerId: string; partnerName?: string | null };
};

export type AppTabParamList = {
  Home: undefined;
  Events: NavigatorScreenParams<EventsStackParamList> | undefined;
  Tickets: undefined;
  Profile: undefined;
};
