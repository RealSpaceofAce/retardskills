/**
 * Unified email template for Retard Skills emails.
 *
 * One shell for every transactional + marketing email — same eyebrow,
 * same Source Serif body, same BossMode blue accent, same footer with
 * BossMode bridge + unsubscribe placeholder.
 *
 * Inline CSS only (most email clients ignore <style> tags). Table-based
 * layout (flexbox/grid don't render in Outlook). No JS.
 */

type WrapOptions = {
  /** Eyebrow line at top of email (e.g., "RETARD REPORTS · ISSUE 12"). */
  eyebrow: string;
  /** Title (h1). */
  title: string;
  /** HTML body content. Use the helper components below for consistency. */
  body: string;
  /** Optional pre-header text — first thing the inbox previews. */
  preheader?: string;
  /** Footer mode: 'transactional' (welcome, etc.) or 'newsletter' (with unsub). */
  footer?: 'transactional' | 'newsletter';
  /** Personal closing sig from the founder. Defaults to standard. */
  closingSig?: string;
};

/**
 * Wrap content in the branded email shell.
 */
export function wrapEmail({
  eyebrow,
  title,
  body,
  preheader,
  footer = 'transactional',
  closingSig,
}: WrapOptions): string {
  const sigBlock = closingSig
    ? `<p style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:13px;color:#4A4A48;line-height:1.55;margin:32px 0 0;">${closingSig}</p>`
    : '';

  const footerBlock = footer === 'newsletter'
    ? newsletterFooter()
    : transactionalFooter();

  const preheaderBlock = preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#FAFAF7;">${escapeHtml(preheader)}</div>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:#FAFAF7;color:#1A1A1A;font-family:Charter,Georgia,'Iowan Old Style',serif;font-size:17px;line-height:1.55;-webkit-font-smoothing:antialiased;">
  ${preheaderBlock}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAF7;padding:48px 24px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
        <tr><td>
          <p style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:11px;text-transform:uppercase;letter-spacing:0.22em;color:#4B6BFF;font-weight:700;margin:0 0 28px;">${escapeHtml(eyebrow)}</p>
          <h1 style="font-family:'Source Serif 4',Charter,Georgia,serif;font-weight:700;font-size:36px;line-height:1.05;letter-spacing:-0.02em;margin:0 0 24px;color:#1A1A1A;">${title}</h1>
          ${body}
          ${sigBlock}
          <hr style="border:0;border-top:1px solid #E5E3DC;margin:48px 0 24px;">
          ${footerBlock}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/* -----------------------------------------------------------------------
   Components — drop into the `body` field of wrapEmail()
   --------------------------------------------------------------------- */

/** Standard paragraph — use this for body copy. */
export function p(html: string): string {
  return `<p style="margin:0 0 18px;color:#1A1A1A;">${html}</p>`;
}

/** Bold lead-in line + body in the same paragraph. */
export function leadP(lead: string, rest: string): string {
  return `<p style="margin:0 0 18px;color:#1A1A1A;"><strong style="font-weight:700;">${escapeHtml(lead)}</strong> ${rest}</p>`;
}

/** BossMode blue CTA button. */
export function button(href: string, label: string): string {
  return `<p style="margin:8px 0 32px;">
    <a href="${escapeAttr(href)}" style="display:inline-block;background:#4B6BFF;color:#FAFAF7;text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.16em;padding:14px 28px;border:1px solid #4B6BFF;">${escapeHtml(label)}</a>
  </p>`;
}

/** Italic pull-quote with ink left-border. */
export function pullQuote(text: string): string {
  return `<p style="font-family:'Source Serif 4',Charter,Georgia,serif;font-style:italic;font-size:17px;color:#4A4A48;line-height:1.5;margin:0 0 28px;border-left:2px solid #1A1A1A;padding:6px 18px;">${text}</p>`;
}

/** Hairline divider for separating sections inside the body. */
export function divider(): string {
  return `<hr style="border:0;border-top:1px solid #E5E3DC;margin:32px 0;">`;
}

/** Inline mono code style for short tokens (skill IDs, URLs, etc.). */
export function code(text: string): string {
  return `<code style="font-family:'IBM Plex Mono',monospace;font-size:0.9em;background:#E1E7FF;padding:1px 5px;border-radius:2px;color:#1A1A1A;">${escapeHtml(text)}</code>`;
}

/* -----------------------------------------------------------------------
   Footers
   --------------------------------------------------------------------- */

function transactionalFooter(): string {
  // Welcome / receipt-style emails stay focused on Retard Skills only.
  // The BossMode bridge lives in the newsletter footer (newsletterFooter()),
  // not here — first-touch users shouldn't get brand-pivot whiplash.
  return `<p style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:13px;color:#8A8A86;line-height:1.55;margin:0 0 8px;">
    <strong style="color:#1A1A1A;">Retard Skills</strong> &mdash; six clarity audits for not being an idiot.
  </p>
  <p style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:12px;color:#8A8A86;line-height:1.55;margin:0;">
    <a href="https://retardskills.com" style="color:#1A1A1A;border-bottom:1px solid #E5E3DC;text-decoration:none;">retardskills.com</a>
  </p>`;
}

function newsletterFooter(): string {
  return `<p style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:13px;color:#8A8A86;line-height:1.55;margin:0 0 12px;">
    <strong style="color:#1A1A1A;">Retard Skills</strong> &mdash; six clarity audits for not being an idiot.
  </p>
  <p style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:13px;color:#1A1A1A;line-height:1.55;margin:0 0 16px;background:#E1E7FF;padding:14px 16px;border-left:2px solid #4B6BFF;">
    <strong style="font-weight:700;">This skill is one of six.</strong> <a href="https://bossmode.ing?utm_source=retardskills&utm_medium=email&utm_campaign=newsletter_footer" style="color:#1A1A1A;border-bottom:1px solid #1A1A1A;text-decoration:none;">BossMode</a> is what happens when all six wire into a permanent staff that runs your business while you stay the owner.
  </p>
  <p style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:11px;color:#8A8A86;line-height:1.55;margin:0;">
    You&rsquo;re reading this because you signed up at <a href="https://retardskills.com" style="color:#8A8A86;text-decoration:underline;">retardskills.com</a>. <a href="{{ unsubscribe_url }}" style="color:#8A8A86;text-decoration:underline;">Unsubscribe</a> &middot; &copy; ${new Date().getFullYear()} BossMode.
  </p>`;
}

/* -----------------------------------------------------------------------
   Utils
   --------------------------------------------------------------------- */

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeAttr(text: string): string {
  return text.replace(/"/g, '&quot;').replace(/&/g, '&amp;');
}
