import 'server-only';

export const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, max-age=0',
} as const;

const CONTROL_CHARACTERS = /[\u0000-\u001F\u007F]/;

export function getSafeRedirectPath(value: unknown, fallback = '/admin/reviews'): string {
  if (typeof value !== 'string') return fallback;

  const path = value.trim();
  if (
    !path.startsWith('/') ||
    path.startsWith('//') ||
    path.includes('\\') ||
    CONTROL_CHARACTERS.test(path)
  ) {
    return fallback;
  }

  return path;
}

export function withNoStore<T extends Response>(response: T): T {
  response.headers.set('Cache-Control', NO_STORE_HEADERS['Cache-Control']);
  return response;
}
