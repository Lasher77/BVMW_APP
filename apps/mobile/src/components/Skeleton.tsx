import type { FC } from 'react';
import { useEffect, useRef, useMemo } from 'react';
import { Animated, StyleSheet, View, type ViewStyle, type DimensionValue } from 'react-native';
import { radii, spacing, typography } from '../theme';
import { useColors } from '../theme/ThemeContext';

type SkeletonProps = {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
};

export const Skeleton: FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const colors = useColors();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const skeletonStyle = useMemo(
    () => ({
      width,
      height,
      borderRadius,
      backgroundColor: colors.border,
    }),
    [width, height, borderRadius, colors.border]
  );

  return (
    <Animated.View
      style={[skeletonStyle, { opacity }, style]}
    />
  );
};

export const EventCardSkeleton: FC = () => {
  const colors = useColors();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          backgroundColor: colors.card,
          borderRadius: radii.md,
          overflow: 'hidden',
          marginBottom: spacing.lg,
        },
        image: {
          width: '100%',
          height: 160,
          backgroundColor: colors.border,
        },
        content: {
          padding: spacing.md,
          gap: spacing.sm,
        },
        row: {
          flexDirection: 'row',
          justifyContent: 'space-between',
        },
        tags: {
          flexDirection: 'row',
          gap: spacing.xs,
        },
      }),
    [colors]
  );

  return (
    <View style={styles.card}>
      <Skeleton width="100%" height={160} borderRadius={0} />
      <View style={styles.content}>
        <Skeleton width={120} height={typography.caption} />
        <Skeleton width="80%" height={typography.subheading} />
        <View style={styles.row}>
          <Skeleton width={100} height={typography.caption} />
          <Skeleton width={80} height={typography.caption} />
        </View>
        <View style={styles.tags}>
          <Skeleton width={60} height={24} borderRadius={radii.sm} />
          <Skeleton width={80} height={24} borderRadius={radii.sm} />
        </View>
      </View>
    </View>
  );
};

export const NewsCardSkeleton: FC = () => {
  const colors = useColors();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          backgroundColor: colors.card,
          borderRadius: radii.md,
          overflow: 'hidden',
          marginBottom: spacing.lg,
        },
        content: {
          padding: spacing.md,
          gap: spacing.xs,
        },
      }),
    [colors]
  );

  return (
    <View style={styles.card}>
      <Skeleton width="100%" height={160} borderRadius={0} />
      <View style={styles.content}>
        <Skeleton width={100} height={typography.caption} />
        <Skeleton width="90%" height={typography.subheading} />
        <Skeleton width="60%" height={typography.body} />
      </View>
    </View>
  );
};

export const TicketCardSkeleton: FC = () => {
  const colors = useColors();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          backgroundColor: colors.card,
          borderRadius: radii.md,
          padding: spacing.lg,
          gap: spacing.sm,
          marginBottom: spacing.lg,
        },
        row: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        },
        qrContainer: {
          alignItems: 'center',
          marginTop: spacing.md,
        },
      }),
    [colors]
  );

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Skeleton width="60%" height={typography.subheading} />
        <Skeleton width={80} height={28} borderRadius={999} />
      </View>
      <Skeleton width={120} height={typography.caption} />
      <Skeleton width={100} height={typography.caption} />
      <View style={styles.qrContainer}>
        <Skeleton width={120} height={120} borderRadius={8} />
      </View>
    </View>
  );
};

export const TextLineSkeleton: FC<{ width?: DimensionValue }> = ({ width = '100%' }) => (
  <Skeleton width={width} height={typography.body} style={{ marginBottom: spacing.xs }} />
);

export const ListSkeleton: FC<{ count?: number; ItemComponent: FC }> = ({
  count = 3,
  ItemComponent,
}) => (
  <>
    {Array.from({ length: count }).map((_, index) => (
      <ItemComponent key={index} />
    ))}
  </>
);
