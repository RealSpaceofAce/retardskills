import 'server-only';

import crypto from 'node:crypto';

import { requireEnv } from './env';

export const ADMIN_SESSION_COOKIE_NAME = 'bossmode_admin_session';
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;

function sha256(value: string) {
  return crypto.createHash('sha256').update(value).digest();
}

function sign(value: string) {
  return crypto
    .createHmac('sha256', requireEnv('ADMIN_SESSION_SECRET'))
    .update(value)
    .digest('base64url');
}

export function isValidAdminPassword(password: string) {
  const provided = sha256(password);
  const expected = sha256(requireEnv('ADMIN_PASSWORD'));
  return crypto.timingSafeEqual(provided, expected);
}

export function createAdminSessionToken() {
  const expiresAt = Date.now() + ADMIN_SESSION_MAX_AGE_SECONDS * 1000;
  const payload = Buffer.from(JSON.stringify({ expiresAt })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function verifyAdminSessionToken(token?: string | null) {
  if (!token) {
    return false;
  }

  const [payload, signature] = token.split('.');
  if (!payload || !signature) {
    return false;
  }

  const expectedSignature = sign(payload);
  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  if (!crypto.timingSafeEqual(providedBuffer, expectedBuffer)) {
    return false;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      expiresAt?: number;
    };
    return typeof parsed.expiresAt === 'number' && parsed.expiresAt > Date.now();
  } catch {
    return false;
  }
}

// Security audit M-2: SameSite=strict tightens admin cookie scope.
// Admin users always reach the panel from the BossMode domain itself,
// never via cross-origin links — so strict has no UX cost and removes
// the cookie from any cross-origin top-level navigation.
export const adminSessionCookieOptions = {
  httpOnly: true,
  maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  path: '/',
  sameSite: 'strict' as const,
  secure: process.env.NODE_ENV === 'production',
};

// ---------------------------------------------------------------------------
// Local-daemon session — set when the CLI performs the OTT handoff.
// This cookie grants a 24-hour trusted local session (no password required)
// because the daemon token proves the request originated from the same machine.
// ---------------------------------------------------------------------------

export const LOCAL_SESSION_COOKIE_NAME = 'bossmode_local_session';
export const LOCAL_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24; // 24 h

export function createLocalSessionToken() {
  const expiresAt = Date.now() + LOCAL_SESSION_MAX_AGE_SECONDS * 1000;
  const payload = Buffer.from(JSON.stringify({ expiresAt, local: true })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function verifyLocalSessionToken(token?: string | null): boolean {
  if (!token) return false;

  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;

  const expectedSignature = sign(payload);
  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (providedBuffer.length !== expectedBuffer.length) return false;
  if (!crypto.timingSafeEqual(providedBuffer, expectedBuffer)) return false;

  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      expiresAt?: number;
      local?: boolean;
    };
    return parsed.local === true && typeof parsed.expiresAt === 'number' && parsed.expiresAt > Date.now();
  } catch {
    return false;
  }
}

export const localSessionCookieOptions = {
  httpOnly: true,
  maxAge: LOCAL_SESSION_MAX_AGE_SECONDS,
  path: '/',
  sameSite: 'lax' as const, // lax so the redirect from /local/enter sets it correctly
  secure: false, // always 127.0.0.1 in local mode, never https
};
