import type {
  AttendeeSummary,
  ChatMessage,
  EventDetail,
  EventSummary,
  NewsArticle,
  NewsSummary,
  RegistrationSummary,
} from './types';

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

async function post<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
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

export function getEventAttendees(eventId: string) {
  return request<{ attendees: AttendeeSummary[] }>(`/api/events/${eventId}/attendees`);
}

export function getEventMessages(eventId: string, memberA: string, memberB: string) {
  const query = buildQueryString({ memberA, memberB });
  return request<{ messages: ChatMessage[] }>(`/api/events/${eventId}/messages?${query}`);
}

export function sendEventMessage(eventId: string, payload: {
  senderId: string;
  recipientId: string;
  content: string;
}) {
  return post<{ message: ChatMessage }>(`/api/events/${eventId}/messages`, payload);
}

export function getNews(params: { limit?: number } = {}) {
  const search = buildQueryString(params);
  return request<{ news: NewsSummary[] }>(`/api/news${search ? `?${search}` : ''}`);
}

export function getNewsArticle(id: string) {
  return request<{ article: NewsArticle }>(`/api/news/${id}`);
}
