import type { Metadata } from 'next'
import { Providers } from '@/components/providers'

export const metadata: Metadata = {
  title: 'WeXpense',
  description: 'Collaborative financial management for individuals, families, and teams.',
  manifest: '/manifest.json',
  icons: { icon: '/icon.svg' }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}