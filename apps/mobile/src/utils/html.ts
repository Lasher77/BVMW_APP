export function stripHtml(input: string | null | undefined) {
  if (!input) return '';
  return input.replace(/<[^>]+>/g, '').trim();
}
