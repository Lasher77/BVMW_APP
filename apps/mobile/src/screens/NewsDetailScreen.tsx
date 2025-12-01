import type { FC } from 'react';
import { StyleSheet, Text, ScrollView, Image, View, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { colors, spacing, typography } from '../theme';
import { formatDate } from '../utils/date';
import { useNewsArticle } from '../hooks/useNews';
import type { HomeStackParamList } from '../navigation/types';
import { strings } from '../i18n/strings';

const placeholderImage = 'https://placehold.co/800x400/E30613/FFFFFF?text=BVMW';

export const NewsDetailScreen: FC = () => {
  const route = useRoute<RouteProp<HomeStackParamList, 'NewsDetail'>>();
  const { data, isLoading, error } = useNewsArticle(route.params.newsId);
  const article = data?.article;

  const handleDownload = () => {
    if (article?.downloadUrl) {
      Linking.openURL(article.downloadUrl).catch(() => undefined);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        {isLoading && <Text style={styles.status}>Lade…</Text>}
        {error && <Text style={styles.status}>Konnte News nicht laden.</Text>}
        {article && (
          <>
            <Image
              source={{ uri: article.imageUrl ?? placeholderImage }}
              style={styles.image}
              accessibilityIgnoresInvertColors
            />
            <Text style={styles.date}>{formatDate(article.publishedAt)}</Text>
            <Text style={styles.title}>{article.headline}</Text>
            {article.subline ? <Text style={styles.subline}>{article.subline}</Text> : null}
            <Text style={styles.author}>{strings.news.publishedBy(article.author)}</Text>
            <Text style={styles.content}>{article.content}</Text>
            {article.downloadUrl ? (
              <View style={styles.downloadContainer}>
                <TouchableOpacity
                  style={styles.downloadButton}
                  onPress={handleDownload}
                  accessibilityRole="button"
                  accessibilityLabel={strings.news.downloadLabel}
                >
                  <Text style={styles.downloadLabel}>{strings.news.downloadLabel}</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </>
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
    padding: spacing.lg,
    gap: spacing.md,
  },
  status: {
    color: colors.muted,
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: 12,
  },
  date: {
    color: colors.muted,
    fontSize: typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: typography.heading,
    fontWeight: '700',
    color: colors.text,
  },
  subline: {
    fontSize: typography.body,
    color: colors.muted,
  },
  author: {
    fontSize: typography.caption,
    color: colors.muted,
  },
  content: {
    fontSize: typography.body,
    color: colors.text,
    lineHeight: 22,
  },
  downloadContainer: {
    marginTop: spacing.sm,
  },
  downloadButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  downloadLabel: {
    color: colors.background,
    fontWeight: '700',
  },
});
