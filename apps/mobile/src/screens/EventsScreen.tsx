import type { FC } from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import { useEvents } from '../hooks/useEvents.js';
import { EventCard } from '../components/EventCard.js';
import { colors, spacing, typography } from '../theme/index.js';
import type { EventsStackParamList } from '../navigation/types.js';

const dateFilters = [
  { key: 'all', label: 'Alle' },
  { key: 'upcoming', label: 'Ab heute' },
  { key: 'month', label: 'Dieser Monat' },
] as const;

type DateFilterKey = (typeof dateFilters)[number]['key'];

export const EventsScreen: FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<EventsStackParamList>>();
  const [region, setRegion] = useState('');
  const [query, setQuery] = useState('');
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateFilterKey>('upcoming');
  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== Location.PermissionStatus.GRANTED) {
          return;
        }
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (!cancelled) {
          setCoordinates({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        }
      } catch {
        // ignore permission/location errors and fall back to region-only filtering
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filterParams = useMemo(() => {
    const now = new Date();
    const params: {
      region?: string;
      query?: string;
      online?: boolean;
      from?: string;
      to?: string;
      lat?: number;
      lon?: number;
    } = {};
    if (region.trim()) params.region = region.trim();
    if (query.trim()) params.query = query.trim();
    if (onlineOnly) params.online = true;
    if (dateFilter === 'upcoming') {
      params.from = now.toISOString();
    } else if (dateFilter === 'month') {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      params.from = monthStart.toISOString();
      params.to = monthEnd.toISOString();
    }
    if (coordinates) {
      params.lat = coordinates.lat;
      params.lon = coordinates.lon;
    }
    return params;
  }, [region, query, onlineOnly, dateFilter, coordinates]);

  const { data, isLoading, refetch, isRefetching } = useEvents(filterParams);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={data?.events ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <EventCard
            event={item}
            onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
          />
        )}
        ListHeaderComponent={
          <View style={styles.filters}>
            <Text style={styles.title}>Veranstaltungen</Text>
            <TextInput
              style={styles.input}
              placeholder="Suche"
              value={query}
              onChangeText={setQuery}
              accessibilityLabel="Suche"
            />
            <TextInput
              style={styles.input}
              placeholder="Region (z. B. Berlin)"
              value={region}
              onChangeText={setRegion}
              accessibilityLabel="Region"
            />
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Nur Online</Text>
              <Switch value={onlineOnly} onValueChange={setOnlineOnly} thumbColor={colors.primary} />
            </View>
            <View style={styles.dateFilters}>
              {dateFilters.map((filter) => (
                <TouchableOpacity
                  key={filter.key}
                  style={[
                    styles.dateChip,
                    dateFilter === filter.key && styles.dateChipActive,
                  ]}
                  onPress={() => setDateFilter(filter.key)}
                >
                  <Text
                    style={[
                      styles.dateChipLabel,
                      dateFilter === filter.key && styles.dateChipLabelActive,
                    ]}
                  >
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator color={colors.primary} style={styles.loader} />
          ) : (
            <Text style={styles.empty}>Keine Events gefunden.</Text>
          )
        }
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[colors.primary]} />
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
  listContent: {
    padding: spacing.lg,
  },
  filters: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.heading,
    fontWeight: '700',
    color: colors.text,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.md,
    borderColor: colors.border,
    borderWidth: 1,
    fontSize: typography.body,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: typography.body,
    color: colors.text,
  },
  dateFilters: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dateChip: {
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dateChipLabel: {
    color: colors.text,
    fontSize: typography.caption,
  },
  dateChipLabelActive: {
    color: colors.background,
    fontWeight: '600',
  },
  loader: {
    marginTop: spacing.lg,
  },
  empty: {
    textAlign: 'center',
    color: colors.muted,
    marginTop: spacing.lg,
  },
});
