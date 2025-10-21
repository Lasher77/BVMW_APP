import type { FC } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRegistrations } from '../hooks/useEvents';
import { TicketCard } from '../components/TicketCard';
import { colors, spacing, typography } from '../theme';

const memberId = process.env.EXPO_PUBLIC_MEMBER_ID ?? '003TEST0001';

export const TicketsScreen: FC = () => {
  const { data, isLoading } = useRegistrations(memberId);

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
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
});
