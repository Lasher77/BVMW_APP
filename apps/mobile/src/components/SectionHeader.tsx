import type { FC, ReactNode } from 'react';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { spacing, typography } from '../theme';
import { useColors } from '../theme/ThemeContext';

type Props = {
  title: string;
  action?: ReactNode;
};

export const SectionHeader: FC<Props> = ({ title, action }) => {
  const colors = useColors();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: spacing.sm,
        },
        title: {
          fontSize: typography.heading,
          fontWeight: '700',
          color: colors.text,
        },
      }),
    [colors]
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {action}
    </View>
  );
};
