import type { FC } from 'react';
import { memo } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NewsSummary } from '../api/types';
import { colors, radii, spacing, typography } from '../theme';
import { formatDate } from '../utils/date';

type Props = {
  news: NewsSummary;
  onPress?: () => void;
};

const placeholderImage = 'https://placehold.co/600x300/E30613/FFFFFF?text=BVMW';

const NewsCardComponent: FC<Props> = ({ news, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`News ${news.headline}`}
    >
      <Image
        source={{ uri: news.imageUrl ?? placeholderImage }}
        style={styles.image}
        accessibilityIgnoresInvertColors
      />
      <View style={styles.content}>
        <Text style={styles.date}>{formatDate(news.publishedAt)}</Text>
        <Text style={styles.title}>{news.headline}</Text>
        {news.subline ? <Text style={styles.subline}>{news.subline}</Text> : null}
      </View>
    </TouchableOpacity>
  );
};

export const NewsCard = memo(NewsCardComponent);

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
    gap: spacing.xs,
  },
  date: {
    color: colors.muted,
    fontSize: typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: typography.subheading,
    fontWeight: '700',
    color: colors.text,
  },
  subline: {
    fontSize: typography.body,
    color: colors.muted,
  },
});
