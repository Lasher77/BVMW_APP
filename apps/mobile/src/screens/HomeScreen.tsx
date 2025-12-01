import type { FC } from 'react';
import { useCallback, useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { AppTabParamList, HomeStackParamList } from '../navigation/types';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEvents } from '../hooks/useEvents';
import { EventCard } from '../components/EventCard';
import { SectionHeader } from '../components/SectionHeader';
import { colors, spacing, typography } from '../theme';
import { FEATURE_ZUKUNFTSTAG_ENABLED } from '../config/zukunftstag';
import { ZukunftstagHero } from '../components/ZukunftstagHero';
import { ZukunftstagCard } from '../components/ZukunftstagCard';
import { strings } from '../i18n/strings';
import { useNews } from '../hooks/useNews';
import { NewsCard } from '../components/NewsCard';

type HomeNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList, 'Dashboard'>,
  BottomTabNavigationProp<AppTabParamList>
>;

export const HomeScreen: FC = () => {
  const navigation = useNavigation<HomeNavigationProp>();
  const { data, isRefetching: isEventsRefetching, refetch: refetchEvents } = useEvents();
  const { data: newsData, isRefetching: isNewsRefetching, refetch: refetchNews } = useNews(3);

  const nextEvent = useMemo(() => data?.events?.[0], [data?.events]);
  const latestNews = newsData?.news ?? [];
  const refreshing = isEventsRefetching || isNewsRefetching;

  const handleRefresh = useCallback(() => {
    void Promise.all([refetchEvents(), refetchNews()]);
  }, [refetchEvents, refetchNews]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.primary]} />
        }
      >
        {FEATURE_ZUKUNFTSTAG_ENABLED && <ZukunftstagHero />}
        <Text style={styles.greeting}>{strings.home.greeting}</Text>
        <SectionHeader title={strings.home.nextEventSectionTitle} />
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
          <Text style={styles.empty}>{strings.home.noUpcomingEvents}</Text>
        )}

        <View style={styles.newsHeaderRow}>
          <SectionHeader title={strings.home.newsSectionTitle} />
          <TouchableOpacity
            onPress={() => navigation.navigate('NewsList')}
            accessibilityRole="button"
            accessibilityLabel={strings.home.newsSeeAll}
          >
            <Text style={styles.newsLink}>{strings.home.newsSeeAll}</Text>
          </TouchableOpacity>
        </View>
        {latestNews.length === 0 ? (
          <Text style={styles.empty}>{strings.news.empty}</Text>
        ) : (
          latestNews.map((item) => (
            <NewsCard
              key={item.id}
              news={item}
              onPress={() => navigation.navigate('NewsDetail', { newsId: item.id })}
            />
          ))
        )}

        {FEATURE_ZUKUNFTSTAG_ENABLED && (
          <>
            <SectionHeader title={strings.zukunftstag.cardSectionTitle} />
            <ZukunftstagCard />
          </>
        )}

        <SectionHeader title={strings.home.quickLinksSectionTitle} />
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
          <TouchableOpacity
            style={styles.quickLink}
            onPress={() => navigation.navigate('NewsList')}
            accessibilityRole="button"
          >
            <Text style={styles.quickLinkTitle}>News</Text>
            <Text style={styles.quickLinkSubtitle}>{strings.home.newsSeeAll}</Text>
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
  newsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newsLink: {
    color: colors.primary,
    fontWeight: '600',
  },
});
