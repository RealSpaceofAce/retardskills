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
import { getPublicBaseUrl } from '@/lib/public-url';
import { NO_STORE_HEADERS, withNoStore } from '@/lib/security';
import {
  RETARDSKILL_SESSION_COOKIE_NAME,
  createRetardSkillSessionToken,
  retardSkillSessionCookieOptions,
} from "@/lib/session";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ResponseMode = 'json' | 'html';

type SignupSubmission = {
  email: string;
  responseMode: ResponseMode;
};

function contentTypeIncludes(request: Request, value: string): boolean {
  return request.headers.get('content-type')?.toLowerCase().includes(value) ?? false;
}

function acceptsHtml(request: Request): boolean {
  const accept = request.headers.get('accept')?.toLowerCase() ?? '';
  return accept.includes('text/html') && !accept.includes('application/json');
}

function getResponseMode(request: Request): ResponseMode {
  // Browser-native form submissions must work even when hydration/client JS fails.
  // The React client path still sends JSON and gets JSON back for inline status UI.
  if (
    contentTypeIncludes(request, 'application/x-www-form-urlencoded') ||
    contentTypeIncludes(request, 'multipart/form-data') ||
    acceptsHtml(request)
  ) {
    return 'html';
  }
  return 'json';
}

async function readSignupSubmission(request: Request): Promise<SignupSubmission> {
  const responseMode = getResponseMode(request);

  if (contentTypeIncludes(request, 'application/x-www-form-urlencoded') || contentTypeIncludes(request, 'multipart/form-data')) {
    const formData = await request.formData();
    const emailValue = formData.get('email');
    return {
      email: typeof emailValue === 'string' ? emailValue.trim().toLowerCase() : '',
      responseMode,
    };
  }

  if (contentTypeIncludes(request, 'application/json')) {
    const body = (await request.json().catch(() => null)) as { email?: unknown } | null;
    return {
      email: typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '',
      responseMode,
    };
  }

  return { email: '', responseMode };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function htmlMessageResponse(
  title: string,
  message: string,
  status: number,
  headers: HeadersInit = {},
): Response {
  const safeTitle = escapeHtml(title);
  const safeMessage = escapeHtml(message);
  return new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${safeTitle}</title><style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#FAFAF7;color:#1A1A1A;min-height:100vh;display:grid;place-items:center;margin:0;padding:24px}.card{max-width:560px;border:1px solid #1A1A1A;background:#fff;padding:32px;text-align:center}h1{font-size:24px;margin:0 0 12px}p{line-height:1.5}a{color:#4B6BFF;font-weight:700}</style></head><body><main class="card"><h1>${safeTitle}</h1><p>${safeMessage}</p><p><a href="/#rs-form-block">Back to the signup form</a></p></main></body></html>`,
    {
      status,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        ...NO_STORE_HEADERS,
        ...headers,
      },
    },
  );
}

function errorResponse(message: string, status: number, responseMode: ResponseMode): Response {
  if (responseMode === 'html') {
    return htmlMessageResponse('Signup failed', message, status);
  }

  return Response.json(
    { error: message },
    { status, headers: NO_STORE_HEADERS },
  );
}

function successResponse(request: Request, sessionToken: string, responseMode: ResponseMode): Response {
  const response = responseMode === 'html'
    ? NextResponse.redirect(new URL('/skills', request.url), { status: 303 })
    : NextResponse.json({
        ok: true,
        redirect: '/skills',
        message: 'Skill access granted. Email also on its way.',
      });

  response.cookies.set(RETARDSKILL_SESSION_COOKIE_NAME, sessionToken, retardSkillSessionCookieOptions);
  return withNoStore(response);
}

export async function POST(request: Request): Promise<Response> {
  const responseMode = getResponseMode(request);

  try {
    const rateLimitResult = await checkRequestRateLimit(request, '/api/signup');
    if (rateLimitResult && !rateLimitResult.allowed) {
      const headers = { ...createRateLimitHeaders(rateLimitResult), ...NO_STORE_HEADERS };
      if (responseMode === 'html') {
        return htmlMessageResponse(
          'Too many requests',
          'Too many signup attempts. Wait a minute and try again.',
          429,
          headers,
        );
      }
      return Response.json(
        { error: 'Too many requests' },
        { status: 429, headers },
      );
    }

    const submission = await readSignupSubmission(request);
    const email = submission.email;

    if (!email || !EMAIL_REGEX.test(email)) {
      return errorResponse('Valid email required', 400, submission.responseMode);
    }
    if (email.length > 254) {
      return errorResponse('Email too long (max 254 chars)', 400, submission.responseMode);
    }

    // Insert (idempotent) and mark confirmed in one shot — lead-magnet doesn't need double opt-in.
    await runConvexAdminMutation('newsletterSubscribers:insertPending', {
      email,
      source: 'retardskill_marketing',
    });
    await runConvexAdminMutation('newsletterSubscribers:markConfirmed', {
      email,
    });

    const baseUrl = getPublicBaseUrl(request);
    const sessionToken = createRetardSkillSessionToken();
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
      Sentry.captureException(err, { extra: { context: 'kit subscribe' } });
    });

    // Set the access cookie on the signup device so the immediate redirect
    // to /skills passes the gate. Browser-native form posts get a 303 so the
    // flow works without client JavaScript; the hydrated client gets JSON.
    return successResponse(request, sessionToken, submission.responseMode);
  } catch (error) {
    Sentry.captureException(error, { level: 'error' });
    return errorResponse('Something went wrong. Try again.', 400, responseMode);
  }
}
