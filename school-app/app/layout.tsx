import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';

export const metadata: Metadata = {
  title: 'Prathmik Vidyalaya Kareli Bagh | Prayagraj, Uttar Pradesh',
  description:
    'Official portal for Prathmik Vidyalaya Kareli Bagh, Prayagraj, UP. Explore school activities, campus facilities, faculty, announcements, and educational community updates.',
  keywords: [
    'Prathmik Vidyalaya Kareli Bagh',
    'Primary School Prayagraj',
    'Kareli Bagh School',
    'Basic Education Uttar Pradesh',
    'School Activities Prayagraj',
  ],
  authors: [{ name: 'Prathmik Vidyalaya Kareli Bagh' }],
  openGraph: {
    title: 'Prathmik Vidyalaya Kareli Bagh, Prayagraj',
    description:
      'Our School • Our Activities • Our Community — Nurturing primary education and student growth in Prayagraj.',
    siteName: 'Prathmik Vidyalaya Kareli Bagh',
    locale: 'en_IN',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-[#faf9f6] text-slate-800 antialiased">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
