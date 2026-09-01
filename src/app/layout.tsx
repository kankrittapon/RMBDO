import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BDO Progression Optimizer & Tactical HUD v2026',
  description: 'High-density gaming progression, build optimizer, and analytics dashboard for Black Desert Online (TH-SEA / Global 2026).',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-bg-canvas text-text-primary antialiased min-h-screen selection:bg-brand-primary selection:text-white">
        {children}
      </body>
    </html>
  );
}
