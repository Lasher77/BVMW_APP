import type { FC } from 'react';
import { StyleSheet, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNews } from '../hooks/useNews';
import { NewsCard } from '../components/NewsCard';
import { colors, spacing, typography } from '../theme';
import type { AppTabParamList, HomeStackParamList } from '../navigation/types';
import { strings } from '../i18n/strings';

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList, 'NewsList'>,
  BottomTabNavigationProp<AppTabParamList>
>;

export const NewsListScreen: FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { data, isLoading, error } = useNews();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{strings.news.listTitle}</Text>
        {isLoading && <Text style={styles.status}>Lade…</Text>}
        {error && <Text style={styles.status}>Konnte News nicht laden.</Text>}
        {!isLoading && !error && (data?.news?.length ?? 0) === 0 && (
          <Text style={styles.status}>{strings.news.empty}</Text>
        )}
        {data?.news?.map((item) => (
          <NewsCard
            key={item.id}
            news={item}
            onPress={() => navigation.navigate('NewsDetail', { newsId: item.id })}
          />
        ))}
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
  },
  title: {
    fontSize: typography.heading,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  status: {
    color: colors.muted,
    marginBottom: spacing.md,
  },
});
