import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '../index.css';

const title = 'OmniStore & BigQuery Lakehouse';
const description = 'Multi-cloud storage explorer with PostgreSQL cataloging, schema mapping, and automated BigQuery ingestion with Pandas profiling.';

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400..700;1,9..40,400..700&family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-slate-900 text-slate-100 antialiased font-sans selection:bg-sky-500/30 selection:text-sky-200">
        {children}
      </body>
    </html>
  );
}
