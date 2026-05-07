import type { NextConfig } from 'next';

const isDevelopment = process.env.NODE_ENV !== 'production';

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "img-src 'self' data: blob:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  async rewrites() {
    return [
      // Auto-update URLs: every installed skill fetches its
      // /skill/{name}/latest.md on every run. Rewrite to the public file.
      { source: '/skill/marketing/latest.md', destination: '/retard-skill-marketing.md' },
      { source: '/skill/wants/latest.md',     destination: '/retard-skill-wants.md' },
      { source: '/skill/sales/latest.md',     destination: '/retard-skill-sales.md' },
      { source: '/skill/bio/latest.md',       destination: '/retard-skill-bio.md' },
      { source: '/skill/pitch/latest.md',     destination: '/retard-skill-pitch.md' },
      { source: '/skill/idea/latest.md',      destination: '/retard-skill-idea.md' },
    ];
  },
  async redirects() {
    return [
      // www → apex (canonical).
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.retardskills.com' }],
        destination: 'https://retardskills.com/:path*',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: contentSecurityPolicy },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
