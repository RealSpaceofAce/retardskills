/**
 * POST /api/kit-webhook
 *
 * Receives Kit (ConvertKit) webhooks. Currently handles:
 *   - subscriber.unsubscribed → mark Convex newsletterSubscribers row as unsubscribed
 *
 * Authentication: Kit doesn't sign webhook payloads, so we authenticate
 * with KIT_WEBHOOK_SECRET. Prefer an Authorization: Bearer or
 * x-kit-webhook-secret header if the sender supports it; the legacy ?key=
 * query-string path remains accepted for Kit UI compatibility.
 *
 * Webhook payload shape (Kit v4):
 * {
 *   "event": { "name": "subscriber.unsubscribed" },
 *   "subscriber": { "id": 123, "email_address": "user@example.com", ... }
 * }
 */
import * as Sentry from '@sentry/nextjs';
import crypto from 'node:crypto';

import { runConvexAdminMutation } from '@/lib/convexAdmin';
import { NO_STORE_HEADERS } from '@/lib/security';

function getBearerToken(value: string | null): string | null {
  if (!value) return null;
  const [scheme, token] = value.split(' ');
  return scheme?.toLowerCase() === 'bearer' && token ? token : null;
}

function timingSafeEqualString(provided: string | null, expected: string | undefined): boolean {
  if (!provided || !expected) return false;

  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  return (
    providedBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(providedBuffer, expectedBuffer)
  );
}

export async function POST(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const expectedSecret = process.env.KIT_WEBHOOK_SECRET;
  const providedSecret =
    request.headers.get('x-kit-webhook-secret') ??
    getBearerToken(request.headers.get('authorization')) ??
    url.searchParams.get('key');

  if (!timingSafeEqualString(providedSecret, expectedSecret)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401, headers: NO_STORE_HEADERS });
  }

  let payload: { event?: { name?: string }; subscriber?: { email_address?: string } };
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400, headers: NO_STORE_HEADERS });
  }

  const eventName = payload.event?.name;
  const email = payload.subscriber?.email_address?.toLowerCase().trim();

  if (!email) {
    // Not actionable — ack so Kit doesn't keep retrying.
    return Response.json({ ok: true, ignored: 'no email in payload' }, { headers: NO_STORE_HEADERS });
  }

  try {
    // Kit normalizes the event name on its side. Accept the documented
    // variants so we don't miss firings if their schema shifts.
    const isUnsubscribe =
      eventName === 'subscriber_unsubscribe' ||
      eventName === 'subscriber.subscriber_unsubscribe' ||
      eventName === 'subscriber.unsubscribed';

    if (isUnsubscribe) {
      await runConvexAdminMutation('newsletterSubscribers:markUnsubscribed', {
        email,
      });
      return Response.json({ ok: true, action: 'unsubscribed' }, { headers: NO_STORE_HEADERS });
    }

    // Other events we just log + ack. Add more handlers as we add Kit features.
    return Response.json({ ok: true, ignored: eventName ?? 'unknown' }, { headers: NO_STORE_HEADERS });
  } catch (err) {
    Sentry.captureException(err, { extra: { context: 'kit webhook', eventName } });
    return Response.json({ error: 'Webhook handler failed' }, { status: 500, headers: NO_STORE_HEADERS });
  }
}
