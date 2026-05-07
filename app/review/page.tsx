import Link from 'next/link';
import type { Metadata } from 'next';

import ReviewForm from './ReviewForm';

export const metadata: Metadata = {
  title: 'Tell us how Retard Skills worked for you',
  description: 'Drop a review of any Retard Skills you ran on your work. Reviewed within 48 hours before going public.',
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
    --font-display: 'Big Shoulders Display', 'Source Serif 4', 'Iowan Old Style', Charter, Georgia, serif;
    --font-serif: 'Source Serif 4', 'Iowan Old Style', Charter, Georgia, serif;
    --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  }
  .rv-root {
    background: var(--paper);
    color: var(--ink);
    font-family: var(--font-serif);
    font-size: 17px;
    line-height: 1.6;
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
  }
  .rv-page {
    max-width: 640px;
    margin: 0 auto;
    padding: 80px 24px 96px;
  }
  @media (max-width: 640px) { .rv-page { padding: 56px 20px 64px; } }

  .rv-eyebrow {
    font-family: var(--font-sans);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.32em;
    color: var(--accent);
    font-weight: 700;
    margin-bottom: 20px;
  }
  .rv-title {
    font-family: var(--font-display);
    font-weight: 900;
    font-size: clamp(48px, 8vw, 88px);
    line-height: 0.92;
    letter-spacing: -0.025em;
    text-transform: uppercase;
    margin-bottom: 16px;
    color: var(--ink);
  }
  .rv-title .accent { color: var(--accent); }
  .rv-tagline {
    font-family: var(--font-serif);
    font-style: italic;
    font-size: 19px;
    color: var(--ink-soft);
    line-height: 1.5;
    margin-bottom: 48px;
  }
  .rv-tagline strong { color: var(--ink); font-style: normal; font-weight: 700; }

  .rv-footer {
    margin-top: 80px;
    padding-top: 24px;
    border-top: 1px solid var(--rule);
    font-family: var(--font-sans);
    font-size: 13px;
    color: var(--ink-faint);
    text-align: center;
  }
  .rv-footer a { color: var(--ink); border-bottom: 1px solid var(--rule); text-decoration: none; font-weight: 600; }
`;

export default function ReviewPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <main className="rv-root">
        <div className="rv-page">
          <p className="rv-eyebrow">Tell us how it went</p>
          <h1 className="rv-title">
            Did the <span className="accent">retard</span> walk?
          </h1>
          <p className="rv-tagline">
            You ran a Retard Skills on your work. Tell us what tripped, what you fixed, and whether it landed. <strong>Reviewed within 48 hours</strong> before anything goes public — your email is never shown.
          </p>

          <ReviewForm />

          <div className="rv-footer">
            <p>
              <Link href="/">← Back to Retard Skills</Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
