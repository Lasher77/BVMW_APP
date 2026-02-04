import type { FC } from 'react';
import { memo, useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { spacing } from '../theme';
import { useColors } from '../theme/ThemeContext';

interface QuickAction {
  id: string;
  icon: string;
  label: string;
  onPress: () => void;
}

interface QuickActionsProps {
  actions: QuickAction[];
}

const QuickActionsComponent: FC<QuickActionsProps> = ({ actions }) => {
  const colors = useColors();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          paddingHorizontal: spacing.lg,
        },
        scrollContent: {
          gap: spacing.md,
          paddingRight: spacing.lg,
        },
        actionButton: {
          alignItems: 'center',
          justifyContent: 'center',
          width: 76,
          height: 84,
          backgroundColor: colors.card,
          borderRadius: 16,
          shadowColor: colors.shadow,
          shadowOpacity: 0.08,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: 2,
        },
        iconContainer: {
          width: 44,
          height: 44,
          borderRadius: 12,
          backgroundColor: colors.surfaceHighlight,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: spacing.xs,
        },
        icon: {
          fontSize: 22,
        },
        label: {
          fontSize: 12,
          fontWeight: '600',
          color: colors.text,
          textAlign: 'center',
        },
      }),
    [colors]
  );

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {actions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={styles.actionButton}
            onPress={action.onPress}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>{action.icon}</Text>
            </View>
            <Text style={styles.label}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export const QuickActions = memo(QuickActionsComponent);
