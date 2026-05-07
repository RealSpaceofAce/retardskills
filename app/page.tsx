import RetardSkillSignup from './RetardSkillSignup';
import ReportPreview from './ReportPreview';
import Reviews from './Reviews';
import OpenSkillCTA from './OpenSkillCTA';
import ThemeToggle from './ThemeToggle';

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
    --card: #FFFFFF;
    --chrome: #F0EFE9;
    --font-display: 'Big Shoulders Display', 'Source Serif 4', 'Iowan Old Style', Charter, Georgia, serif;
    --font-serif: 'Source Serif 4', 'Iowan Old Style', Charter, Georgia, serif;
    --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  }
  :root[data-rs-theme='dark'] {
    --paper: #0F0F10;
    --ink: #FAFAF7;
    --ink-soft: #B8B8B5;
    --ink-faint: #6E6E6A;
    --rule: #2A2A28;
    --accent: #7A93FF;
    --accent-soft: #1B2245;
    --ok: #6BB07C;
    --card: #161618;
    --chrome: #1B1B1D;
  }
  .rs-root {
    background: var(--paper);
    color: var(--ink);
    font-family: var(--font-serif);
    font-size: 17px;
    line-height: 1.6;
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }
  /* No-orphan rules — distribute headings evenly, prevent single-word orphans
     in paragraphs across all viewports (desktop, tablet, mobile). */
  .rs-root h1,
  .rs-root h2,
  .rs-root h3,
  .rs-root .rs-tagline,
  .rs-root .rs-headline,
  .rs-root .rs-skill-name,
  .rs-root .rs-pro-name,
  .rs-root .rs-section h2 {
    text-wrap: balance;
  }
  .rs-root p,
  .rs-root .rs-faq-answer,
  .rs-root .rs-skill-desc,
  .rs-root .rs-pro-quote {
    text-wrap: pretty;
  }
  .rs-page {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 24px 96px;
    text-align: center;
  }
  .rs-content {
    max-width: 640px;
    margin: 0 auto;
  }
  @media (max-width: 768px) {
    .rs-page { padding: 0 20px 64px; }
  }
  @media (max-width: 480px) {
    .rs-page { padding: 0 18px 56px; }
  }

  /* Hero — compacted so the email form lives above the fold */
  /* Hero is a full-viewport takeover. Visitor sees ONLY the title block on
     first paint; everything else (form, report preview, skills grid…) lives
     below the fold and reveals on scroll. */
  .rs-hero {
    min-height: 100vh;
    margin-bottom: 0;
    padding: 32px 0 48px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .rs-hero-text {
    max-width: 720px;
    margin: 0 auto;
  }
  .rs-eyebrow {
    font-family: var(--font-sans);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.32em;
    color: var(--accent);
    font-weight: 700;
    margin-bottom: 24px;
  }
  /* Title stacks vertically and each word is sized to fill the viewport edge-to-edge.
     Big Shoulders Display 900 at this scale uses about 0.50em per character;
     RETARD (6 chars) and SKILLS. (7 chars) are sized to ~92% of viewport width. */
  .rs-title {
    font-family: var(--font-display);
    font-weight: 900;
    line-height: 0.86;
    letter-spacing: -0.04em;
    text-transform: uppercase;
    margin: 0 0 28px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
    white-space: nowrap;
  }
  .rs-title .span-1 { color: var(--ink);    font-size: clamp(72px, 16vw, 240px); }
  .rs-title .span-2 { color: var(--accent); font-size: clamp(64px, 14vw, 210px); }
  /* On smaller phones, scale up so the words still feel anchored. */
  @media (max-width: 700px) {
    .rs-title .span-1 { font-size: 26vw; }
    .rs-title .span-2 { font-size: 22vw; }
  }
  @media (max-width: 380px) {
    .rs-title { letter-spacing: -0.045em; }
  }
  /* Scroll cue at the bottom of the hero. */
  .rs-hero-cue {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    margin-top: 40px;
    font-family: var(--font-sans);
    font-size: 11px;
    letter-spacing: 0.32em;
    text-transform: uppercase;
    color: var(--ink-soft);
    font-weight: 700;
    text-decoration: none;
    cursor: pointer;
    transition: color 160ms;
  }
  .rs-hero-cue:hover { color: var(--accent); }
  .rs-hero-cue .rs-cue-arrow {
    display: inline-block;
    font-size: 22px;
    line-height: 1;
    color: var(--accent);
    animation: rs-cue 1.6s ease-in-out infinite;
  }
  @keyframes rs-cue {
    0%, 100% { transform: translateY(0); opacity: 0.45; }
    50%      { transform: translateY(8px); opacity: 1; }
  }
  @media (max-width: 380px) {
    .rs-title { letter-spacing: -0.045em; }
  }

  .rs-tagline {
    font-family: var(--font-serif);
    font-style: italic;
    font-size: clamp(17px, 2.1vw, 22px);
    color: var(--ink);
    line-height: 1.4;
    margin: 0 auto 12px;
    max-width: 540px;
  }
  .rs-tagline strong {
    font-weight: 700;
    font-style: normal;
  }

  .rs-tagline-sub {
    font-family: var(--font-serif);
    font-size: clamp(14px, 1.6vw, 17px);
    color: var(--ink-soft);
    line-height: 1.55;
    margin: 0 auto 24px;
    max-width: 520px;
  }

  /* Pitch block */
  .rs-pitch {
    margin: 0 auto 48px;
    max-width: 560px;
  }
  .rs-pitch p {
    font-size: 18px;
    line-height: 1.55;
    margin-bottom: 14px;
    color: var(--ink);
  }
  .rs-pitch p:last-child { margin-bottom: 0; }
  .rs-pitch em { font-style: italic; color: var(--accent); font-weight: 600; }

  /* Form */
  .rs-form-block {
    margin: 0 auto 80px;
    max-width: 520px;
  }
  .rs-form-label {
    font-family: var(--font-sans);
    font-size: clamp(10px, 1.6vw, 12px);
    text-transform: uppercase;
    letter-spacing: 0.16em;
    font-weight: 700;
    color: var(--ink-soft);
    margin-bottom: 14px;
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  @media (max-width: 520px) {
    .rs-form-label { letter-spacing: 0.1em; font-size: 10px; }
  }
  @media (max-width: 380px) {
    .rs-form-label { letter-spacing: 0.06em; font-size: 9px; }
  }

  /* Sections */
  .rs-section {
    margin-bottom: 64px;
  }
  .rs-section-wide {
    max-width: 920px;
    margin-left: auto;
    margin-right: auto;
  }
  .rs-section-wide .rs-skill-grid {
    max-width: 920px;
  }
  .rs-section-eyebrow {
    font-family: var(--font-sans);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.22em;
    color: var(--accent);
    font-weight: 700;
    margin-bottom: 12px;
  }
  .rs-section h2 {
    font-family: var(--font-serif);
    font-size: clamp(28px, 4vw, 38px);
    font-weight: 700;
    letter-spacing: -0.018em;
    line-height: 1.1;
    margin: 0 auto 20px;
    max-width: 540px;
  }
  .rs-section h2 em { color: var(--accent); font-style: italic; }
  .rs-section p {
    font-size: 17px;
    line-height: 1.6;
    margin: 0 auto 12px;
    max-width: 540px;
    color: var(--ink-soft);
  }

  /* How it works — 3-step beat */
  .rs-howitworks {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    margin: 0 auto 32px;
    max-width: 600px;
    text-align: left;
  }
  @media (max-width: 600px) {
    .rs-howitworks { grid-template-columns: 1fr; gap: 16px; }
  }
  .rs-step {
    border-top: 1px solid var(--ink);
    padding-top: 12px;
  }
  .rs-step-num {
    font-family: var(--font-display);
    font-weight: 800;
    font-size: 24px;
    color: var(--accent);
    line-height: 1;
    letter-spacing: -0.01em;
    margin-bottom: 6px;
  }
  .rs-step-body {
    font-family: var(--font-serif);
    font-size: 14px;
    line-height: 1.45;
    color: var(--ink);
  }

  /* Reassurance under form */
  .rs-reassure {
    font-family: var(--font-sans);
    font-size: 12px;
    color: var(--ink-soft);
    margin-top: 14px;
    letter-spacing: 0.02em;
  }
  .rs-reassure strong { color: var(--ink); font-weight: 600; }

  /* Featured checks — three damning ones */
  .rs-featured {
    margin: 32px auto 24px;
    max-width: 600px;
    text-align: left;
  }
  .rs-featured-row {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 18px;
    padding: 18px 0;
    border-top: 1px solid var(--rule);
    align-items: baseline;
  }
  .rs-featured-row:last-child { border-bottom: 1px solid var(--rule); }
  .rs-featured-num {
    font-family: var(--font-display);
    font-weight: 900;
    font-size: clamp(36px, 5vw, 56px);
    color: var(--accent);
    line-height: 0.9;
    letter-spacing: -0.025em;
    flex-shrink: 0;
    min-width: 64px;
  }
  .rs-featured-body {
    font-family: var(--font-serif);
    font-size: 16px;
    line-height: 1.5;
    color: var(--ink);
  }
  .rs-featured-body strong {
    font-weight: 700;
    color: var(--ink);
  }
  .rs-featured-body em {
    font-style: italic;
    color: var(--accent);
    font-weight: 600;
  }

  /* FAQ */
  .rs-faq {
    margin: 32px auto 0;
    max-width: 600px;
    text-align: left;
  }
  .rs-faq details {
    border-top: 1px solid var(--rule);
    padding: 18px 0;
  }
  .rs-faq details:last-of-type { border-bottom: 1px solid var(--rule); }
  .rs-faq summary {
    font-family: var(--font-serif);
    font-style: italic;
    font-size: 18px;
    color: var(--ink);
    cursor: pointer;
    list-style: none;
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 12px;
  }
  .rs-faq summary::-webkit-details-marker { display: none; }
  .rs-faq summary::after {
    content: '+';
    font-family: var(--font-display);
    font-weight: 900;
    font-size: 24px;
    color: var(--accent);
    transition: transform 200ms;
  }
  .rs-faq details[open] summary::after { content: '−'; }
  .rs-faq summary:hover { color: var(--accent); }
  .rs-faq-answer {
    font-family: var(--font-serif);
    font-size: 16px;
    line-height: 1.55;
    color: var(--ink-soft);
    margin-top: 10px;
    padding-right: 24px;
  }

  /* Founder line */
  .rs-founder {
    font-family: var(--font-serif);
    font-style: italic;
    font-size: 15px;
    color: var(--ink-soft);
    margin: 56px auto 0;
    max-width: 480px;
    line-height: 1.5;
    text-align: center;
  }
  .rs-founder strong {
    font-style: normal;
    font-weight: 600;
    color: var(--ink);
  }

  /* Pro retardmaxxers — celebrity / press proof block */
  .rs-pro-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin: 32px auto 0;
    max-width: 1000px;
    text-align: left;
  }
  @media (max-width: 900px) {
    .rs-pro-grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 560px) {
    .rs-pro-grid { grid-template-columns: 1fr; }
  }
  .rs-pro-card {
    border: 1px solid var(--rule);
    padding: 24px 22px 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    background: var(--card);
    transition: border-color 180ms, transform 180ms, background 180ms;
  }
  .rs-pro-card:hover { border-color: var(--ink); transform: translateY(-2px); }
  .rs-pro-quote {
    font-family: var(--font-serif);
    font-style: italic;
    font-size: 17px;
    line-height: 1.45;
    color: var(--ink);
    flex: 1;
    margin: 0;
  }
  .rs-pro-meta {
    border-top: 1px solid var(--rule);
    padding-top: 12px;
  }
  .rs-pro-name {
    font-family: var(--font-display);
    font-weight: 800;
    font-size: 17px;
    text-transform: uppercase;
    letter-spacing: -0.005em;
    color: var(--ink);
    line-height: 1.1;
    margin: 0 0 4px;
  }
  .rs-pro-attr {
    font-family: var(--font-sans);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    color: var(--ink-soft);
    margin: 0 0 10px;
    font-weight: 600;
  }
  .rs-pro-link {
    font-family: var(--font-sans);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--accent);
    text-decoration: none;
  }
  .rs-pro-link:hover { color: var(--ink); }

  /* Skills grid — square blocks */
  .rs-skill-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin: 32px auto 0;
    max-width: 1000px;
    text-align: left;
  }
  @media (max-width: 900px) {
    .rs-skill-grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 560px) {
    .rs-skill-grid { grid-template-columns: 1fr; }
  }
  .rs-skill-block {
    border: 1px solid var(--rule);
    padding: 24px 22px 28px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    background: var(--card);
    transition: border-color 180ms, transform 180ms, background 180ms;
    min-height: 280px;
  }
  .rs-skill-block:hover { border-color: var(--ink); transform: translateY(-2px); }
  .rs-skill-block.live {
    border-color: var(--accent);
    background: var(--accent-soft);
  }
  .rs-skill-block.coming { opacity: 0.7; }
  .rs-skill-block-top {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 8px;
  }
  .rs-skill-index {
    font-family: var(--font-mono, var(--font-sans));
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--ink-soft);
  }
  .rs-skill-pill {
    font-family: var(--font-sans);
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    font-weight: 700;
    padding: 3px 8px;
    border: 1px solid var(--rule);
    color: var(--ink-soft);
    flex-shrink: 0;
  }
  .rs-skill-pill.live   { border-color: var(--accent); color: var(--accent); background: var(--card); }
  .rs-skill-name {
    font-family: var(--font-display);
    font-weight: 900;
    font-size: clamp(28px, 3.4vw, 36px);
    text-transform: uppercase;
    letter-spacing: -0.018em;
    color: var(--ink);
    line-height: 0.95;
    margin-top: 2px;
  }
  .rs-skill-quote {
    font-family: var(--font-serif);
    font-style: italic;
    font-size: 14px;
    line-height: 1.45;
    color: var(--accent);
    font-weight: 500;
  }
  .rs-skill-block.coming .rs-skill-quote { color: var(--ink-soft); }
  .rs-skill-desc {
    font-family: var(--font-serif);
    font-size: 14px;
    line-height: 1.5;
    color: var(--ink-soft);
    flex: 1;
  }
  .rs-skill-cta {
    font-family: var(--font-sans);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--accent);
    text-decoration: none;
    margin-top: auto;
    padding-top: 4px;
    border-top: 1px solid rgba(75, 107, 255, 0.18);
  }
  .rs-skill-cta:hover { color: var(--ink); }

  .rs-aside {
    font-family: var(--font-serif);
    font-style: italic;
    font-size: 15px;
    color: var(--ink-soft);
    margin-top: 24px;
    text-align: center;
  }

  /* Quote */
  .rs-quote {
    font-family: var(--font-serif);
    font-style: italic;
    font-size: clamp(18px, 2.6vw, 24px);
    line-height: 1.4;
    color: var(--ink);
    margin: 80px auto 0;
    max-width: 540px;
    padding: 24px 0;
    border-top: 1px solid var(--rule);
    border-bottom: 1px solid var(--rule);
  }
  .rs-quote .who {
    display: block;
    font-style: normal;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: var(--ink-soft);
    margin-top: 12px;
    font-weight: 600;
  }

  /* Footer */
  .rs-footer {
    margin-top: 80px;
    padding-top: 32px;
    border-top: 1px solid var(--rule);
    font-family: var(--font-sans);
    font-size: 13px;
    color: var(--ink-faint);
    line-height: 1.55;
  }
  .rs-footer strong { color: var(--ink); font-weight: 700; }
  .rs-footer a {
    color: var(--ink);
    border-bottom: 1px solid var(--rule);
    text-decoration: none;
    font-weight: 600;
  }
  .rs-footer a:hover { color: var(--accent); border-bottom-color: var(--accent); }
