import type { FC } from 'react';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import type { ColorValue } from 'react-native';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  BVMW_RED_HEX,
  ZUKUNFTSTAG_HERO_IMAGE,
  ZUKUNFTSTAG_LOCATION_LABEL,
  ZUKUNFTSTAG_START_ISO,
} from '../config/zukunftstag';
import { strings } from '../i18n/strings';
import { colors, spacing, typography } from '../theme';
import { track } from '../utils/analytics';
import { openZukunftstagBrowser } from '../utils/zukunftstag';

type CountdownState = {
  label: string;
};

const GRADIENT_COLORS: [ColorValue, ColorValue] = [
  'rgba(0,0,0,0.05)',
  'rgba(0,0,0,0.55)',
];
const HERO_BORDER_RADIUS = 24;
const COUNTDOWN_REFRESH_INTERVAL_MS = 30_000;

const createCountdownLabel = (eventDate: Date) => {
  const diffMs = eventDate.getTime() - Date.now();

  if (Number.isNaN(diffMs) || diffMs <= 0) {
    return strings.zukunftstag.heroCountdownToday;
  }

  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (totalDays >= 1) {
    const dayCount = Math.max(1, totalDays);
    return strings.zukunftstag.heroCountdownInDays(dayCount);
  }

  const totalHours = Math.ceil(diffMs / (1000 * 60 * 60));
  const hourCount = Math.max(1, totalHours);
  return strings.zukunftstag.heroCountdownInHours(hourCount);
};

const ZukunftstagHeroComponent: FC = () => {
  const eventDate = useMemo(() => new Date(ZUKUNFTSTAG_START_ISO), []);
  const [countdown, setCountdown] = useState<CountdownState>(() => ({
    label: createCountdownLabel(eventDate),
  }));

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCountdown((current) => {
        const nextLabel = createCountdownLabel(eventDate);

        if (current.label === nextLabel) {
          return current;
        }

        return { label: nextLabel };
      });
    }, COUNTDOWN_REFRESH_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [eventDate]);

  const handlePress = useCallback(async () => {
    track('ZT_Hero_Click');
    await openZukunftstagBrowser();
  }, []);

  const content = (
    <LinearGradient
      colors={GRADIENT_COLORS}
      style={styles.gradient}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <View style={styles.badge} accessibilityRole="text">
        <Text style={styles.badgeText}>{strings.zukunftstag.badgeLabel}</Text>
      </View>
      <Text style={styles.title}>{strings.zukunftstag.heroTitle}</Text>
      <Text style={styles.subtitle}>{ZUKUNFTSTAG_LOCATION_LABEL}</Text>
      <View style={styles.actionsRow}>
        <View style={styles.countdownChip} accessibilityRole="text">
          <Text style={styles.countdownText}>{countdown.label}</Text>
        </View>
        <Pressable
          onPress={handlePress}
          style={({ pressed }) => [
            styles.ctaButton,
            pressed && styles.ctaButtonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={strings.zukunftstag.heroCtaAccessibilityLabel}
          testID="zukunftstag-hero-cta"
        >
          {({ pressed }) => (
            <Text
              style={[
                styles.ctaText,
                pressed && styles.ctaTextPressed,
              ]}
            >
              {strings.zukunftstag.heroCtaLabel}
            </Text>
          )}
        </Pressable>
      </View>
    </LinearGradient>
  );

  return (
    <View
      style={styles.container}
      accessible
      accessibilityLabel={strings.zukunftstag.heroAccessibilityLabel}
      testID="zukunftstag-hero"
    >
      {ZUKUNFTSTAG_HERO_IMAGE ? (
        <ImageBackground
          source={{ uri: ZUKUNFTSTAG_HERO_IMAGE }}
          style={styles.background}
          imageStyle={styles.backgroundImage}
        >
          {content}
        </ImageBackground>
      ) : (
        <View style={styles.fallback}>{content}</View>
      )}
    </View>
  );
};

export const ZukunftstagHero = memo(ZukunftstagHeroComponent);

const styles = StyleSheet.create({
  container: {
    borderRadius: HERO_BORDER_RADIUS,
    overflow: 'hidden',
    shadowColor: '#00000026',
    shadowOpacity: 0.2,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
    backgroundColor: colors.surface,
  },
  background: {
    height: 240,
  },
  backgroundImage: {
    borderRadius: HERO_BORDER_RADIUS,
    transform: [{ scale: 1.02 }],
  },
  fallback: {
    height: 240,
    backgroundColor: '#1f2937',
  },
  gradient: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: BVMW_RED_HEX,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    color: colors.background,
    fontSize: typography.caption,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.background,
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: typography.body,
  },
  actionsRow: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  countdownChip: {
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  countdownText: {
    color: colors.background,
    fontSize: typography.caption,
    fontWeight: '600',
  },
  ctaButton: {
    paddingVertical: 10,
    paddingHorizontal: spacing.lg,
    borderRadius: 999,
    backgroundColor: BVMW_RED_HEX,
  },
  ctaButtonPressed: {
    backgroundColor: '#960013',
  },
  ctaText: {
    color: colors.background,
    fontSize: typography.body,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  ctaTextPressed: {
    color: 'rgba(255,255,255,0.9)',
  },
});
