import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getEvent, getEvents, getRegistrations } from '../api/client.js';
import type { EventDetail, EventSummary, RegistrationSummary } from '../api/types.js';

interface EventFilters {
  region?: string;
  query?: string;
  from?: string;
  to?: string;
  lat?: number;
  lon?: number;
  online?: boolean;
}

export function useEvents(filters: EventFilters = {}) {
  const searchParams = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.region) params.set('region', filters.region);
    if (filters.query) params.set('query', filters.query);
    if (filters.from) params.set('from', filters.from);
    if (filters.to) params.set('to', filters.to);
    if (typeof filters.lat === 'number') params.set('lat', filters.lat.toString());
    if (typeof filters.lon === 'number') params.set('lon', filters.lon.toString());
    if (typeof filters.online === 'boolean') params.set('online', String(filters.online));
    return params;
  }, [filters.region, filters.query, filters.from, filters.to, filters.lat, filters.lon, filters.online]);

  const key = searchParams.toString();

  return useQuery<{ events: EventSummary[] }, Error>({
    queryKey: ['events', key],
    queryFn: () => getEvents(searchParams),
    staleTime: 1000 * 60 * 5,
  });
}

export function useEvent(id: string) {
  return useQuery<{ event: EventDetail }, Error>({
    queryKey: ['event', id],
    queryFn: () => getEvent(id),
    enabled: Boolean(id),
  });
}

export function useRegistrations(memberId: string) {
  return useQuery<{ registrations: RegistrationSummary[] }, Error>({
    queryKey: ['registrations', memberId],
    queryFn: () => getRegistrations(memberId),
    enabled: Boolean(memberId),
  });
}
