import 'server-only';

const DEFAULT_PUBLIC_BASE_URL = 'https://retardskills.com';
const PRODUCTION_HOSTS = new Set(['retardskills.com', 'www.retardskills.com']);
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

function normalizeBaseUrl(value: string | undefined): string | null {
  if (!value) return null;

  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    if (url.protocol === 'http:' && !LOCAL_HOSTS.has(url.hostname)) return null;
    url.pathname = '';
    url.search = '';
    url.hash = '';
    return url.toString().replace(/\/$/, '');
  } catch {
    return null;
  }
}

function getHostnameFromHostHeader(host: string): string {
  try {
    return new URL(`http://${host}`).hostname;
  } catch {
    return host.split(':')[0] ?? host;
  }
}

export function getPublicBaseUrl(request: Request): string {
  const configured = normalizeBaseUrl(process.env.NEXT_PUBLIC_BASE_URL);
  if (configured) return configured;

  const host = request.headers.get('host')?.trim().toLowerCase();
  if (!host) return DEFAULT_PUBLIC_BASE_URL;

  const hostname = getHostnameFromHostHeader(host);
  if (PRODUCTION_HOSTS.has(hostname)) return `https://${host}`;
  if (LOCAL_HOSTS.has(hostname)) return `http://${host}`;

  return DEFAULT_PUBLIC_BASE_URL;
}
