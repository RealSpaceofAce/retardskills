import 'server-only';

import crypto from 'node:crypto';

import { requireEnv } from './env';

export const RETARDSKILL_SESSION_COOKIE_NAME = 'bossmode_retardskill_session';
export const RETARDSKILL_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 90; // 90 days
const RETARDSKILL_SESSION_SCOPE = 'retardskill-access';

function sign(value: string): string {
  return crypto
    .createHmac('sha256', requireEnv('ADMIN_SESSION_SECRET'))
    .update(value)
    .digest('base64url');
}

export function createRetardSkillSessionToken(): string {
  const expiresAt = Date.now() + RETARDSKILL_SESSION_MAX_AGE_SECONDS * 1000;
  const payload = Buffer.from(
    JSON.stringify({
      scope: RETARDSKILL_SESSION_SCOPE,
      expiresAt,
      nonce: crypto.randomUUID(),
    }),
  ).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function verifyRetardSkillSessionToken(
  token?: string | null,
): { email?: string } | null {
  if (!token) return null;

  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;

  const expected = sign(payload);
  const provided = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);

  if (provided.length !== expectedBuf.length) return null;
  if (!crypto.timingSafeEqual(provided, expectedBuf)) return null;

  try {
    const parsed = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf8'),
    ) as { email?: unknown; expiresAt?: unknown; scope?: unknown };

    if (typeof parsed.expiresAt !== 'number' || parsed.expiresAt < Date.now()) return null;
    if (parsed.scope === RETARDSKILL_SESSION_SCOPE) return {};

    // Backward compatibility for previously issued signed links. New tokens no
    // longer include email addresses, so links copied into logs or email tools
    // do not disclose subscriber PII when decoded.
    if (typeof parsed.email !== 'string') return null;
    return { email: parsed.email };
  } catch {
    return null;
  }
}

export const retardSkillSessionCookieOptions = {
  httpOnly: true,
  maxAge: RETARDSKILL_SESSION_MAX_AGE_SECONDS,
  path: '/',
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
};
