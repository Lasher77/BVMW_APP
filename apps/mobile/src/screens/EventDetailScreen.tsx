import type { FC } from 'react';
import { useEffect } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useEvent } from '../hooks/useEvents';
import { useEventAttendees } from '../hooks/useChat';
import type { EventsStackParamList } from '../navigation/types';
import { colors, spacing, typography } from '../theme';
import { formatDateRange } from '../utils/date';
import { stripHtml } from '../utils/html';
import { currentMemberId } from '../config/member';

const placeholderImage = 'https://placehold.co/800x400/E30613/FFFFFF?text=BVMW';

export const EventDetailScreen: FC = () => {
  const route = useRoute<RouteProp<EventsStackParamList, 'EventDetail'>>();
  const navigation = useNavigation<NativeStackNavigationProp<EventsStackParamList>>();
  const { data, isLoading } = useEvent(route.params.eventId);
  const { data: attendeesData, isLoading: attendeesLoading } = useEventAttendees(
    route.params.eventId,
  );

  useEffect(() => {
    if (data?.event?.title) {
      navigation.setOptions({ title: data.event.title });
    }
  }, [data?.event?.title, navigation]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top']}>
        <ActivityIndicator color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (!data?.event) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top']}>
        <Text style={styles.error}>Event konnte nicht geladen werden.</Text>
      </SafeAreaView>
    );
  }

  const { event } = data;

  const handleRegister = async () => {
    if (event.registrationUrl) {
      await WebBrowser.openBrowserAsync(event.registrationUrl);
    }
  };

  const openMaps = () => {
    if (!event.city) return;
    const query = encodeURIComponent(`${event.venueName ?? ''} ${event.city}`.trim());
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    Linking.openURL(url).catch(() => {
      /* noop */
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Image
          source={{ uri: event.headerImageUrl ?? placeholderImage }}
          style={styles.hero}
          accessibilityIgnoresInvertColors
        />
        <View style={styles.section}>
          <Text style={styles.title}>{event.title}</Text>
          <Text style={styles.subtitle}>{event.subtitle}</Text>
          <Text style={styles.meta}>{formatDateRange(event.start, event.end)}</Text>
          <Text style={styles.meta}>
            {event.isOnline ? 'Online' : `${event.venueName ?? ''} · ${event.city ?? ''}`}
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Beschreibung</Text>
          <Text style={styles.body}>{stripHtml(event.description)}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Teilnehmende</Text>
          {attendeesLoading && <ActivityIndicator color={colors.primary} />}
          {!attendeesLoading && (attendeesData?.attendees?.length ?? 0) === 0 && (
            <Text style={styles.meta}>Noch keine Anmeldungen sichtbar.</Text>
          )}
          {attendeesData?.attendees?.map((attendee) => (
            <View key={attendee.member.id} style={styles.attendeeRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.attendeeName}>{attendee.member.name ?? 'Teilnehmer'}</Text>
                <Text style={styles.attendeeCompany}>{attendee.member.company ?? 'Ohne Firma'}</Text>
              </View>
              {attendee.member.id !== currentMemberId && (
                <TouchableOpacity
                  style={styles.chatButton}
                  onPress={() =>
                    navigation.navigate('EventChat', {
                      eventId: event.id,
                      partnerId: attendee.member.id,
                      partnerName: attendee.member.name,
                    })
                  }
                  accessibilityRole="button"
                >
                  <Text style={styles.chatButtonLabel}>Chat starten</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
        {!event.isOnline && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ort</Text>
            <TouchableOpacity style={styles.mapPreview} onPress={openMaps} accessibilityRole="button">
              <Text style={styles.mapText}>
                {event.street ? `${event.street}, ` : ''}
                {event.postalCode ? `${event.postalCode} ` : ''}
                {event.city ?? ''}
              </Text>
              <Text style={styles.mapHint}>Karte öffnen</Text>
            </TouchableOpacity>
          </View>
        )}
        {event.registrationUrl && (
          <TouchableOpacity style={styles.cta} onPress={handleRegister} accessibilityRole="button">
            <Text style={styles.ctaText}>Anmelden</Text>
          </TouchableOpacity>
        )}
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
    paddingBottom: spacing.xl,
  },
  hero: {
    width: '100%',
    height: 220,
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.heading,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: typography.body,
    color: colors.muted,
  },
  meta: {
    color: colors.muted,
    fontSize: typography.caption,
  },
  sectionTitle: {
    fontSize: typography.subheading,
    fontWeight: '600',
    color: colors.text,
  },
  body: {
    fontSize: typography.body,
    color: colors.text,
    lineHeight: 22,
  },
  mapPreview: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: spacing.lg,
    borderColor: colors.border,
    borderWidth: 1,
  },
  mapText: {
    fontSize: typography.body,
    color: colors.text,
  },
  mapHint: {
    marginTop: spacing.xs,
    fontSize: typography.caption,
    color: colors.primary,
  },
  attendeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  attendeeName: {
    fontSize: typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  attendeeCompany: {
    fontSize: typography.caption,
    color: colors.muted,
  },
  chatButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
  },
  chatButtonLabel: {
    color: colors.background,
    fontWeight: '600',
    fontSize: typography.caption,
  },
  cta: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.lg,
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 999,
    alignItems: 'center',
  },
  ctaText: {
    color: colors.background,
    fontSize: typography.subheading,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  error: {
    color: colors.muted,
    fontSize: typography.body,
  },
});
