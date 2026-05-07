import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import {
  RETARDSKILL_SESSION_COOKIE_NAME,
  verifyRetardSkillSessionToken,
} from "@/lib/session";
import SkillCard from './SkillCard';

export const metadata: Metadata = {
  title: 'Your Retard Skills — Copy, paste, run',
  description:
    'Your Retard Skills collection. Copy each skill to your clipboard or download the .md, then paste into Claude, Codex, Cursor, or Claude Code. New skills appear here as they ship.',
  robots: { index: false, follow: false },
};

const styles = `
  :root {
    --paper: #FAFAF7;
    --ink: #1A1A1A;
    --ink-soft: #4A4A48;
    --ink-faint: #8A8A86;
    --rule: #E5E3DC;
    --accent: #4B6BFF;
    --accent-soft: #E1E7FF;
    --ok: #2F5D3A;
    --ok-soft: #DCE8E0;
    --font-display: 'Big Shoulders Display', 'Source Serif 4', 'Iowan Old Style', Charter, Georgia, serif;
    --font-serif: 'Source Serif 4', 'Iowan Old Style', Charter, Georgia, serif;
    --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  }
  .sk-root {
    background: var(--paper);
    color: var(--ink);
    font-family: var(--font-serif);
    font-size: 17px;
    line-height: 1.6;
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
  }
  /* No-orphan rules across all viewports. */
  .sk-root h1, .sk-root h2, .sk-root h3, .sk-root .sk-tagline, .sk-root .sk-card-name, .sk-root .sk-install-guide summary { text-wrap: balance; }
  .sk-root p, .sk-root .sk-card-desc, .sk-root .sk-howto-body p, .sk-root .sk-install-step, .sk-root .sk-install-list li { text-wrap: pretty; }
  .sk-page {
    max-width: 760px;
    margin: 0 auto;
    padding: 80px 24px 96px;
  }
  @media (max-width: 768px) {
    .sk-page { padding: 56px 20px 64px; }
  }

  /* Hero */
  .sk-eyebrow {
    font-family: var(--font-sans);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.32em;
    color: var(--accent);
    font-weight: 700;
    margin-bottom: 24px;
  }
  .sk-title {
    font-family: var(--font-display);
    font-weight: 900;
    font-size: clamp(48px, 8vw, 88px);
    line-height: 0.92;
    letter-spacing: -0.025em;
    text-transform: uppercase;
    margin-bottom: 16px;
    color: var(--ink);
  }
  .sk-title .accent { color: var(--accent); }
  .sk-tagline {
    font-family: var(--font-serif);
    font-style: italic;
    font-size: 19px;
    color: var(--ink-soft);
    line-height: 1.5;
    margin-bottom: 48px;
    max-width: 560px;
  }
  .sk-tagline strong { color: var(--ink); font-weight: 700; font-style: normal; }

  /* Cards */
  .sk-card {
    border-top: 1px solid var(--ink);
    padding: 32px 0;
  }
  .sk-card:last-of-type { border-bottom: 1px solid var(--rule); }
  .sk-card-coming { opacity: 0.62; }

  .sk-card-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 16px;
    margin-bottom: 12px;
    flex-wrap: wrap;
  }
  .sk-card-name {
    font-family: var(--font-display);
    font-weight: 800;
    font-size: clamp(26px, 3.6vw, 34px);
    text-transform: uppercase;
    letter-spacing: -0.012em;
    color: var(--ink);
    line-height: 1;
  }
  .sk-status {
    font-family: var(--font-sans);
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    font-weight: 700;
    padding: 4px 10px;
    border: 1px solid var(--rule);
    color: var(--ink-soft);
    flex-shrink: 0;
  }
  .sk-status-live   { border-color: var(--accent); color: var(--accent); background: var(--accent-soft); }
  .sk-status-coming { border-color: var(--ink-soft); color: var(--ink-soft); }

  .sk-card-desc {
    font-size: 16px;
    line-height: 1.55;
    color: var(--ink);
    margin-bottom: 20px;
  }

  /* Buttons */
  .sk-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 16px;
  }
  .sk-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 12px 20px;
    font-family: var(--font-sans);
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    border: 1px solid var(--ink);
    cursor: pointer;
    text-decoration: none;
    transition: background 120ms, color 120ms, transform 120ms;
    background: transparent;
  }
  .sk-btn-primary {
    background: var(--accent);
    color: #FAFAF7;
    border-color: var(--accent);
  }
  .sk-btn-primary:hover { background: #5C79FF; border-color: #5C79FF; transform: translateY(-1px); }
  .sk-btn-primary:disabled { opacity: 0.7; cursor: progress; transform: none; }
  .sk-btn-secondary {
    color: var(--ink);
    background: transparent;
    border-color: var(--ink);
  }
  .sk-btn-secondary:hover { background: var(--ink); color: var(--paper); transform: translateY(-1px); }

  /* How-to accordion */
  .sk-howto {
    border-top: 1px dashed var(--rule);
    padding-top: 14px;
    margin-top: 6px;
  }
  .sk-howto summary {
    font-family: var(--font-sans);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    font-weight: 700;
    color: var(--ink-soft);
    cursor: pointer;
    list-style: none;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .sk-howto summary::-webkit-details-marker { display: none; }
  .sk-howto summary::after {
    content: '+';
    font-family: var(--font-display);
    font-weight: 900;
    font-size: 18px;
    color: var(--accent);
    margin-left: auto;
  }
  .sk-howto details[open] summary::after,
  .sk-howto[open] summary::after { content: '−'; }
  .sk-howto-body {
    margin-top: 12px;
    font-size: 14px;
    line-height: 1.55;
  }
  .sk-howto-body p { margin: 0 0 8px; color: var(--ink-soft); }
  .sk-howto-body p:last-child { margin-bottom: 0; }
  .sk-howto-body strong { color: var(--ink); font-weight: 600; }
  .sk-howto-body code {
    font-family: 'IBM Plex Mono', ui-monospace, SFMono-Regular, monospace;
    font-size: 0.9em;
    background: var(--accent-soft);
    padding: 1px 6px;
    border-radius: 2px;
    color: var(--ink);
  }

  /* Welcome / instructions block */
  .sk-welcome {
    border-left: 3px solid var(--accent);
    padding: 14px 18px;
    margin: 0 0 32px;
    background: var(--accent-soft);
    font-family: var(--font-serif);
    font-size: 15px;
    line-height: 1.55;
    color: var(--ink);
  }
  .sk-welcome strong { font-weight: 700; }

  /* Install guide accordion */
  .sk-install-guide {
    border: 1px solid var(--ink);
    margin: 0 0 56px;
    background: var(--paper);
  }
  .sk-install-guide summary {
    list-style: none;
    cursor: pointer;
    padding: 16px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: var(--font-display);
    font-weight: 800;
    font-size: 22px;
    color: var(--ink);
    text-transform: uppercase;
    letter-spacing: -0.01em;
  }
  .sk-install-guide summary::-webkit-details-marker { display: none; }
  .sk-install-toggle {
    font-family: var(--font-display);
    font-weight: 900;
    font-size: 28px;
    color: var(--accent);
    line-height: 1;
  }
  .sk-install-guide[open] .sk-install-toggle { transform: rotate(45deg); transition: transform 200ms; }
  .sk-install-body {
    padding: 8px 24px 24px;
    border-top: 1px solid var(--rule);
    font-family: var(--font-serif);
    color: var(--ink);
    font-size: 15px;
    line-height: 1.6;
  }
  .sk-install-step {
    margin: 16px 0 8px;
  }
  .sk-install-step strong {
    font-family: var(--font-display);
    font-weight: 800;
    color: var(--accent);
    margin-right: 6px;
    font-size: 17px;
  }
  .sk-install-step em {
    font-style: italic;
    color: var(--ink);
    font-weight: 600;
  }
  .sk-install-list {
    margin: 8px 0 16px;
    padding: 0 0 0 20px;
    list-style: none;
  }
  .sk-install-list li {
    margin: 12px 0;
    padding: 10px 14px;
    border-left: 2px solid var(--rule);
    background: var(--accent-soft);
  }
  .sk-install-list li strong {
    color: var(--accent);
    font-weight: 700;
  }
  .sk-install-list code,
  .sk-install-step code,
  .sk-install-aside code {
    font-family: 'IBM Plex Mono', ui-monospace, monospace;
    font-size: 0.88em;
    background: #fff;
    padding: 2px 6px;
    border: 1px solid var(--rule);
    border-radius: 2px;
    color: var(--ink);
    word-break: break-word;
  }
  .sk-install-aside {
    margin-top: 20px;
    padding-top: 14px;
    border-top: 1px dashed var(--rule);
    font-style: italic;
    font-size: 14px;
    color: var(--ink-soft);
  }

  /* Footer */
  .sk-footer {
    margin-top: 96px;
    padding-top: 32px;
    border-top: 1px solid var(--rule);
    font-family: var(--font-sans);
    font-size: 13px;
    color: var(--ink-faint);
    text-align: center;
    line-height: 1.55;
  }
  .sk-footer a { color: var(--ink); border-bottom: 1px solid var(--rule); text-decoration: none; font-weight: 600; }
  .sk-footer a:hover { color: var(--accent); border-bottom-color: var(--accent); }
`;

