import type { FC } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme/index.js';

const memberId = process.env.EXPO_PUBLIC_MEMBER_ID ?? '003TEST0001';
const memberType = memberId.startsWith('003') ? 'Kontakt' : 'Lead';

export const ProfileScreen: FC = () => {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.title}>Profil</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Mitgliedstyp</Text>
          <Text style={styles.value}>{memberType}</Text>
          <Text style={styles.label}>Salesforce ID</Text>
          <Text style={styles.value}>{memberId}</Text>
          <Text style={styles.helper}>
            Änderungen an deinem Profil sind bald möglich. Bitte kontaktiere deine Geschäftsstelle
            für Aktualisierungen.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  container: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  title: {
    fontSize: typography.heading,
    fontWeight: '700',
    color: colors.text,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: spacing.lg,
    gap: spacing.sm,
    shadowColor: '#0000001A',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  label: {
    fontSize: typography.caption,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  value: {
    fontSize: typography.subheading,
    color: colors.text,
    fontWeight: '600',
  },
  helper: {
    marginTop: spacing.md,
    fontSize: typography.caption,
    color: colors.muted,
  },
});
