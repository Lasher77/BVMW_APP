import createDOMPurify from 'isomorphic-dompurify';
import { JSDOM } from 'jsdom';

const { window } = new JSDOM('');
const create = createDOMPurify as unknown as (win: typeof globalThis) => {
  sanitize: (dirty: string, config?: unknown) => string;
};
const DOMPurify = create(window as unknown as typeof globalThis);

export function sanitizeHtml(input: string | null | undefined) {
  if (!input) {
    return null;
  }
  return DOMPurify.sanitize(input, { USE_PROFILES: { html: true } });
}
