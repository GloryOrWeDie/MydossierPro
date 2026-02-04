import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DossierPro - Professional Rental Applications',
  description: 'Create a professional rental application in 5 minutes. Stand out from other applicants and get approved faster. 100% free, no credit card required.',
  keywords: 'rental application, apartment application, tenant dossier, rental dossier, apply for apartment',
  openGraph: {
    title: 'DossierPro - Land Your Dream Apartment',
    description: 'Create professional rental applications in minutes',
    url: 'https://dossierpro.com',
    siteName: 'DossierPro',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en-US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DossierPro - Professional Rental Applications',
    description: 'Create professional rental applications in minutes',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navigation />
        {children}
      </body>
    </html>
  );
}
