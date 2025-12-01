import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { enableScreens } from 'react-native-screens';
import { colors } from '../theme';
import type { AppTabParamList, EventsStackParamList, HomeStackParamList } from './types';
import { HomeScreen } from '../screens/HomeScreen';
import { EventsScreen } from '../screens/EventsScreen';
import { EventDetailScreen } from '../screens/EventDetailScreen';
import { EventChatScreen } from '../screens/EventChatScreen';
import { TicketsScreen } from '../screens/TicketsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { NewsDetailScreen } from '../screens/NewsDetailScreen';
import { NewsListScreen } from '../screens/NewsListScreen';

enableScreens(true);

const Tab = createBottomTabNavigator<AppTabParamList>();
const EventsStack = createNativeStackNavigator<EventsStackParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    primary: colors.primary,
    card: colors.background,
    text: colors.text,
    border: colors.border,
  },
};

function EventsStackNavigator() {
  return (
    <EventsStack.Navigator>
      <EventsStack.Screen
        name="EventsList"
        component={EventsScreen}
        options={{ title: 'Events' }}
      />
      <EventsStack.Screen
        name="EventDetail"
        component={EventDetailScreen}
        options={{ title: 'Event' }}
      />
      <EventsStack.Screen
        name="EventChat"
        component={EventChatScreen}
        options={{ title: 'Chat' }}
      />
    </EventsStack.Navigator>
  );
}

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name="Dashboard" component={HomeScreen} options={{ headerShown: false }} />
      <HomeStack.Screen name="NewsList" component={NewsListScreen} options={{ title: 'News' }} />
      <HomeStack.Screen name="NewsDetail" component={NewsDetailScreen} options={{ title: 'News' }} />
    </HomeStack.Navigator>
  );
}

export function RootNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen name="Home" component={HomeStackNavigator} options={{ title: 'Home' }} />
        <Tab.Screen
          name="Events"
          component={EventsStackNavigator}
          options={{ title: 'Events', headerShown: false }}
        />
        <Tab.Screen name="Tickets" component={TicketsScreen} options={{ title: 'Meine Tickets' }} />
        <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
