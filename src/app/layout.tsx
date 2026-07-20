import type { Metadata } from 'next';
import { Russo_One, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const headingFont = Russo_One({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-heading',
});

const bodyFont = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://tukang-plugins.vercel.app'),
  title: {
    default: 'TukangPlugin — Plugin & Aset TheoTown Terlengkap',
    template: '%s | TukangPlugin',
  },
  description: 'Cari, pantau, dan unduh plugin serta aset kustom berkualitas tinggi untuk kota digital kamu di TheoTown. Gratis, rapi, dan bebas error.',
  keywords: ['TheoTown', 'plugin TheoTown', 'download plugin', 'aset TheoTown', 'mod TheoTown', 'TukangPlugin', 'BangRiyadi'],
  authors: [{ name: 'BangRiyadi Community' }],
  creator: 'BangRiyadi Community',
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    url: 'https://tukang-plugins.vercel.app',
    siteName: 'TukangPlugin',
    title: 'TukangPlugin — Plugin & Aset TheoTown Terlengkap',
    description: 'Cari, pantau, dan unduh plugin serta aset kustom berkualitas tinggi untuk kota digital kamu di TheoTown. Gratis, rapi, dan bebas error.',
    images: [{ url: 'https://tukang-plugins.vercel.app/hero.png', width: 1200, height: 630, alt: 'TukangPlugin — Plugin TheoTown' }],
    locale: 'id_ID',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TukangPlugin — Plugin & Aset TheoTown Terlengkap',
    description: 'Cari, pantau, dan unduh plugin serta aset kustom berkualitas tinggi untuk kota digital kamu di TheoTown.',
    images: ['/hero.png'],
  },
  icons: { icon: '/favicon.ico', apple: '/apple-touch-icon.png' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${headingFont.variable} ${bodyFont.variable}`} style={{ scrollBehavior: 'smooth' }}>
      <body className="bg-gray-900 text-gray-100 font-body antialiased">
        {children}
      </body>
    </html>
  );
}