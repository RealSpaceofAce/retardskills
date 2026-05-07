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
import { wrapEmail, p, leadP, button, pullQuote } from "@/lib/email/template";
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
  return wrapEmail({
    eyebrow: "Retard Skills · You're in",
    title: 'Your six skills are ready.',
    preheader: 'All six Retard Skills unlocked. Open your collection.',
    body: [
      p("Marketing, Wants, Pitch, Bio, Sales, Idea &mdash; all live, all yours. Click the button to open your collection. Copy each skill to your clipboard or download the <code style=\"font-family:'IBM Plex Mono',monospace;font-size:0.9em;background:#E1E7FF;padding:1px 5px;border-radius:2px;\">.md</code> file."),
      button(skillsUrl, 'Open your skills →'),
      pullQuote("Paste any skill into Claude, Claude Code, Codex, Hermes, OpenClaw, or any terminal-capable agent. Run it on your URL, plan, sales call, bio, pitch, or idea. About 60 seconds later, you get a Retard Report &mdash; quote-and-fix, line by line."),
      leadP('Self-updating.', 'Each skill checks for the latest version every run &mdash; new checks ship to your install automatically. No reinstalling, ever.'),
      leadP('Newsletter is on.', 'You&rsquo;ll get a fresh real-world audit (Retard Reports) in your inbox each week. No drip, no upsell.'),
      leadP('Lost this email later?', `Sign up again at <a href="https://retardskills.com" style="color:#1A1A1A;border-bottom:1px solid #E5E3DC;text-decoration:none;">retardskills.com</a> with the same address &mdash; we&rsquo;ll re-send the access link.`),
    ].join(''),
    closingSig: 'Built because I couldn&rsquo;t see my own bullshit. <strong style="color:#1A1A1A;">&mdash; Aaron Ernst</strong>',
    footer: 'transactional',
  });
}
