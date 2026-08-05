import type { Metadata } from 'next'
import { Figtree, Noto_Serif_Bengali } from 'next/font/google'
import { Providers } from '@/components/providers'

const figtree = Figtree({
  subsets: ['latin'],
  variable: '--font-figtree',
  display: 'swap'
})

const notoBengali = Noto_Serif_Bengali({
  subsets: ['bengali'],
  variable: '--font-noto-bengali',
  display: 'swap'
})

export const metadata: Metadata = {
  title: 'WeXpense',
  description: 'Collaborative financial management for individuals, families, and teams.',
  manifest: '/manifest.json',
  icons: { icon: '/icon.svg' }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${figtree.variable} ${notoBengali.variable}`} style={{ margin: 0 }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}