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


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${headingFont.variable} ${bodyFont.variable}`}>
      <body className="bg-gray-900 text-gray-100 font-body antialiased">
        {children}
      </body>
    </html>
  );
}