import type { NavigatorScreenParams } from '@react-navigation/native';

export type EventsStackParamList = {
  EventsList: undefined;
  EventDetail: { eventId: string };
};

export type AppTabParamList = {
  Home: undefined;
  Events: NavigatorScreenParams<EventsStackParamList> | undefined;
  Tickets: undefined;
  Profile: undefined;
};
