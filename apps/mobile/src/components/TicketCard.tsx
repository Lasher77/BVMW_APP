import type { FC } from 'react';
import { memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import type { RegistrationSummary } from '../api/types';
import { radii, spacing, typography } from '../theme';
import { useColors } from '../theme/ThemeContext';
import { formatDate } from '../utils/date';

const statusLabels: Record<RegistrationSummary['status'], string> = {
  registered: 'Angemeldet',
  pending: 'Ausstehend',
  rejected: 'Abgelehnt',
  cancelled: 'Storniert',
  attended: 'Teilgenommen',
};

type Props = {
  registration: RegistrationSummary;
};

const TicketCardComponent: FC<Props> = ({ registration }) => {
  const colors = useColors();
  const qrValue = JSON.stringify({
    registrationId: registration.id,
    eventId: registration.event.id,
    issuedAt: Date.now(),
  });

  const statusColors: Record<RegistrationSummary['status'], string> = useMemo(
    () => ({
      registered: colors.primary,
      pending: colors.warning,
      rejected: colors.error,
      cancelled: colors.muted,
      attended: colors.success,
    }),
    [colors]
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          backgroundColor: colors.card,
          borderRadius: radii.md,
          padding: spacing.lg,
          gap: spacing.sm,
          marginBottom: spacing.lg,
          shadowColor: colors.shadow,
          shadowOpacity: 0.1,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
          elevation: 2,
        },
        headerRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: spacing.sm,
        },
        title: {
          flex: 1,
          fontSize: typography.subheading,
          fontWeight: '600',
          color: colors.text,
        },
        date: {
          color: colors.muted,
          fontSize: typography.caption,
        },
        meta: {
          color: colors.muted,
          fontSize: typography.caption,
        },
        badge: {
          borderRadius: 999,
          paddingHorizontal: spacing.sm,
          paddingVertical: 4,
        },
        badgeText: {
          color: '#FFFFFF',
          fontSize: typography.caption,
          fontWeight: '600',
        },
        qrContainer: {
          alignItems: 'center',
          marginTop: spacing.md,
        },
      }),
    [colors]
  );

  return (
    <View style={styles.card} accessible accessibilityRole="summary">
      <View style={styles.headerRow}>
        <Text style={styles.title}>{registration.event.title}</Text>
        <View style={[styles.badge, { backgroundColor: statusColors[registration.status] }]}>
          <Text style={styles.badgeText}>{statusLabels[registration.status]}</Text>
        </View>
      </View>
      <Text style={styles.date}>{formatDate(registration.event.start)}</Text>
      <Text style={styles.meta}>{registration.event.city ?? 'Online/Ort folgt'}</Text>
      {registration.checkInAt && (
        <Text style={styles.meta}>{`Check-in: ${formatDate(registration.checkInAt)}`}</Text>
      )}
      <View style={styles.qrContainer}>
        <QRCode value={qrValue} size={120} color={colors.primary} backgroundColor={colors.card} />
      </View>
    </View>
  );
};

export const TicketCard = memo(TicketCardComponent);
