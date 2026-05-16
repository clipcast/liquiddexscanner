import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LiquidDexScanner — Base Chain Token Explorer',
  description: 'Real-time token explorer for Liquid Protocol on Base. New tokens, trending, charts, sniper auctions, vault & airdrop data.',
  openGraph: {
    title: 'LiquidDexScanner',
    description: 'Real-time token explorer for Liquid Protocol on Base',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}
