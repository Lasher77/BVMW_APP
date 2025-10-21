import type { EventDetail, EventSummary, RegistrationSummary } from './types.js';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function getEvents(params: URLSearchParams = new URLSearchParams()) {
  const search = params.toString();
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
