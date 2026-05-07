/**
 * POST /api/signup
 *
 * Single-tap signup for the Retard Skill collection. Lead-magnet flow:
 * - Insert subscriber with source='retardskill_marketing'
 * - Mark confirmed immediately (skip double opt-in for the lead magnet)
 * - Fire welcome email with link to /retardskill/skills
 * - Return success with the redirect URL so the form can navigate the user
 *
 * Rate limit: 5/min per IP.
 */

import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';

import { checkRequestRateLimit, createRateLimitHeaders } from "@/lib/api-rate-limit";
import { runConvexAdminMutation } from "@/lib/convexAdmin";
import { sendEmail } from "@/lib/email";
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

    // Subscribe to the Retard Reports newsletter on Kit + apply signup tag.
    // Fire-and-forget — Convex stays the source of truth, Kit sync is best-effort.
    void kitSubscribeAndTag(email).catch((err) => {
      Sentry.captureException(err, { extra: { context: 'kit subscribe', email } });
    });

    const baseUrl = getBaseUrl(request);
    const sessionToken = createRetardSkillSessionToken(email);
    // Email link goes through /api/access so the cookie is set on
    // whichever device opens the email (cross-device flow).
    const emailSkillsUrl = `${baseUrl}/api/access?t=${encodeURIComponent(sessionToken)}`;

    // Welcome email — fire-and-forget on failure; subscriber row is saved either way.
    void sendEmail({
      to: email,
      subject: 'Your Retard Skills collection is ready',
      html: buildWelcomeHtml(emailSkillsUrl),
    }).catch((error) => {
      Sentry.captureException(error, { extra: { context: 'retardskill welcome email', email } });
    });

    // Set the access cookie on the signup device so the immediate redirect to
    // /retardskill/skills passes the gate.
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

function buildWelcomeHtml(skillsUrl: string): string {
  // Plain, readable, brand-consistent. Inline CSS only — email clients hate stylesheets.
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FAFAF7;color:#1A1A1A;font-family:Charter,Georgia,'Iowan Old Style',serif;font-size:17px;line-height:1.55;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAF7;padding:48px 24px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
        <tr><td>
          <p style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:11px;text-transform:uppercase;letter-spacing:0.22em;color:#4B6BFF;font-weight:700;margin:0 0 24px;">Retard Skill · You&apos;re in</p>
          <h1 style="font-family:'Source Serif 4',Charter,Georgia,serif;font-weight:700;font-size:40px;line-height:1.05;letter-spacing:-0.02em;margin:0 0 16px;color:#1A1A1A;">Your skill is ready.</h1>
          <p style="margin:0 0 24px;color:#1A1A1A;">The Marketing skill is live in your collection. Click the button below to grab it &mdash; copy to your clipboard or download the <code style="font-family:'IBM Plex Mono',monospace;font-size:0.9em;background:#E1E7FF;padding:1px 5px;border-radius:2px;">.md</code> file.</p>
          <p style="margin:0 0 32px;">
            <a href="${skillsUrl}" style="display:inline-block;background:#4B6BFF;color:#FAFAF7;text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.16em;padding:14px 28px;border:1px solid #4B6BFF;">Open your skills →</a>
          </p>
          <p style="font-family:'Source Serif 4',Charter,Georgia,serif;font-style:italic;font-size:16px;color:#4A4A48;line-height:1.55;margin:0 0 32px;border-left:2px solid #1A1A1A;padding:6px 16px;">
            Paste the skill into Claude, ChatGPT, Cursor, or Claude Code. Type your URL. About 60 seconds later, you get a polished editorial Retard Report &mdash; quote-and-fix, line by line.
          </p>
          <p style="margin:0 0 12px;color:#1A1A1A;"><strong style="font-weight:700;">Self-updating.</strong> The skill checks for the latest version every time you run it &mdash; new checks and fixes ship to your install automatically. No reinstalling.</p>
          <p style="margin:0 0 12px;color:#1A1A1A;"><strong style="font-weight:700;">More skills are coming:</strong> Goals, Pitch, Bio, Resume, Idea. They&apos;ll appear at the same link as they ship. You&apos;ll get one email each &mdash; no drip, no upsell.</p>
          <hr style="border:0;border-top:1px solid #E5E3DC;margin:48px 0 24px;">
          <p style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:13px;color:#8A8A86;line-height:1.55;margin:0;">
            Built by a founder who got tired of his own bullshit copy. <strong style="color:#1A1A1A;">&mdash; Aaron Ernst, BossMode</strong>
          </p>
          <p style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:12px;color:#8A8A86;margin:16px 0 0;">
            Brought to you by <a href="https://bossmode.ing" style="color:#1A1A1A;border-bottom:1px solid #E5E3DC;text-decoration:none;">BossMode</a> &mdash; the AI staff that runs your business while you stay the owner.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
