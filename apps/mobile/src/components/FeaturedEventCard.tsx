import type { FC } from 'react';
import { memo, useMemo } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { EventSummary } from '../api/types';
import { spacing, typography } from '../theme';
import { useColors } from '../theme/ThemeContext';
import { formatDateRange } from '../utils/date';

type Props = {
  event: EventSummary;
  onPress?: () => void;
};

const placeholderImage = 'https://placehold.co/800x400/E30613/FFFFFF?text=BVMW';

const FeaturedEventCardComponent: FC<Props> = ({ event, onPress }) => {
  const colors = useColors();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          backgroundColor: colors.card,
          borderRadius: 20,
          overflow: 'hidden',
          marginHorizontal: spacing.lg,
          shadowColor: colors.shadow,
          shadowOpacity: 0.15,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 8 },
          elevation: 4,
        },
        imageContainer: {
          position: 'relative',
          height: 200,
        },
        image: {
          width: '100%',
          height: '100%',
        },
        imageOverlay: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '70%',
          justifyContent: 'flex-end',
          padding: spacing.lg,
        },
        badge: {
          alignSelf: 'flex-start',
          backgroundColor: colors.primary,
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs,
          borderRadius: 8,
          marginBottom: spacing.sm,
        },
        badgeText: {
          color: '#FFFFFF',
          fontSize: 12,
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        },
        overlayTitle: {
          fontSize: 22,
          fontWeight: '700',
          color: '#FFFFFF',
          letterSpacing: -0.3,
        },
        content: {
          padding: spacing.lg,
          gap: spacing.sm,
        },
        metaRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
        },
        metaItem: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.xs,
        },
        metaIcon: {
          fontSize: 16,
        },
        metaText: {
          color: colors.muted,
          fontSize: typography.caption,
          fontWeight: '500',
        },
        footer: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: spacing.sm,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        },
        tags: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: spacing.xs,
          flex: 1,
        },
        tag: {
          backgroundColor: colors.surfaceHighlight,
          borderRadius: 6,
          paddingVertical: 4,
          paddingHorizontal: spacing.sm,
        },
        tagText: {
          fontSize: 12,
          color: colors.muted,
          fontWeight: '500',
        },
        ctaButton: {
          backgroundColor: colors.primary,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.sm,
          borderRadius: 12,
        },
        ctaText: {
          color: '#FFFFFF',
          fontSize: typography.caption,
          fontWeight: '600',
        },
      }),
    [colors]
  );

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Event ${event.title}`}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: event.headerImageUrl ?? placeholderImage }}
          style={styles.image}
          accessibilityIgnoresInvertColors
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.imageOverlay}
        >
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {event.isOnline ? 'Online Event' : 'Vor Ort'}
            </Text>
          </View>
          <Text style={styles.overlayTitle} numberOfLines={2}>
            {event.title}
          </Text>
        </LinearGradient>
      </View>
      <View style={styles.content}>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>📅</Text>
            <Text style={styles.metaText}>{formatDateRange(event.start, event.end)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>📍</Text>
            <Text style={styles.metaText}>
              {event.isOnline ? 'Online' : event.city ?? 'Ort folgt'}
            </Text>
          </View>
        </View>
        <View style={styles.footer}>
          <View style={styles.tags}>
            {event.tags.slice(0, 2).map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
          <View style={styles.ctaButton}>
            <Text style={styles.ctaText}>Details →</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const FeaturedEventCard = memo(FeaturedEventCardComponent);
