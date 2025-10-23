import type { FC } from 'react';
import { memo, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BVMW_RED_HEX } from '../config/zukunftstag';
import { strings } from '../i18n/strings';
import { colors, spacing, typography } from '../theme';
import { track } from '../utils/analytics';
import { openZukunftstagBrowser } from '../utils/zukunftstag';

const ZukunftstagCardComponent: FC = () => {
  const handlePress = useCallback(async () => {
    track('ZT_Card_Click');
    await openZukunftstagBrowser();
  }, []);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={strings.zukunftstag.cardAccessibilityLabel}
      onPress={handlePress}
      testID="zukunftstag-card"
    >
      {({ pressed }) => (
        <View style={styles.content}>
          <Text style={styles.title}>{strings.zukunftstag.cardTitle}</Text>
          <Text style={styles.subtitle}>{strings.zukunftstag.cardSubtitle}</Text>
          <View
            style={[styles.ctaPill, pressed && styles.ctaPillPressed]}
            accessibilityRole="text"
          >
            <Text style={styles.ctaPillText}>{strings.zukunftstag.cardCtaLabel}</Text>
          </View>
        </View>
      )}
    </Pressable>
  );
};

export const ZukunftstagCard = memo(ZukunftstagCardComponent);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#eeeeee',
    shadowColor: '#0000001A',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    transform: [{ scale: 1 }],
  },
  cardPressed: {
    elevation: 1,
    shadowOpacity: 0.05,
    transform: [{ scale: 0.99 }],
  },
  content: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.subheading,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 15,
    color: colors.muted,
    lineHeight: 22,
  },
  ctaPill: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
    backgroundColor: '#fce6e9',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: 999,
  },
  ctaPillPressed: {
    backgroundColor: '#f8d0d6',
  },
  ctaPillText: {
    fontSize: typography.caption,
    color: BVMW_RED_HEX,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
});
