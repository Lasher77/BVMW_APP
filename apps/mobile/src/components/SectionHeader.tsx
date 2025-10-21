import type { FC, ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme';

type Props = {
  title: string;
  action?: ReactNode;
};

export const SectionHeader: FC<Props> = ({ title, action }) => (
  <View style={styles.container}>
    <Text style={styles.title}>{title}</Text>
    {action}
  </View>
);

const styles = StyleSheet.create({
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
});
