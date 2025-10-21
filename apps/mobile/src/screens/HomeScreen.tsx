import type { FC } from 'react';
import { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { AppTabParamList } from '../navigation/types';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useEvents } from '../hooks/useEvents';
import { EventCard } from '../components/EventCard';
import { SectionHeader } from '../components/SectionHeader';
import { colors, spacing, typography } from '../theme';

export const HomeScreen: FC = () => {
  const navigation = useNavigation<BottomTabNavigationProp<AppTabParamList>>();
  const { data } = useEvents();

  const nextEvent = useMemo(() => data?.events?.[0], [data?.events]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.greeting}>Willkommen!</Text>
        <SectionHeader title="Nächstes Event in deiner Nähe" />
        {nextEvent ? (
          <EventCard
            event={nextEvent}
            onPress={() =>
              navigation.navigate('Events', {
                screen: 'EventDetail',
                params: { eventId: nextEvent.id },
              })
            }
          />
        ) : (
          <Text style={styles.empty}>Keine kommenden Events gefunden.</Text>
        )}

        <SectionHeader title="Schnellzugriff" />
        <View style={styles.quickLinks}>
          <TouchableOpacity
            style={styles.quickLink}
            onPress={() => navigation.navigate('Tickets')}
            accessibilityRole="button"
          >
            <Text style={styles.quickLinkTitle}>Meine Tickets</Text>
            <Text style={styles.quickLinkSubtitle}>Status & QR-Codes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickLink}
            onPress={() => navigation.navigate('Events')}
            accessibilityRole="button"
          >
            <Text style={styles.quickLinkTitle}>Events</Text>
            <Text style={styles.quickLinkSubtitle}>Alle Veranstaltungen</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickLink}
            onPress={() => navigation.navigate('Profile')}
            accessibilityRole="button"
          >
            <Text style={styles.quickLinkTitle}>Profil</Text>
            <Text style={styles.quickLinkSubtitle}>Meine Daten</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  container: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  greeting: {
    fontSize: typography.heading,
    fontWeight: '700',
    color: colors.text,
  },
  empty: {
    color: colors.muted,
    fontSize: typography.body,
  },
  quickLinks: {
    gap: spacing.md,
  },
  quickLink: {
    backgroundColor: colors.background,
    padding: spacing.lg,
    borderRadius: 16,
    shadowColor: '#0000001A',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  quickLinkTitle: {
    fontSize: typography.subheading,
    fontWeight: '600',
    color: colors.text,
  },
  quickLinkSubtitle: {
    marginTop: spacing.xs,
    fontSize: typography.caption,
    color: colors.muted,
  },
});
