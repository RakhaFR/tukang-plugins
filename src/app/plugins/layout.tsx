import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://tukang-plugins.vercel.app'),
  title: 'Repository Plugin',
  description: 'Jelajahi semua koleksi plugin, mod, dan aset TheoTown. Download langsung dari Google Drive — terorganisir per folder, bebas duplikat.',
  keywords: ['repository plugin TheoTown', 'download mod TheoTown', 'aset TheoTown gratis', 'TukangPlugin repository'],
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    url: 'https://tukang-plugins.vercel.app/plugins',
    siteName: 'TukangPlugin',
    title: 'Repository Plugin | TukangPlugin',
    description: 'Jelajahi semua koleksi plugin, mod, dan aset TheoTown. Download langsung dari Google Drive — terorganisir per folder, bebas duplikat.',
    images: [{ url: '/hero.png', width: 1200, height: 630, alt: 'TukangPlugin Repository — Semua Plugin TheoTown' }],
    locale: 'id_ID',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Repository Plugin | TukangPlugin',
    description: 'Jelajahi semua koleksi plugin, mod, dan aset TheoTown. Download langsung dari Google Drive.',
    images: ['/hero.png'],
  },
};

export default function PluginsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}