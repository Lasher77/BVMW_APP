import type { EventDetail, EventSummary, RegistrationSummary } from './types';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

function buildQueryString(params: Record<string, string | number | boolean | undefined>) {
  return Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
}

export function getEvents(params: Record<string, string | number | boolean | undefined> = {}) {
  const search = buildQueryString(params);
  return request<{ events: EventSummary[] }>(`/api/events${search ? `?${search}` : ''}`);
}

export function getEvent(id: string) {
  return request<{ event: EventDetail }>(`/api/events/${id}`);
}

export function getRegistrations(memberId: string) {
  return request<{ registrations: RegistrationSummary[] }>(
    `/api/members/${memberId}/registrations`,
  );
}
