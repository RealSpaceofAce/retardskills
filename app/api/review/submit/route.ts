/**
 * POST /api/review/submit
 *
 * Public endpoint for submitting a Retard Skill review.
 * Validates input, inserts row with status='pending'. Admin approves before display.
 * Rate limit: 3/min per IP (prevents review spam).
 */

import * as Sentry from '@sentry/nextjs';

import { checkRequestRateLimit, createRateLimitHeaders } from "@/lib/api-rate-limit";
import { runConvexAdminMutation } from "@/lib/convexAdmin";
import { sendEmail } from "@/lib/email";
import { NO_STORE_HEADERS } from '@/lib/security';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ALLOWED_SKILLS = new Set(['marketing', 'goals', 'pitch', 'bio', 'resume', 'idea']);

export async function POST(request: Request): Promise<Response> {
  try {
    const rateLimitResult = await checkRequestRateLimit(request, '/api/review/submit');
    if (rateLimitResult && !rateLimitResult.allowed) {
      return Response.json(
        { error: 'Too many requests' },
        { status: 429, headers: { ...createRateLimitHeaders(rateLimitResult), ...NO_STORE_HEADERS } },
      );
    }

    const body = (await request.json()) as Record<string, unknown>;

    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const firstName = typeof body.firstName === 'string' ? body.firstName.trim().slice(0, 80) : undefined;
    const role = typeof body.role === 'string' ? body.role.trim().slice(0, 120) : undefined;
    const skill = typeof body.skill === 'string' ? body.skill.trim().toLowerCase() : '';
    const audited = typeof body.audited === 'string' ? body.audited.trim().slice(0, 500) : undefined;
    const fixed = typeof body.fixed === 'string' ? body.fixed.trim().slice(0, 1000) : undefined;
    const quote = typeof body.quote === 'string' ? body.quote.trim().slice(0, 800) : undefined;
    const recommendScore = typeof body.recommendScore === 'number' ? body.recommendScore : undefined;
    const permissionToShare = body.permissionToShare === true;

    if (!email || !EMAIL_REGEX.test(email)) {
      return Response.json({ error: 'Valid email required' }, { status: 400, headers: NO_STORE_HEADERS });
    }
    if (!skill || !ALLOWED_SKILLS.has(skill)) {
      return Response.json({ error: 'Invalid skill' }, { status: 400, headers: NO_STORE_HEADERS });
    }
    if (recommendScore !== undefined && (recommendScore < 1 || recommendScore > 10)) {
      return Response.json({ error: 'Recommend score must be 1–10' }, { status: 400, headers: NO_STORE_HEADERS });
    }

    await runConvexAdminMutation('retardSkillReviews:insertReview', {
      email,
      firstName: firstName || undefined,
      role: role || undefined,
      skill,
      audited: audited || undefined,
      fixed: fixed || undefined,
      quote: quote || undefined,
      recommendScore,
      permissionToShare,
    });

    // Notify admin a review is pending. Fire-and-forget on failure.
    void notifyAdminOfPendingReview({
      email,
      firstName,
      role,
      skill,
      audited,
      fixed,
      quote,
      recommendScore,
      permissionToShare,
    }).catch((error) => {
      Sentry.captureException(error, { extra: { context: 'retardskill review admin notification' } });
    });

    return Response.json(
      { ok: true, message: 'Thanks. Reviewed within 48 hours before going public.' },
      { headers: NO_STORE_HEADERS },
    );
  } catch (error) {
    Sentry.captureException(error, { level: 'error' });
    return Response.json({ error: 'Something went wrong. Try again.' }, { status: 400, headers: NO_STORE_HEADERS });
  }
}

type ReviewSummary = {
  email: string;
  firstName?: string;
  role?: string;
  skill: string;
  audited?: string;
  fixed?: string;
  quote?: string;
  recommendScore?: number;
  permissionToShare: boolean;
};

async function notifyAdminOfPendingReview(review: ReviewSummary) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!adminEmail) return;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://retardskills.com';
  const reviewUrl = `${baseUrl}/admin/reviews`;

  const fields: Array<[string, string | undefined]> = [
    ['From', `${review.firstName ?? '—'} (${review.email})`],
    ['Role', review.role],
    ['Skill', review.skill],
    ['What they audited', review.audited],
    ['What they fixed', review.fixed],
    ['Public quote', review.quote],
    ['Score (1-10)', review.recommendScore ? String(review.recommendScore) : undefined],
    ['Permission to share', review.permissionToShare ? 'Yes' : 'No'],
  ];

  const fieldRows = fields
    .map(([label, value]) => {
      if (!value || !value.trim()) return '';
      return `<tr><td style="padding:6px 12px 6px 0;color:#4A4A48;font-size:12px;text-transform:uppercase;letter-spacing:0.12em;font-weight:600;vertical-align:top;width:160px;">${label}</td><td style="padding:6px 0;color:#1A1A1A;font-size:15px;line-height:1.5;">${escapeHtml(value)}</td></tr>`;
    })
    .filter(Boolean)
    .join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#FAFAF7;color:#1A1A1A;font-family:'Source Serif 4',Charter,Georgia,serif;font-size:16px;line-height:1.55;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;"><tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
      <tr><td>
        <p style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:11px;text-transform:uppercase;letter-spacing:0.18em;color:#4B6BFF;font-weight:700;margin:0 0 16px;">New Retard Skill review · pending</p>
        <h1 style="font-family:'Source Serif 4',Charter,Georgia,serif;font-weight:700;font-size:32px;line-height:1.1;letter-spacing:-0.02em;margin:0 0 24px;color:#1A1A1A;">A review came in.</h1>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #1A1A1A;border-bottom:1px solid #E5E3DC;margin:0 0 24px;">
          ${fieldRows}
        </table>
        <p style="margin:0 0 24px;">
          <a href="${reviewUrl}" style="display:inline-block;background:#4B6BFF;color:#FAFAF7;text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.16em;padding:14px 28px;border:1px solid #4B6BFF;">Review and approve →</a>
        </p>
        <p style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:12px;color:#8A8A86;margin:0;">Sent automatically. Approve, reject, or edit at <a href="${reviewUrl}" style="color:#1A1A1A;">${reviewUrl}</a>.</p>
      </td></tr>
    </table>
  </td></tr></table>
</body>
</html>`;

  await sendEmail({
    to: adminEmail,
    subject: `[Retard Skill] New review — ${review.skill} from ${review.firstName ?? review.email}`,
    html,
  });
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
