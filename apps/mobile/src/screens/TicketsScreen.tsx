import type { FC } from 'react';
import { useMemo } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRegistrations } from '../hooks/useEvents';
import { TicketCard } from '../components/TicketCard';
import { spacing, typography } from '../theme';
import { useColors } from '../theme/ThemeContext';
import { currentMemberId } from '../config/member';

export const TicketsScreen: FC = () => {
  const colors = useColors();
  const { data, isLoading, refetch, isRefetching } = useRegistrations(currentMemberId);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        safe: {
          flex: 1,
          backgroundColor: colors.surface,
        },
        content: {
          padding: spacing.lg,
          gap: spacing.lg,
        },
        title: {
          fontSize: typography.heading,
          fontWeight: '700',
          marginBottom: spacing.md,
          color: colors.text,
        },
        loader: {
          marginTop: spacing.lg,
        },
        empty: {
          marginTop: spacing.lg,
          color: colors.muted,
          textAlign: 'center',
        },
      }),
    [colors]
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={data?.registrations ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={<Text style={styles.title}>Meine Tickets</Text>}
        renderItem={({ item }) => <TicketCard registration={item} />}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator color={colors.primary} style={styles.loader} />
          ) : (
            <Text style={styles.empty}>Keine Tickets vorhanden.</Text>
          )
        }
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[colors.primary]} />
        }
      />
    </SafeAreaView>
  );
};
