import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getEvent, getEvents, getRegistrations } from '../api/client';
import type { EventDetail, EventSummary, RegistrationSummary } from '../api/types';

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
  const queryParams = useMemo(() => {
    const params: Record<string, string | number | boolean | undefined> = {};
    if (filters.region) params.region = filters.region;
    if (filters.query) params.query = filters.query;
    if (filters.from) params.from = filters.from;
    if (filters.to) params.to = filters.to;
    if (typeof filters.lat === 'number') params.lat = filters.lat;
    if (typeof filters.lon === 'number') params.lon = filters.lon;
    if (typeof filters.online === 'boolean') params.online = filters.online;
    return params;
  }, [filters.region, filters.query, filters.from, filters.to, filters.lat, filters.lon, filters.online]);

  const key = JSON.stringify(queryParams);

  return useQuery<{ events: EventSummary[] }, Error>({
    queryKey: ['events', key],
    queryFn: () => getEvents(queryParams),
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
