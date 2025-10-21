import type { FC } from 'react';
import { memo } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { EventSummary } from '../api/types';
import { colors, radii, spacing, typography } from '../theme';
import { formatDateRange } from '../utils/date';

type Props = {
  event: EventSummary;
  onPress?: () => void;
};

const placeholderImage = 'https://placehold.co/600x300/E30613/FFFFFF?text=BVMW';

const distanceFormatter = new Intl.NumberFormat('de-DE', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const EventCardComponent: FC<Props> = ({ event, onPress }) => {
  const formattedDistance =
    typeof event.distanceKm === 'number'
      ? `${distanceFormatter.format(event.distanceKm)} km entfernt`
      : null;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Event ${event.title}`}
    >
      <Image
        source={{ uri: event.headerImageUrl ?? placeholderImage }}
        style={styles.image}
        accessibilityIgnoresInvertColors
      />
      <View style={styles.content}>
        <Text style={styles.date}>{formatDateRange(event.start, event.end)}</Text>
        <Text style={styles.title}>{event.title}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>
            {event.isOnline ? 'Online' : event.city ?? 'Ort folgt'}
          </Text>
          {formattedDistance && <Text style={styles.meta}>{formattedDistance}</Text>}
        </View>
        <View style={styles.tags}>
          {event.tags.slice(0, 3).map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const EventCard = memo(EventCardComponent);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: radii.md,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    shadowColor: '#0000001A',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 160,
  },
  content: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  date: {
    color: colors.muted,
    fontSize: typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: typography.subheading,
    fontWeight: '600',
    color: colors.text,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  meta: {
    color: colors.muted,
    fontSize: typography.caption,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  tag: {
    backgroundColor: colors.surface,
    borderRadius: radii.sm,
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
  },
  tagText: {
    fontSize: typography.caption,
    color: colors.muted,
  },
});
