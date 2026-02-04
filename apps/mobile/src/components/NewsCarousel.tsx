import type { FC } from 'react';
import { memo, useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Image } from 'react-native';
import type { NewsSummary } from '../api/types';
import { spacing, typography } from '../theme';
import { useColors } from '../theme/ThemeContext';
import { formatDate } from '../utils/date';

interface NewsCarouselProps {
  news: NewsSummary[];
  onPressItem: (newsId: string) => void;
  onPressAll: () => void;
}

const placeholderImage = 'https://placehold.co/300x200/E30613/FFFFFF?text=BVMW';

const NewsCarouselComponent: FC<NewsCarouselProps> = ({ news, onPressItem, onPressAll }) => {
  const colors = useColors();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          gap: spacing.md,
        },
        header: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: spacing.lg,
        },
        title: {
          fontSize: typography.subheading,
          fontWeight: '700',
          color: colors.text,
          letterSpacing: -0.3,
        },
        seeAllButton: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.xs,
        },
        seeAllText: {
          fontSize: typography.caption,
          fontWeight: '600',
          color: colors.primary,
        },
        scrollContent: {
          paddingHorizontal: spacing.lg,
          gap: spacing.md,
        },
        newsCard: {
          width: 200,
          backgroundColor: colors.card,
          borderRadius: 16,
          overflow: 'hidden',
          shadowColor: colors.shadow,
          shadowOpacity: 0.08,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: 2,
        },
        newsImage: {
          width: '100%',
          height: 120,
        },
        newsContent: {
          padding: spacing.md,
          gap: spacing.xs,
        },
        newsDate: {
          fontSize: 11,
          fontWeight: '600',
          color: colors.muted,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        },
        newsHeadline: {
          fontSize: typography.caption,
          fontWeight: '600',
          color: colors.text,
          lineHeight: 18,
        },
        emptyContainer: {
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.xl,
          alignItems: 'center',
        },
        emptyText: {
          color: colors.muted,
          fontSize: typography.body,
        },
      }),
    [colors]
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Neuigkeiten</Text>
        <TouchableOpacity
          style={styles.seeAllButton}
          onPress={onPressAll}
          accessibilityRole="button"
          accessibilityLabel="Alle News anzeigen"
        >
          <Text style={styles.seeAllText}>Alle anzeigen</Text>
          <Text style={[styles.seeAllText, { fontSize: 16 }]}>→</Text>
        </TouchableOpacity>
      </View>

      {news.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Noch keine News verfügbar.</Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {news.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.newsCard}
              onPress={() => onPressItem(item.id)}
              accessibilityRole="button"
              accessibilityLabel={`News: ${item.headline}`}
              activeOpacity={0.9}
            >
              <Image
                source={{ uri: item.imageUrl ?? placeholderImage }}
                style={styles.newsImage}
                accessibilityIgnoresInvertColors
              />
              <View style={styles.newsContent}>
                <Text style={styles.newsDate}>{formatDate(item.publishedAt)}</Text>
                <Text style={styles.newsHeadline} numberOfLines={2}>
                  {item.headline}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export const NewsCarousel = memo(NewsCarouselComponent);
