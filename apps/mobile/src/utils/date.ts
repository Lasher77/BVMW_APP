import { createDateTimeFormatter } from './intl';

export function formatDateRange(startIso: string, endIso: string) {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const dateFormatter = createDateTimeFormatter({
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });
  const timeFormatter = createDateTimeFormatter({
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${dateFormatter.format(start)} · ${timeFormatter.format(start)} – ${timeFormatter.format(end)}`;
}

export function formatDate(startIso: string) {
  const date = new Date(startIso);
  return createDateTimeFormatter({
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}
