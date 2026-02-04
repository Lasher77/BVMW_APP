import type { FC } from 'react';
import { useCallback, useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { AppTabParamList, HomeStackParamList } from '../navigation/types';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEvents } from '../hooks/useEvents';
import { useNews } from '../hooks/useNews';
import { spacing, typography } from '../theme';
import { useColors } from '../theme/ThemeContext';
import { FEATURE_ZUKUNFTSTAG_ENABLED } from '../config/zukunftstag';
import { ZukunftstagHero } from '../components/ZukunftstagHero';

// New Apple-style components
import { HeroHeader } from '../components/HeroHeader';
import { FeaturedEventCard } from '../components/FeaturedEventCard';
import { QuickActions } from '../components/QuickActions';
import { NewsCarousel } from '../components/NewsCarousel';

type HomeNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList, 'Dashboard'>,
  BottomTabNavigationProp<AppTabParamList>
>;

export const HomeScreen: FC = () => {
  const navigation = useNavigation<HomeNavigationProp>();
  const colors = useColors();
  const { data, isRefetching: isEventsRefetching, refetch: refetchEvents } = useEvents();
  const { data: newsData, isRefetching: isNewsRefetching, refetch: refetchNews } = useNews(5);

  const nextEvent = useMemo(() => data?.events?.[0], [data?.events]);
  const latestNews = newsData?.news ?? [];
  const refreshing = isEventsRefetching || isNewsRefetching;

  const handleRefresh = useCallback(() => {
    void Promise.all([refetchEvents(), refetchNews()]);
  }, [refetchEvents, refetchNews]);

  const quickActions = useMemo(
    () => [
      {
        id: 'tickets',
        icon: '🎟️',
        label: 'Tickets',
        onPress: () => navigation.navigate('Tickets'),
      },
      {
        id: 'events',
        icon: '📅',
        label: 'Events',
        onPress: () => navigation.navigate('Events'),
      },
      {
        id: 'news',
        icon: '📰',
        label: 'News',
        onPress: () => navigation.navigate('NewsList'),
      },
      {
        id: 'profile',
        icon: '👤',
        label: 'Profil',
        onPress: () => navigation.navigate('Profile'),
      },
    ],
    [navigation]
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        safe: {
          flex: 1,
          backgroundColor: colors.surface,
        },
        container: {
          paddingBottom: spacing.xl,
        },
        section: {
          marginTop: spacing.xl,
        },
        sectionHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: spacing.lg,
          marginBottom: spacing.md,
        },
        sectionTitle: {
          fontSize: typography.subheading,
          fontWeight: '700',
          color: colors.text,
          letterSpacing: -0.3,
        },
        emptyContainer: {
          marginHorizontal: spacing.lg,
          padding: spacing.xl,
          backgroundColor: colors.card,
          borderRadius: 16,
          alignItems: 'center',
        },
        emptyIcon: {
          fontSize: 48,
          marginBottom: spacing.md,
        },
        emptyTitle: {
          fontSize: typography.subheading,
          fontWeight: '600',
          color: colors.text,
          marginBottom: spacing.xs,
        },
        emptyText: {
          fontSize: typography.caption,
          color: colors.muted,
          textAlign: 'center',
        },
      }),
    [colors]
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Hero Header with Greeting */}
        <HeroHeader />

        {/* Zukunftstag Hero (if enabled) */}
        {FEATURE_ZUKUNFTSTAG_ENABLED && (
          <View style={[styles.section, { marginTop: spacing.lg }]}>
            <ZukunftstagHero />
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <QuickActions actions={quickActions} />
        </View>

        {/* Featured Event */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nächstes Event</Text>
          </View>
          {nextEvent ? (
            <FeaturedEventCard
              event={nextEvent}
              onPress={() =>
                navigation.navigate('Events', {
                  screen: 'EventDetail',
                  params: { eventId: nextEvent.id },
                })
              }
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📅</Text>
              <Text style={styles.emptyTitle}>Keine Events</Text>
              <Text style={styles.emptyText}>
                Aktuell sind keine kommenden Events verfügbar.
              </Text>
            </View>
          )}
        </View>

        {/* News Carousel */}
        <View style={styles.section}>
          <NewsCarousel
            news={latestNews}
            onPressItem={(newsId) => navigation.navigate('NewsDetail', { newsId })}
            onPressAll={() => navigation.navigate('NewsList')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
