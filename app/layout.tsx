import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://retardskills.com'),
  title: 'Retard Skills — Retardmaxxing for websites, plans, pitches, bios, sales calls, and ideas',
  description:
    'Retardmaxxing as a collection of skills. Six clarity audits — Marketing, Wants, Pitch, Bio, Sales, Idea. Twenty fixed checks each. Idiot is the enemy of the Retard. Free in beta, brought to you by BossMode — drop your email and we send them.',
  keywords: [
    'retardmaxxing',
    'retard skills',
    'retardskills',
    'retard skill',
    'clarity audit',
    'cold-traffic clarity',
    'marketing copy audit',
    'website clarity',
    'plain language audit',
    'overcomplication',
    'mechanism vs outcome',
    'BossMode',
  ],
  openGraph: {
    title: 'Retard Skills — Retardmaxxing for your website, plan, pitch, bio, sales call, and idea',
    description:
      "The skills you didn't know you needed. Twenty fixed checks. Idiot is the enemy of the Retard. Free in beta, drop your email.",
    type: 'website',
    siteName: 'Retard Skills',
    url: 'https://retardskills.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Retard Skills — Retardmaxxing as a collection of skills',
    description:
      "Twenty fixed checks for overcomplication. Idiot is the enemy of the Retard. Six skills, free in beta, drop your email.",
  },
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@800;900&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;0,8..60,700;1,8..60,400;1,8..60,600&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
