/**
 * Open Graph image (1200x630) — what shows up when retardskills.com is
 * shared on Twitter, LinkedIn, Slack, iMessage, Discord, anywhere.
 *
 * Editorial design system: Big Shoulders Display-style heavy uppercase
 * title (system fallback since loading Google Fonts at edge is heavy),
 * BossMode blue accent (#4B6BFF), paper background (#FAFAF7).
 */
import { ImageResponse } from 'next/og';

export const alt = 'Retard Skills — Retardmaxxing for websites, plans, pitches, bios, sales calls, and ideas';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#FAFAF7',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 80px',
          fontFamily: '"Helvetica Neue", Arial, sans-serif',
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            fontSize: 22,
            textTransform: 'uppercase',
            letterSpacing: 8,
            color: '#4B6BFF',
            fontWeight: 800,
          }}
        >
          retardmaxxing · skills for not being an idiot
        </div>

        {/* Title block */}
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 0.86 }}>
          <div
            style={{
              fontSize: 232,
              fontWeight: 900,
              color: '#1A1A1A',
              textTransform: 'uppercase',
              letterSpacing: '-0.04em',
            }}
          >
            Retard
          </div>
          <div
            style={{
              fontSize: 232,
              fontWeight: 900,
              color: '#4B6BFF',
              textTransform: 'uppercase',
              letterSpacing: '-0.04em',
            }}
          >
            Skills.
          </div>
        </div>

        {/* Footer row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '2px solid #1A1A1A',
            paddingTop: 24,
          }}
        >
          <div
            style={{
              fontSize: 24,
              fontStyle: 'italic',
              color: '#1A1A1A',
              fontWeight: 500,
            }}
          >
            Six clarity audits. The retard ships.
          </div>
          <div
            style={{
              fontSize: 16,
              textTransform: 'uppercase',
              letterSpacing: 4,
              color: '#4A4A48',
              fontWeight: 700,
            }}
          >
            retardskills.com
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