export default async function SkillsPage() {
  // Lead-magnet gate. The skills page is convenience UI (Copy / Download).
  // Without a valid session cookie (set on signup or via /api/access
  // from the welcome email), bounce to the landing page so the email gate holds.
  const cookieStore = await cookies();
  const session = cookieStore.get(RETARDSKILL_SESSION_COOKIE_NAME)?.value;
  if (!verifyRetardSkillSessionToken(session)) {
    redirect('/?gate=signup_required');
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <main className="sk-root">
        <div className="sk-page">

          <p className="sk-eyebrow">Your Retard Skills · Copy, paste, run</p>

          <h1 className="sk-title">
            You&apos;re <span className="accent">in.</span>
          </h1>

          <p className="sk-tagline">
            Below is your skills collection. Copy any skill to your clipboard or download the <code style={{ fontFamily: 'var(--font-sans)', fontSize: 14 }}>.md</code> file. Then paste it into Claude, Codex, Cursor, or Claude Code and run it on your URL. <strong>New skills appear here as they ship.</strong>
          </p>

          <div className="sk-welcome">
            <strong>One file per skill.</strong> No zip, no setup. Each skill is a single Markdown file you paste into your AI. The skill tells the AI exactly what to do; you just type your URL.
            <br /><br />
            <strong>Self-updating.</strong> Every time you run a skill, your AI pulls the latest version automatically. New checks and fixes ship to your install — you never reinstall.
          </div>

          {/* INSTALL GUIDE — for first-timers */}
          <details className="sk-install-guide" open>
            <summary>
              <span>First time? Install in 60 seconds.</span>
              <span className="sk-install-toggle">+</span>
            </summary>
            <div className="sk-install-body">
              <p className="sk-install-step">
                <strong>Step 1.</strong> Pick a skill below. Click <em>Copy skill</em> (or <em>Download .md</em>). The skill is one Markdown file.
              </p>
              <p className="sk-install-step">
                <strong>Step 2.</strong> Open your AI. Pick the path that matches what you have:
              </p>
              <ul className="sk-install-list">
                <li>
                  <strong>Claude (claude.ai):</strong> open a new chat, click the <em>+</em> attachment icon (or paste the skill text directly), then type: <code>run this on my homepage: yourwebsite.com</code>. Make sure Artifacts is on so the report renders inline.
                </li>
                <li>
                  <strong>Claude Code:</strong> save the file to <code>~/.claude/skills/retardskill-marketing/SKILL.md</code> (matching the skill name), restart Claude Code, then run: <code>retardmaxx yourwebsite.com</code>.
                </li>
                <li>
                  <strong>Codex (chatgpt.com/codex or the Codex CLI):</strong> open a new chat, paste the entire skill text as the system prompt or first message, then ask: <code>run this audit on yourwebsite.com</code>. Codex outputs the HTML report directly.
                </li>
                <li>
                  <strong>Cursor:</strong> open a new chat, paste the skill text, ask: <code>run this on yourwebsite.com</code>. Cursor outputs HTML — copy it, paste into a <code>.html</code> file, double-click to open.
                </li>
                <li>
                  <strong>Anywhere else (Gemini, Grok, etc.):</strong> paste the skill, ask it to audit your URL. If the AI can&apos;t output HTML cleanly, it&apos;ll still produce the 20-check breakdown in plain text.
                </li>
              </ul>
              <p className="sk-install-step">
                <strong>Step 3.</strong> The AI generates a Retard Report. Click the <strong>↓ Download PDF</strong> button at the top to save it.
              </p>
              <p className="sk-install-aside">
                Stuck? The most common issue is pasting the file as an attachment instead of as text. If your AI doesn&apos;t respond to <code>retardmaxx</code>, paste the entire skill markdown as your message and ask the AI to follow it.
              </p>
            </div>
          </details>

          <SkillCard
            id="marketing"
            name="Marketing"
            status="live"
            description="You're overthinking your copy. Retard Skills — Marketing is a mirror for your homepage, landing page, ads, or pitch text. Twenty checks for where YOU hid the thing under jargon, performance, hedging, and adjective-stacking. The cold-reader test is one symptom; your overthinking is the cause."
            filePath="/retard-skill-marketing.md"
            fileBytesUrl="/retard-skill-marketing.md"
          />

          <SkillCard
            id="wants"
            name="Wants"
            status="live"
            description="You already know the answer — you're shopping for permission. Retard Skills — Wants works on plans, vision docs, AND active decision debates (should I X or Y, am I overthinking this, help me decide). Twenty-two cope-pattern checks cut through your own overthinking to surface what you actually want. Built off Elisha Long's verbatim catalog."
            filePath="/retard-skill-wants.md"
            fileBytesUrl="/retard-skill-wants.md"
          />

          <SkillCard
            id="pitch"
            name="Pitch"
            status="live"
            description="You're philosophizing and hedging the ask. Retard Skills — Pitch audits decks, sales emails, fundraising one-pagers — for every line where YOU buried the ask, hedged the claim, or performed thought-leadership instead of selling. The retard founder names what you sell, who buys, what you want."
            filePath="/retard-skill-pitch.md"
            fileBytesUrl="/retard-skill-pitch.md"
          />

          <SkillCard
            id="bio"
            name="Bio"
            status="live"
            description="You're performing an identity. Retard Skills — Bio audits LinkedIn, X, About pages, founder bios — for every line where YOU hid behind adjectives, borrowed credentials, and missions instead of naming what you shipped. The retard names the action."
            filePath="/retard-skill-bio.md"
            fileBytesUrl="/retard-skill-bio.md"
          />

          <SkillCard
            id="sales"
            name="Sales"
            status="live"
            description="You're over-explaining and placating on calls. Retard Skills — Sales audits sales call transcripts for every line where YOU monologued, performed methodology, hedged, or asked permission to follow up. The retard salesperson asks the question and takes the answer. Run it on your last 3 lost deals."
            filePath="/retard-skill-sales.md"
            fileBytesUrl="/retard-skill-sales.md"
          />

          <SkillCard
            id="idea"
            name="Idea"
            status="live"
            description="You're building a vision doc instead of shipping. Retard Skills — Idea audits raw concepts pre-product for the cope: 5-year plans, framework-as-product, draft-23 polish, sunk-cost pre-commitment. The retard ideator describes in one line and ships draft 1."
            filePath="/retard-skill-idea.md"
            fileBytesUrl="/retard-skill-idea.md"
          />

          <div className="sk-footer">
            <p style={{ marginBottom: 16 }}>
              <strong>Did the retard walk?</strong> Once you&apos;ve run a skill, drop us a line — we&apos;ll feature the best ones on the landing.{' '}
              <Link href="/review" style={{ color: 'var(--accent)', borderBottomColor: 'var(--accent)' }}>Leave a review →</Link>
            </p>
            <p>
              You&apos;ll get an email each time a new skill ships. <Link href="/">Back to Retard Skills</Link>.
            </p>
            <p style={{ marginTop: 8 }}>
              Brought to you by <a href="https://bossmode.ing">BossMode</a>.
            </p>
          </div>

        </div>
      </main>
    </>
  );
}
