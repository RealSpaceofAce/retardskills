import type { Metadata } from 'next';
import { Big_Shoulders, IBM_Plex_Mono, Inter, Source_Serif_4 } from 'next/font/google';

import './globals.css';

const bigShoulders = Big_Shoulders({
  subsets: ['latin'],
  weight: ['800', '900'],
  variable: '--font-big-shoulders',
  display: 'swap',
});

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-source-serif-4',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
});

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
    <html
      lang="en"
      className={`${bigShoulders.variable} ${sourceSerif.variable} ${inter.variable} ${ibmPlexMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
