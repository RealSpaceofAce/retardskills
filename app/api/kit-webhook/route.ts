/**
 * POST /api/kit-webhook
 *
 * Receives Kit (ConvertKit) webhooks. Currently handles:
 *   - subscriber.unsubscribed → mark Convex newsletterSubscribers row as unsubscribed
 *
 * Authentication: Kit doesn't sign webhook payloads, so we authenticate
 * via a shared secret in the URL query string (?key=KIT_WEBHOOK_SECRET).
 * Configure that in Kit's webhook settings.
 *
 * Webhook payload shape (Kit v4):
 * {
 *   "event": { "name": "subscriber.unsubscribed" },
 *   "subscriber": { "id": 123, "email_address": "user@example.com", ... }
 * }
 */
import * as Sentry from '@sentry/nextjs';

import { runConvexAdminMutation } from '@/lib/convexAdmin';

export async function POST(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const expectedSecret = process.env.KIT_WEBHOOK_SECRET;
  const providedSecret = url.searchParams.get('key');

  if (!expectedSecret || providedSecret !== expectedSecret) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let payload: { event?: { name?: string }; subscriber?: { email_address?: string } };
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const eventName = payload.event?.name;
  const email = payload.subscriber?.email_address?.toLowerCase().trim();

  if (!email) {
    // Not actionable — ack so Kit doesn't keep retrying.
    return Response.json({ ok: true, ignored: 'no email in payload' });
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
      return Response.json({ ok: true, action: 'unsubscribed', email });
    }

    // Other events we just log + ack. Add more handlers as we add Kit features.
    return Response.json({ ok: true, ignored: eventName ?? 'unknown' });
  } catch (err) {
    Sentry.captureException(err, { extra: { context: 'kit webhook', eventName, email } });
    return Response.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
