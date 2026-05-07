/**
 * Dynamic favicon (32x32) — branded square in BossMode blue with "R."
 * Replaces the default Next.js favicon.ico when both exist; Next.js prefers
 * the file-route generation here.
 */
import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#4B6BFF',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FAFAF7',
          fontSize: 24,
          fontWeight: 900,
          letterSpacing: '-0.02em',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        R
      </div>
    ),
    { ...size },
  );
}
