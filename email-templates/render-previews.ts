/**
 * Render every email template as standalone HTML files for visual review.
 *
 * Run: npx tsx email-templates/render-previews.ts
 *
 * Outputs to /Users/aaronernst/email-preview-*.html, then opens all three
 * in Chrome for side-by-side review.
 */
import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

import { wrapEmail, p, leadP, button, pullQuote, divider } from '../lib/email/template';

/* ----- Welcome (transactional, fired on signup) ------------------------ */

const welcomeHtml = wrapEmail({
  eyebrow: "Retard Skills · You're in",
  title: 'Your six skills are ready.',
  preheader: 'All six Retard Skills unlocked. Open your collection.',
  body: [
    p("Marketing, Wants, Pitch, Bio, Sales, Idea &mdash; all live, all yours. Click the button to open your collection. Copy each skill to your clipboard or download the <code style=\"font-family:'IBM Plex Mono',monospace;font-size:0.9em;background:#E1E7FF;padding:1px 5px;border-radius:2px;\">.md</code> file."),
    button('https://retardskills.com/skills', 'Open your skills →'),
    pullQuote("Paste any skill into Claude, Claude Code, Codex, Hermes, OpenClaw, or any terminal-capable agent. Run it on your URL, plan, sales call, bio, pitch, or idea. About 60 seconds later, you get a Retard Report &mdash; quote-and-fix, line by line."),
    leadP('Self-updating.', 'Each skill checks for the latest version every run &mdash; new checks ship to your install automatically. No reinstalling, ever.'),
    leadP('Newsletter is on.', 'You&rsquo;ll get a fresh real-world audit (Retard Reports) in your inbox each week. No drip, no upsell.'),
    leadP('Lost this email later?', `Sign up again at <a href="https://retardskills.com" style="color:#1A1A1A;border-bottom:1px solid #E5E3DC;text-decoration:none;">retardskills.com</a> with the same address &mdash; we&rsquo;ll re-send the access link.`),
  ].join(''),
  closingSig: 'Built because I couldn&rsquo;t see my own bullshit. <strong style="color:#1A1A1A;">&mdash; Aaron Ernst</strong>',
  footer: 'transactional',
});

/* ----- Newsletter (Kit broadcast template, weekly) --------------------- */

const newsletterHtml = wrapEmail({
  eyebrow: 'Retard Reports · Issue 12',
  title: 'This week&rsquo;s idiot was <em style="color:#4B6BFF;font-style:italic;">stripe.com/atlas</em>.',
  preheader: 'We ran the Marketing skill on Stripe Atlas. 13 of 20 tripped.',
  body: [
    p("Stripe Atlas is the &ldquo;form an LLC and start your company&rdquo; product. The page reads tight at first &mdash; clean Stripe-grade visual design. The Retard Skill found something else: the writer was hiding behind 7 years of Atlas-team vocabulary."),
    leadP('Score:', '<strong style="color:#C8341B;">13 of 20 tripped.</strong> Three Full Idiot. Six Idiot. Four Drifting. Seven Retard.'),
    pullQuote("&ldquo;Foundational tooling and trusted relationships, all built into Stripe.&rdquo; <em>The retard doesn&rsquo;t know what foundational tooling is. The retard wants to know if you&rsquo;ll form their LLC.</em>"),
    leadP('The headline finding:', 'Atlas hides what it actually does behind &ldquo;tooling&rdquo; and &ldquo;relationships.&rdquo; The retard at the bar still doesn&rsquo;t know if they get an LLC, an EIN, a business bank account, or a glorified airport lounge.'),
    button('https://retardskills.com/reports/2026-05-stripe-atlas', 'Read the full report →'),
    divider(),
    leadP('Run it on yours.', 'Drop the Marketing skill into Claude or Codex, point it at your homepage. The retard skill ships the same report &mdash; about 60 seconds.'),
    p('<a href="https://retardskills.com" style="color:#4B6BFF;border-bottom:1px solid #E1E7FF;text-decoration:none;font-weight:600;">retardskills.com →</a>'),
  ].join(''),
  closingSig: 'See you next week. <strong style="color:#1A1A1A;">&mdash; Aaron</strong>',
  footer: 'newsletter',
});

/* ----- BossMode pitch (Kit Sequence, day 28) --------------------------- */

const pitchHtml = wrapEmail({
  eyebrow: 'Retard Reports · A note',
  title: 'The skills are good. The staff is the point.',
  preheader: 'Four weeks of Retard Reports. Here&rsquo;s the bigger thing they came from.',
  body: [
    p("You&rsquo;ve been on Retard Reports for a month. Hopefully you&rsquo;ve run a skill or two on your own work and caught yourself overthinking something."),
    leadP('Here&rsquo;s what the skills <em>don&rsquo;t</em> do:', 'Ship anything. They diagnose. They mirror. They tell you where the cope is. The doing is still on you.'),
    p("BossMode is what does the doing."),
    pullQuote("All six Retard Skills wired into a permanent staff that runs your business while you stay the owner. Audits running daily on your copy, your sales calls, your plans. Reports landing in your morning inbox. Action items shipped by your AI team while you sleep."),
    leadP('Where to start:', 'Take the <strong style="color:#1A1A1A;">Bottleneck Check</strong> &mdash; a 4-minute diagnostic that surfaces what&rsquo;s actually slowing your business down. The retard skips the demo and finds the bottleneck.'),
    button('https://bossmode.ing/bottleneck-check?utm_source=retardskills&utm_medium=email&utm_campaign=day28_pitch', 'Take the Bottleneck Check →'),
    divider(),
    p('<em style="font-style:italic;color:#4A4A48;">If BossMode isn&rsquo;t for you yet, no worries &mdash; the Retard Reports keep coming. One real-world audit a week. You&rsquo;re still on the list.</em>'),
  ].join(''),
  closingSig: 'Aaron Ernst <strong style="color:#1A1A1A;">&mdash; BossMode</strong>',
  footer: 'newsletter',
});

/* ----- Write & open ---------------------------------------------------- */

const out = '/Users/aaronernst';
writeFileSync(`${out}/email-preview-welcome.html`, welcomeHtml);
writeFileSync(`${out}/email-preview-newsletter.html`, newsletterHtml);
writeFileSync(`${out}/email-preview-pitch.html`, pitchHtml);

console.log('Wrote three preview files:');
console.log('  /Users/aaronernst/email-preview-welcome.html    (transactional)');
console.log('  /Users/aaronernst/email-preview-newsletter.html (Kit broadcast)');
console.log('  /Users/aaronernst/email-preview-pitch.html      (Kit Sequence, day 28)');

try {
  execSync('open -a "Google Chrome" /Users/aaronernst/email-preview-welcome.html /Users/aaronernst/email-preview-newsletter.html /Users/aaronernst/email-preview-pitch.html');
  console.log('Opened all three in Chrome.');
} catch {
  console.log('(open failed — open the files manually)');
}
