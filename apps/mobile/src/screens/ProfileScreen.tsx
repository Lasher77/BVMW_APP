import type { FC } from 'react';
import { useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { spacing, typography } from '../theme';
import { useTheme, useColors } from '../theme/ThemeContext';
import { currentMemberId } from '../config/member';
import type { ThemeMode } from '../theme';

const memberType = currentMemberId.startsWith('003') ? 'Kontakt' : 'Lead';

const themeModeLabels: Record<ThemeMode, string> = {
  light: 'Hell',
  dark: 'Dunkel',
  system: 'System',
};

export const ProfileScreen: FC = () => {
  const colors = useColors();
  const { themeMode, setThemeMode } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
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
          backgroundColor: colors.card,
          borderRadius: 16,
          padding: spacing.lg,
          gap: spacing.sm,
          shadowColor: colors.shadow,
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
        themeSection: {
          marginTop: spacing.md,
        },
        themeButtons: {
          flexDirection: 'row',
          gap: spacing.sm,
          marginTop: spacing.sm,
        },
        themeButton: {
          flex: 1,
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: colors.border,
          alignItems: 'center',
        },
        themeButtonActive: {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
        },
        themeButtonText: {
          fontSize: typography.caption,
          color: colors.text,
          fontWeight: '500',
        },
        themeButtonTextActive: {
          color: '#FFFFFF',
        },
      }),
    [colors]
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.title}>Profil</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Mitgliedstyp</Text>
          <Text style={styles.value}>{memberType}</Text>
          <Text style={styles.label}>Salesforce ID</Text>
          <Text style={styles.value}>{currentMemberId}</Text>
          <Text style={styles.helper}>
            Änderungen an deinem Profil sind bald möglich. Bitte kontaktiere deine Geschäftsstelle
            für Aktualisierungen.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Erscheinungsbild</Text>
          <View style={styles.themeButtons}>
            {(['light', 'dark', 'system'] as const).map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[styles.themeButton, themeMode === mode && styles.themeButtonActive]}
                onPress={() => setThemeMode(mode)}
                accessibilityRole="button"
                accessibilityState={{ selected: themeMode === mode }}
              >
                <Text
                  style={[styles.themeButtonText, themeMode === mode && styles.themeButtonTextActive]}
                >
                  {themeModeLabels[mode]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};
