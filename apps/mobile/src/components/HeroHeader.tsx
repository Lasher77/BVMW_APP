import type { FC } from 'react';
import { memo, useMemo } from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { spacing, typography } from '../theme';
import { useColors } from '../theme/ThemeContext';
import MittelstandLogo from '../assets/Logo-Der-Mittelstand.png';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Guten Morgen';
  if (hour < 18) return 'Guten Tag';
  return 'Guten Abend';
}

interface HeroHeaderProps {
  userName?: string;
}

const HeroHeaderComponent: FC<HeroHeaderProps> = ({ userName }) => {
  const colors = useColors();
  const greeting = getGreeting();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          borderRadius: 24,
          overflow: 'hidden',
          marginHorizontal: spacing.lg,
          marginTop: spacing.md,
        },
        gradient: {
          paddingHorizontal: spacing.xl,
          paddingVertical: spacing.xl,
          paddingBottom: spacing.lg,
        },
        content: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        },
        textContainer: {
          flex: 1,
        },
        greeting: {
          fontSize: 32,
          fontWeight: '700',
          color: '#FFFFFF',
          letterSpacing: -0.5,
        },
        userName: {
          fontSize: 32,
          fontWeight: '700',
          color: '#FFFFFF',
          letterSpacing: -0.5,
          opacity: 0.9,
        },
        subtitle: {
          fontSize: typography.body,
          color: 'rgba(255, 255, 255, 0.8)',
          marginTop: spacing.xs,
        },
        logoContainer: {
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          borderRadius: 16,
          padding: spacing.sm,
        },
        logo: {
          width: 44,
          height: 44,
        },
      }),
    [colors]
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.textContainer}>
            <Text style={styles.greeting}>{greeting}</Text>
            {userName && <Text style={styles.userName}>{userName}</Text>}
            <Text style={styles.subtitle}>Willkommen bei BVMW</Text>
          </View>
          <View style={styles.logoContainer}>
            <Image source={MittelstandLogo} style={styles.logo} resizeMode="contain" />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

export const HeroHeader = memo(HeroHeaderComponent);
