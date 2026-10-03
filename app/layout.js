import './globals.css';
import './portfolio.css';
import localFont from 'next/font/local';
import MotionLayer from './components/MotionLayer';
import AnalyticsPing from './components/AnalyticsPing';
import { ProjectTransitionProvider } from './components/ProjectTransition';
const space = localFont({ src: './fonts/SpaceGrotesk.ttf', variable: '--font-space', display: 'swap', weight: '300 700' });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ahsanhere.me';
const siteTitle = 'Ahsan Tariq — Game Developer';
const siteDescription = 'Ahsan Tariq is a game developer building gameplay systems, interactive worlds, and visually thoughtful experiences.';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: siteTitle, template: '%s · Ahsan Tariq' },
  description: siteDescription,
  keywords: ['Ahsan Tariq', 'game developer', 'gameplay programmer', 'Unity', 'Unreal Engine', 'portfolio'],
  authors: [{ name: 'Ahsan Tariq' }],
  creator: 'Ahsan Tariq',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: siteUrl,
    siteName: 'Ahsan Tariq',
    title: siteTitle,
    description: siteDescription,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
    creator: '@ahsanhere',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light" data-scroll-behavior="smooth" className={space.variable}>
      <head><noscript><style>{`[style*="visibility: hidden"],[style*="visibility:hidden"]{visibility:visible !important;opacity:1 !important;transform:none !important;}`}</style></noscript></head>
      <body><MotionLayer /><AnalyticsPing /><ProjectTransitionProvider>{children}</ProjectTransitionProvider></body>
    </html>
  );
}
