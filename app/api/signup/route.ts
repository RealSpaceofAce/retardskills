/**
 * POST /api/signup
 *
 * Single-tap signup for Retard Skills. Lead-magnet flow:
 * - Insert subscriber in Convex (source='retardskill_marketing')
 * - Subscribe to Kit + tag + pass per-user welcome_link as custom field
 *   (Kit's Welcome Sequence — configured in Kit UI — fires the welcome
 *   email using {{ subscriber.fields.welcome_link }})
 * - Set the access cookie on this device for immediate redirect to /skills
 *
 * No Resend call here — Kit owns user-facing email. Resend only fires from
 * /api/review/submit for admin review notifications (you see those, users
 * never do).
 *
 * Rate limit: 5/min per IP.
 */

import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';

import { checkRequestRateLimit, createRateLimitHeaders } from "@/lib/api-rate-limit";
import { runConvexAdminMutation } from "@/lib/convexAdmin";
import { kitSubscribeAndTag } from "@/lib/kit";
import {
  RETARDSKILL_SESSION_COOKIE_NAME,
  createRetardSkillSessionToken,
  retardSkillSessionCookieOptions,
} from "@/lib/session";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getBaseUrl(request: Request): string {
  const host = request.headers.get('host') ?? 'retardskills.com';
  const proto = request.headers.get('x-forwarded-proto') ?? 'https';
  return `${proto}://${host}`;
}

export async function POST(request: Request): Promise<Response> {
  try {
    const rateLimitResult = await checkRequestRateLimit(request, '/api/signup');
    if (rateLimitResult && !rateLimitResult.allowed) {
      return Response.json(
        { error: 'Too many requests' },
        { status: 429, headers: createRateLimitHeaders(rateLimitResult) },
      );
    }

    const body = (await request.json()) as { email?: unknown };
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

    if (!email || !EMAIL_REGEX.test(email)) {
      return Response.json({ error: 'Valid email required' }, { status: 400 });
    }
    if (email.length > 254) {
      return Response.json({ error: 'Email too long (max 254 chars)' }, { status: 400 });
    }

    // Insert (idempotent) and mark confirmed in one shot — lead-magnet doesn't need double opt-in.
    await runConvexAdminMutation('newsletterSubscribers:insertPending', {
      email,
      source: 'retardskill_marketing',
    });
    await runConvexAdminMutation('newsletterSubscribers:markConfirmed', {
      email,
    });

    const baseUrl = getBaseUrl(request);
    const sessionToken = createRetardSkillSessionToken(email);
    // Cross-device welcome link — when the user clicks it from email, /api/access
    // verifies the token + sets their access cookie on whichever device opens it.
    const welcomeLink = `${baseUrl}/api/access?t=${encodeURIComponent(sessionToken)}`;

    // Subscribe to Kit + apply signup tag + pass welcome_link as a custom field.
    // Kit's Welcome Sequence (configured in Kit UI) uses
    // {{ subscriber.fields.welcome_link }} in the email body. On re-signup
    // (same email), kitSubscribeAndTag updates the field so the next welcome
    // email uses a fresh access link.
    void kitSubscribeAndTag(email, {
      fields: { welcome_link: welcomeLink },
    }).catch((err) => {
      Sentry.captureException(err, { extra: { context: 'kit subscribe', email } });
    });

    // Set the access cookie on the signup device so the immediate redirect
    // to /skills passes the gate.
    const response = NextResponse.json({
      ok: true,
      redirect: '/skills',
      message: 'Skill access granted. Email also on its way.',
    });
    response.cookies.set(RETARDSKILL_SESSION_COOKIE_NAME, sessionToken, retardSkillSessionCookieOptions);
    return response;
  } catch (error) {
    Sentry.captureException(error, { level: 'error' });
    return Response.json({ error: 'Something went wrong. Try again.' }, { status: 400 });
  }
}
