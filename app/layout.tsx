import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'SankaVerse - Cyberpunk Anime & Comic Nexus',
  description: 'Production-grade streaming and comic reading hub integrated with Sanka Vollerei API featuring anime, donghua, manga, Desustream player, and offline library.',
  openGraph: {
    title: 'SankaVerse - Cyberpunk Anime & Comic Nexus',
    description: 'Production-grade streaming and comic reading hub integrated with Sanka Vollerei API featuring anime, donghua, manga, Desustream player, and offline library.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SankaVerse - Cyberpunk Anime & Comic Nexus',
    description: 'Production-grade streaming and comic reading hub integrated with Sanka Vollerei API featuring anime, donghua, manga, Desustream player, and offline library.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className="dark bg-zinc-950 text-zinc-100 selection:bg-red-600/30 selection:text-red-300">
      <body suppressHydrationWarning className="min-h-screen bg-zinc-950 text-zinc-100 antialiased overflow-x-hidden">{children}</body>
    </html>
  );
}
