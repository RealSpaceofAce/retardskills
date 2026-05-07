/**
 * ReportPreview — auto-scrolling animated mock of the Retard Report.
 *
 * Shows a scaled-down version of the actual editorial design system from
 * the report generator, scrolling on a CSS keyframe loop so a visitor sees
 * what the deliverable looks like before they drop their email.
 *
 * No client JS — pure CSS animation, server-rendered.
 */

const previewStyles = `
  .rp-frame {
    position: relative;
    margin: 0 auto 56px;
    max-width: 760px;
    height: 480px;
    border: 1px solid var(--rule);
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 24px 80px rgba(26, 26, 26, 0.18), 0 1px 4px rgba(26, 26, 26, 0.08);
    background: var(--paper);
    isolation: isolate;
  }
  @media (max-width: 768px) {
    .rp-frame { height: 380px; }
  }
  @media (max-width: 480px) {
    .rp-frame { height: 320px; }
  }

  .rp-chrome {
    height: 32px;
    background: var(--chrome, #F0EFE9);
    border-bottom: 1px solid var(--rule);
    display: flex;
    align-items: center;
    padding: 0 14px;
    gap: 8px;
    flex-shrink: 0;
    position: relative;
    z-index: 2;
  }
  .rp-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--rule);
  }
  .rp-url {
    flex: 1;
    text-align: center;
    font-family: var(--font-sans);
    font-size: 11px;
    color: var(--ink-faint);
    letter-spacing: 0.04em;
  }

  .rp-viewport {
    position: relative;
    height: calc(100% - 32px);
    overflow: hidden;
  }
  .rp-fade-top, .rp-fade-bottom {
    position: absolute;
    left: 0; right: 0;
    height: 48px;
    z-index: 3;
    pointer-events: none;
  }
  .rp-fade-top {
    top: 0;
    background: linear-gradient(180deg, var(--paper) 0%, transparent 100%);
  }
  .rp-fade-bottom {
    bottom: 0;
    background: linear-gradient(0deg, var(--paper) 0%, transparent 100%);
  }

  .rp-scroller {
    padding: 32px 36px 0;
    animation: rp-scroll 28s ease-in-out infinite;
  }
  @media (max-width: 768px) {
    .rp-scroller { padding: 22px 24px 0; }
  }
  .rp-frame:hover .rp-scroller {
    animation-play-state: paused;
  }

  @keyframes rp-scroll {
    0%   { transform: translateY(0); }
    20%  { transform: translateY(0); }
    40%  { transform: translateY(-380px); }
    60%  { transform: translateY(-380px); }
    80%  { transform: translateY(-820px); }
    100% { transform: translateY(0); }
  }

  /* Editorial design system, mini scale */
  .rp-meta {
    font-family: var(--font-mono, var(--font-sans));
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    color: var(--accent);
    font-weight: 700;
    margin-bottom: 12px;
  }
  .rp-title {
    font-family: var(--font-display);
    font-weight: 900;
    font-size: 56px;
    line-height: 0.86;
    letter-spacing: -0.025em;
    text-transform: uppercase;
    margin-bottom: 8px;
    color: var(--ink);
  }
  .rp-title .accent { color: var(--accent); }
  .rp-subtitle {
    font-family: var(--font-serif);
    font-style: italic;
    font-size: 14px;
    color: var(--ink-soft);
    line-height: 1.45;
    margin-bottom: 24px;
    max-width: 480px;
  }

  .rp-scorecard {
    border-top: 1px solid var(--ink);
    border-bottom: 1px solid var(--rule);
    padding: 20px 0;
    margin-bottom: 32px;
  }
  .rp-dual-score {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--rule);
    margin-bottom: 20px;
  }
  .rp-score-cell .label {
    font-family: var(--font-sans);
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.22em;
    font-weight: 700;
    margin-bottom: 6px;
  }
  .rp-score-cell .label.retard { color: var(--ok); }
  .rp-score-cell .label.idiot  { color: var(--accent); }
  .rp-score-cell .num {
    font-family: var(--font-display);
    font-size: 56px;
    font-weight: 800;
    line-height: 1;
    letter-spacing: -0.03em;
  }
  .rp-score-cell .num.retard { color: var(--ok); }
  .rp-score-cell .num.idiot  { color: var(--accent); }
  .rp-score-cell .num .total { color: var(--ink-faint); font-weight: 400; font-size: 32px; }
  .rp-score-cell .sub {
    font-family: var(--font-serif);
    font-style: italic;
    font-size: 11px;
    color: var(--ink-soft);
    margin-top: 4px;
    line-height: 1.4;
  }

  .rp-ramp-axis {
    display: flex;
    justify-content: space-between;
    font-family: var(--font-sans);
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    font-weight: 700;
    margin-bottom: 8px;
  }
  .rp-ramp-axis .left  { color: var(--accent); }
  .rp-ramp-axis .right { color: var(--ok); }
  .rp-ramp-glyphs {
    display: flex;
    gap: 14px;
    font-family: var(--font-serif);
    font-size: 18px;
    flex-wrap: wrap;
    margin-bottom: 16px;
  }
  .rp-ramp-tier { display: inline-flex; align-items: baseline; gap: 4px; }
  .rp-ramp-tier .glyphs { letter-spacing: 0.04em; }
  .rp-ramp-tier .count {
    font-family: var(--font-sans);
    font-size: 9px;
    font-weight: 600;
    color: var(--ink-soft);
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
  .rp-headline {
    font-family: var(--font-serif);
    font-size: 14px;
    line-height: 1.5;
    color: var(--ink);
  }
  .rp-headline em { color: var(--accent); font-weight: 600; }

  .rp-section-marker {
    font-family: var(--font-mono, var(--font-sans));
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: var(--accent);
    font-weight: 700;
    margin-bottom: 8px;
    padding-top: 24px;
  }
  .rp-h2 {
    font-family: var(--font-serif);
    font-weight: 700;
    font-size: 28px;
    line-height: 1.1;
    letter-spacing: -0.018em;
    margin-bottom: 8px;
  }
  .rp-section-summary {
    font-family: var(--font-serif);
    font-style: italic;
    font-size: 13px;
    color: var(--ink-soft);
    margin-bottom: 24px;
    line-height: 1.45;
  }

  .rp-finding {
    padding: 20px 0;
    border-bottom: 1px solid var(--rule);
  }
  .rp-finding-head {
    display: flex;
    align-items: baseline;
    gap: 10px;
    margin-bottom: 8px;
    flex-wrap: wrap;
  }
  .rp-glyph {
    font-family: var(--font-serif);
    font-size: 16px;
    line-height: 1;
  }
  .rp-glyph.idiot { color: var(--ink); font-weight: 700; }
  .rp-check-id {
    font-family: var(--font-mono, var(--font-sans));
    font-size: 10px;
    color: var(--ink-soft);
    font-weight: 500;
  }
  .rp-check-tier {
    font-family: var(--font-sans);
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    font-weight: 700;
    margin-left: auto;
    color: var(--ink);
  }
  .rp-h3 {
    font-family: var(--font-serif);
    font-weight: 700;
    font-size: 18px;
    line-height: 1.2;
    color: var(--ink);
    flex: 1 1 100%;
    margin-top: 4px;
  }
  .rp-field-label {
    font-family: var(--font-sans);
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    color: var(--ink-soft);
    font-weight: 600;
    margin: 12px 0 4px;
    display: block;
  }
  .rp-quote {
    font-family: var(--font-serif);
    font-style: italic;
    font-size: 13px;
    line-height: 1.45;
    color: var(--ink);
    border-left: 2px solid var(--ink);
    padding: 4px 12px;
    margin: 4px 0;
  }
  .rp-retard-voice {
    font-family: var(--font-serif);
    font-size: 13px;
    line-height: 1.5;
    color: var(--ink);
    padding: 4px 12px;
    border-left: 2px solid var(--accent);
    margin: 4px 0;
  }
  .rp-retard-voice strong.r { color: var(--ok); font-weight: 700; }
  .rp-fix-block {
    font-family: var(--font-serif);
    font-size: 13px;
    line-height: 1.45;
    color: var(--ink);
    border-left: 2px solid var(--ok);
    padding: 4px 12px;
    margin: 4px 0 0;
  }
`;