`;

export default function RetardSkillPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Retard Skills',
    alternateName: 'Retardmaxxing skills for cold-traffic clarity',
    description:
      'Six clarity audit skills for websites, plans, pitches, bios, sales calls, and raw ideas. Twenty fixed checks each. Retardmaxxing turned into a structural audit you can run on your own work.',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Any LLM or terminal agent (Claude, Claude Code, Codex, Hermes, OpenClaw)',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    publisher: {
      '@type': 'Organization',
      name: 'BossMode',
      url: 'https://bossmode.ing',
    },
    keywords: 'retardmaxxing, retard skills, retardskills, clarity audit, marketing copy, cold-traffic clarity, plain language audit',
  };

  // No-flash theme bootstrap. Runs synchronously before paint so the page
  // renders directly in the persisted theme — no white flash on dark-mode
  // returns, no dark flash on light-mode returns.
  const themeBootstrap = `(function(){try{var t=localStorage.getItem('rs-theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-rs-theme',t);}}catch(e){}})();`;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <ThemeToggle />
      <main className="rs-root">
        <div className="rs-page">

          {/* HERO */}
          <section className="rs-hero">
            <p className="rs-eyebrow">Retardmaxxing · Skills for not being an idiot</p>

            <h1 className="rs-title">
              <span className="span-1">Retard</span>
              <span className="span-2">Skills.</span>
            </h1>

            <div className="rs-hero-text">
              <p className="rs-tagline">
                The retard only knows what they want. The retard isn&apos;t ashamed of what they want. <strong>The retard ships.</strong>
              </p>
            </div>
            <a className="rs-hero-cue" href="#rs-form-block" aria-label="Go retarded">
              <span>Go retarded</span>
              <span className="rs-cue-arrow" aria-hidden="true">↓</span>
            </a>
          </section>

          <div className="rs-content">

          {/* FORM — above the fold so the lead-magnet ask never gets buried */}
          <section className="rs-form-block" id="rs-form-block" style={{ marginBottom: 64 }}>
            <span className="rs-form-label">Drop your email &mdash; get your Retard Reports in 30 seconds</span>
            <RetardSkillSignup />
            <p className="rs-reassure">
              <strong>Free in beta.</strong> No spam &mdash; just new skills as they ship. Unsubscribe in one click.
            </p>
          </section>

          {/* REPORT PREVIEW */}
          <section className="rs-section" style={{ marginBottom: 56 }}>
            <p className="rs-section-eyebrow">What you get when you run it</p>
            <h2 style={{ marginBottom: 32 }}>The <em>Retard Report.</em></h2>
            <p style={{ marginBottom: 32 }}>
              Run a skill. About 60 seconds later, you get this:
            </p>
            <ReportPreview />
            <p className="rs-aside" style={{ marginTop: -32 }}>
              A polished editorial HTML report. Quote first, fix second. Hover the preview to pause.
            </p>
          </section>

          {/* HOW IT WORKS */}
          <section className="rs-section" style={{ marginBottom: 32 }}>
            <p className="rs-section-eyebrow">How you actually use it</p>
            <h2 style={{ marginBottom: 24 }}>Three steps. Thirty seconds.</h2>
            <div className="rs-howitworks">
              <div className="rs-step">
                <p className="rs-step-num">01</p>
                <p className="rs-step-body">Drop your email.</p>
              </div>
              <div className="rs-step">
                <p className="rs-step-num">02</p>
                <p className="rs-step-body">All six skills, one page.</p>
              </div>
              <div className="rs-step">
                <p className="rs-step-num">03</p>
                <p className="rs-step-body">Paste into your AI. Run.</p>
              </div>
            </div>
          </section>

          </div> {/* end .rs-content (narrow) — break out for the wider skills grid */}

          {/* SKILLS GRID — six square blocks (wider container) */}
          <section className="rs-section rs-section-wide" style={{ marginBottom: 64 }}>
            <p className="rs-section-eyebrow">Six skills · One philosophy</p>
            <h2>Six skills. <em>All shipped.</em></h2>
            <p style={{ marginBottom: 8 }}>
              <strong style={{ color: 'var(--ink)' }}>Six surfaces. One mirror.</strong>
            </p>
            <div className="rs-skill-grid">
              <article className="rs-skill-block live">
                <div className="rs-skill-block-top">
                  <span className="rs-skill-index">01</span>
                  <span className="rs-skill-pill live">✓ Live</span>
                </div>
                <h3 className="rs-skill-name">Marketing</h3>
                <p className="rs-skill-quote">&ldquo;You&apos;re overthinking your copy. Audit yours.&rdquo;</p>
                <p className="rs-skill-desc">Mirror for homepages, landing pages, ads, pitch copy. Catches where YOU hid the thing under jargon, performance, hedging, and adjective-stacking.</p>
                <OpenSkillCTA>Open it →</OpenSkillCTA>
              </article>

              <article className="rs-skill-block live">
                <div className="rs-skill-block-top">
                  <span className="rs-skill-index">02</span>
                  <span className="rs-skill-pill live">✓ Live</span>
                </div>
                <h3 className="rs-skill-name">Wants</h3>
                <p className="rs-skill-quote">&ldquo;You already know the answer. You&apos;re shopping for permission.&rdquo;</p>
                <p className="rs-skill-desc">Plans, vision docs, &ldquo;this is the year I&rdquo; commitments &mdash; AND active decision debates (&ldquo;should I X or Y?&rdquo;). Cuts through your own overthinking to surface what you actually want.</p>
                <OpenSkillCTA>Open it →</OpenSkillCTA>
              </article>

              <article className="rs-skill-block live">
                <div className="rs-skill-block-top">
                  <span className="rs-skill-index">03</span>
                  <span className="rs-skill-pill live">✓ Live</span>
                </div>
                <h3 className="rs-skill-name">Pitch</h3>
                <p className="rs-skill-quote">&ldquo;You&apos;re philosophizing and hedging. Audit yours.&rdquo;</p>
                <p className="rs-skill-desc">Decks, sales emails, fundraising one-pagers. Catches every slide where YOU buried the ask, hedged the claim, or performed thought-leadership instead of selling.</p>
                <OpenSkillCTA>Open it →</OpenSkillCTA>
              </article>

              <article className="rs-skill-block live">
                <div className="rs-skill-block-top">
                  <span className="rs-skill-index">04</span>
                  <span className="rs-skill-pill live">✓ Live</span>
                </div>
                <h3 className="rs-skill-name">Bio</h3>
                <p className="rs-skill-quote">&ldquo;You&apos;re performing an identity. Audit yours.&rdquo;</p>
                <p className="rs-skill-desc">LinkedIn, X, About pages, founder bios. Catches where YOU hid behind adjectives, borrowed credentials, and missions instead of naming what you shipped.</p>
                <OpenSkillCTA>Open it →</OpenSkillCTA>
              </article>

              <article className="rs-skill-block live">
                <div className="rs-skill-block-top">
                  <span className="rs-skill-index">05</span>
                  <span className="rs-skill-pill live">✓ Live</span>
                </div>
                <h3 className="rs-skill-name">Sales</h3>
                <p className="rs-skill-quote">&ldquo;You&apos;re over-explaining and placating. Audit your call.&rdquo;</p>
                <p className="rs-skill-desc">Sales call transcripts. Catches every line where YOU monologued, performed methodology, hedged, or asked permission to follow up. The retard salesperson asks and listens.</p>
                <OpenSkillCTA>Open it →</OpenSkillCTA>
              </article>

              <article className="rs-skill-block live">
                <div className="rs-skill-block-top">
                  <span className="rs-skill-index">06</span>
                  <span className="rs-skill-pill live">✓ Live</span>
                </div>
                <h3 className="rs-skill-name">Idea</h3>
                <p className="rs-skill-quote">&ldquo;You&apos;re building a vision doc instead of shipping. Audit yours.&rdquo;</p>
                <p className="rs-skill-desc">Raw ideas pre-product. Catches the cope: 5-year plans, framework-as-product, draft-23 polish, sunk-cost pre-commitment. The retard ideator ships draft 1.</p>
                <OpenSkillCTA>Open it →</OpenSkillCTA>
              </article>
            </div>
          </section>

          {/* WHERE THIS COMES FROM — philosophy lineage, NOT customer endorsement */}
          <section className="rs-section rs-section-wide" style={{ marginBottom: 64 }}>
            <p className="rs-section-eyebrow">Where this comes from</p>
            <h2>The <em>philosophy</em> we built these on.</h2>
            <p style={{ marginBottom: 8 }}>
              We didn&apos;t invent retardmaxxing &mdash; we turned it into a structural audit. Below: the people who made the philosophy public. <em>Fingers crossed they pick up the skills too.</em>
            </p>
            <div className="rs-pro-grid">
              <article className="rs-pro-card">
                <p className="rs-pro-quote">&ldquo;Retardmaxxing is the art of not overthinking your exit from things that are making you miserable.&rdquo;</p>
                <div className="rs-pro-meta">
                  <p className="rs-pro-name">Elisha Long</p>
                  <p className="rs-pro-attr">Originator of the philosophy</p>
                  <a className="rs-pro-link" href="https://www.youtube.com/@ElishaLong" target="_blank" rel="noopener noreferrer">Watch the videos →</a>
                </div>
              </article>

              <article className="rs-pro-card">
                <p className="rs-pro-quote">&ldquo;There&apos;s this guy on YouTube who has basically a hundred videos on retardmaxxing&hellip; he&apos;s like my new life coach.&rdquo;</p>
                <div className="rs-pro-meta">
                  <p className="rs-pro-name">Marc Andreessen</p>
                  <p className="rs-pro-attr">on the philosophy &middot; 20VC podcast</p>
                  <a className="rs-pro-link" href="https://www.youtube.com/watch?v=c4tvVKDhpiY" target="_blank" rel="noopener noreferrer">Watch the clip →</a>
                </div>
              </article>

              <article className="rs-pro-card">
                <p className="rs-pro-quote">&ldquo;Andreessen has been tweeting about this guy that he watches who posts these videos about retardmaxxing. I watched the videos.&rdquo;</p>
                <div className="rs-pro-meta">
                  <p className="rs-pro-name">Chamath Palihapitiya</p>
                  <p className="rs-pro-attr">on the philosophy &middot; All-In Pod</p>
                  <a className="rs-pro-link" href="https://x.com/theallinpod/status/2041207536360006013" target="_blank" rel="noopener noreferrer">See the clip →</a>
                </div>
              </article>
            </div>
          </section>

          {/* APPROVED REVIEWS — renders only if there are any */}
          <Reviews />

          {/* Re-enter the narrow .rs-content column for FAQ + quote + footer */}
          <div className="rs-content">

          {/* FAQ */}
          <section className="rs-section">
            <p className="rs-section-eyebrow">Questions the skeptic asks</p>
            <h2>Six things you&apos;re wondering.</h2>
            <div className="rs-faq">
              <details>
                <summary>Is it really free?</summary>
                <p className="rs-faq-answer">Free in beta. By <a href="https://bossmode.ing" style={{ color: 'var(--ink)', borderBottom: '1px solid var(--rule)', textDecoration: 'none' }}>BossMode</a> &mdash; we&rsquo;re about freedom for owners. No card, no trial.</p>
              </details>
              <details>
                <summary>Will it work with my agent harness?</summary>
                <p className="rs-faq-answer">Yes. Anything that runs in the terminal works &mdash; <strong style={{ color: 'var(--ink)' }}>Hermes</strong>, <strong style={{ color: 'var(--ink)' }}>OpenClaw</strong>, <strong style={{ color: 'var(--ink)' }}>Claude Code</strong>, <strong style={{ color: 'var(--ink)' }}>Codex CLI</strong>, <strong style={{ color: 'var(--ink)' }}>Cursor</strong>, custom agents, whatever you&rsquo;ve built. The skill is one Markdown file. Drop it where your harness reads skills (system prompt, custom instruction, skill folder), then run <code style={{ fontFamily: 'var(--font-sans)', fontSize: 13, background: 'transparent', borderBottom: '1px solid var(--rule)' }}>retardmaxx [URL]</code>. The skill file&rsquo;s frontmatter handles the rest.</p>
              </details>
              <details>
                <summary>Do I need Claude Code? Will my LLM produce the HTML report?</summary>
                <p className="rs-faq-answer">
                  No, you don&apos;t need Claude Code &mdash; but you do need an LLM that can output HTML. <strong style={{ color: 'var(--ink)' }}>Claude</strong> (claude.ai with Artifacts on) and <strong style={{ color: 'var(--ink)' }}>Claude Code</strong> render the report directly. <strong style={{ color: 'var(--ink)' }}>Codex</strong> and <strong style={{ color: 'var(--ink)' }}>Cursor</strong> output the HTML as text in the chat &mdash; copy it, paste into a <code style={{ fontFamily: 'var(--font-sans)', fontSize: 13, background: 'transparent', borderBottom: '1px solid var(--rule)' }}>.html</code> file, double-click to open. Either way you get the same report; Claude is just one less step. <strong style={{ color: 'var(--ink)' }}>ChatGPT</strong> doesn&apos;t do HTML reliably, so use Codex or Claude.
                </p>
              </details>
              <details>
                <summary>What if I&apos;m not technical?</summary>
                <p className="rs-faq-answer">Open Claude or Codex. Paste the skill file. Type &ldquo;run this on my homepage: yourwebsite.com.&rdquo; That&apos;s it. The output is a polished HTML report you can share with your team.</p>
              </details>
              <details>
                <summary>How long does the audit take?</summary>
                <p className="rs-faq-answer">About 60 seconds per page once you&apos;ve pasted the skill. The skill does the work; you read the report.</p>
              </details>
              <details>
                <summary>What does retardmaxxing mean?</summary>
                <p className="rs-faq-answer">Retardmaxxing is the practice of stripping every layer of overthinking until what&apos;s left is brutally simple. <strong style={{ color: 'var(--ink)' }}>Idiot is the enemy of the retard.</strong> The idiot overthinks. The retard ships.</p>
                <p className="rs-faq-answer" style={{ marginTop: 12 }}>The term was popularized by <a href="https://www.youtube.com/@ElishaLong" style={{ color: 'var(--ink)', borderBottom: '1px solid var(--rule)', textDecoration: 'none', fontWeight: 600 }}>Elisha Long</a>. Retard Skills is what happens when you turn that philosophy into a structural audit you can run on your own work.</p>
              </details>
            </div>
          </section>

          {/* QUOTE */}
          <p className="rs-quote">
            &ldquo;The retard isn&apos;t ashamed of what they want. The retard only knows what they want. Stop being an idiot.&rdquo;
            <span className="who">&mdash; the philosophy in one breath</span>
          </p>

          {/* FOOTER */}
          <div className="rs-footer">
            <p>
              <strong>Retard Skills</strong> is brought to you by <a href="https://bossmode.ing">BossMode</a>.
            </p>
            <p style={{ marginTop: 8 }}>
              The AI staff that runs your business while you stay the owner.
            </p>
            <p style={{ marginTop: 32, fontSize: 11, letterSpacing: '0.06em', color: 'var(--ink-faint)' }}>
              © {new Date().getFullYear()} BossMode. All rights reserved.{' '}
              <span aria-hidden="true">·</span>{' '}
              <a href="https://bossmode.ing/terms" style={{ color: 'inherit' }}>Terms</a>{' '}
              <span aria-hidden="true">·</span>{' '}
              <a href="https://bossmode.ing/privacy" style={{ color: 'inherit' }}>Privacy</a>
            </p>
          </div>

          </div>
        </div>
      </main>
    </>
  );
}
