/**
 * Apple touch icon (180x180) — same brand mark as the favicon, scaled.
 */
import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
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
          fontSize: 132,
          fontWeight: 900,
          letterSpacing: '-0.04em',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        R
      </div>
    ),
    { ...size },
  );
}