export default function ReportPreview() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: previewStyles }} />
      <div className="rp-frame" aria-label="Retard Report preview">
        <div className="rp-chrome" aria-hidden="true">
          <span className="rp-dot" />
          <span className="rp-dot" />
          <span className="rp-dot" />
          <span className="rp-url">retard-report.html</span>
        </div>
        <div className="rp-viewport">
          <div className="rp-fade-top" aria-hidden="true" />
          <div className="rp-fade-bottom" aria-hidden="true" />
          <div className="rp-scroller">

            {/* Top of the report */}
            <p className="rp-meta">RETARD REPORT · 2026-05-06 · YOURBUSINESS.COM</p>
            <h1 className="rp-title">
              Retard <span className="accent">Report.</span>
            </h1>
            <p className="rp-subtitle">
              Twenty checks for overcomplication. Idiot on one end, Retard on the other. Max retard is good.
            </p>

            <div className="rp-scorecard">
              <div className="rp-dual-score">
                <div className="rp-score-cell">
                  <p className="label retard">Retard</p>
                  <p className="num retard">5<span className="total"> / 20</span></p>
                  <p className="sub">What you got brutally simple.</p>
                </div>
                <div className="rp-score-cell">
                  <p className="label idiot">Idiot</p>
                  <p className="num idiot">15<span className="total"> / 20</span></p>
                  <p className="sub">Where you&apos;re overthinking.</p>
                </div>
              </div>

              <div className="rp-ramp-axis">
                <span className="left">← Idiot</span>
                <span className="right">Retard →</span>
              </div>
              <div className="rp-ramp-glyphs">
                <span className="rp-ramp-tier"><span className="glyphs" style={{ color: 'var(--accent)', fontWeight: 700 }}>●●●</span><span className="count">3 Full Idiot</span></span>
                <span className="rp-ramp-tier"><span className="glyphs" style={{ color: 'var(--ink)', fontWeight: 700 }}>◉◉◉◉◉◉</span><span className="count">6 Idiot</span></span>
                <span className="rp-ramp-tier"><span className="glyphs">◐◐◐◐</span><span className="count">4 Drifting</span></span>
                <span className="rp-ramp-tier"><span className="glyphs" style={{ color: 'var(--ok)' }}>✓✓✓✓✓</span><span className="count">5 Retard</span></span>
              </div>

              <p className="rp-headline">
                The retard walked. <em>The page is selling the steak when the retard came for the sizzle.</em> The mechanism keeps showing up where the outcome should be leading.
              </p>
            </div>

            {/* Section: Vocabulary */}
            <p className="rp-section-marker">§1 — Vocabulary</p>
            <h2 className="rp-h2">Vocabulary that hides.</h2>
            <p className="rp-section-summary">
              Four of four tripped — the retard walked at the first big word.
            </p>

            <div className="rp-finding">
              <div className="rp-finding-head">
                <span className="rp-glyph idiot">◉</span>
                <span className="rp-check-id">V1</span>
                <span className="rp-check-tier">Idiot</span>
                <h3 className="rp-h3">Jargon requiring lookup</h3>
              </div>
              <span className="rp-field-label">Where it tripped</span>
              <div className="rp-quote">
                &ldquo;A unified platform that orchestrates cross-functional workflows.&rdquo;
              </div>
              <span className="rp-field-label">Why the retard walks</span>
              <p className="rp-retard-voice">
                The <strong className="r">retard</strong> doesn&apos;t know your jargon. The <strong className="r">retard</strong> knows three words: it does X, for Y, costs Z. Anything more is a lookup, and the <strong className="r">retard</strong> doesn&apos;t look things up.
              </p>
              <span className="rp-field-label">The fix</span>
              <div className="rp-fix-block">
                Replace with: &ldquo;Run your team&apos;s daily process from one place.&rdquo;
              </div>
            </div>

            <div className="rp-finding">
              <div className="rp-finding-head">
                <span className="rp-glyph idiot">◉</span>
                <span className="rp-check-id">V3</span>
                <span className="rp-check-tier">Idiot</span>
                <h3 className="rp-h3">Mechanism instead of outcome</h3>
              </div>
              <span className="rp-field-label">Why the retard walks</span>
              <p className="rp-retard-voice">
                The <strong className="r">retard</strong> doesn&apos;t care about your mechanism. The <strong className="r">retard</strong> wants to know what they get. Sell the sizzle. The steak is the boring part.
              </p>
            </div>

            {/* Spacer to give scroll room */}
            <div style={{ height: 200 }} />

          </div>
        </div>
      </div>
    </>
  );
}
