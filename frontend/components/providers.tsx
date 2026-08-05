'use client'

import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import '@mantine/spotlight/styles.css'
import '@mantine/dates/styles.css'
import '../app/globals.css'

import { MantineProvider, createTheme } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { ModalsProvider } from '@mantine/modals'
import { Spotlight } from '@mantine/spotlight'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

const theme = createTheme({
  primaryColor: 'brand',
  primaryShade: 6,
  defaultRadius: 'md',
  fontFamily:
    "var(--font-figtree), var(--font-noto-bengali), 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  headings: {
    fontFamily:
      "var(--font-figtree), var(--font-noto-bengali), 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontWeight: '300',
    sizes: {
      h1: { fontSize: '2.6rem', lineHeight: '1.03' },
      h2: { fontSize: '2rem', lineHeight: '1.1' },
      h3: { fontSize: '1.375rem', lineHeight: '1.1' },
      h4: { fontSize: '1.25rem', lineHeight: '1.4' }
    }
  },
  colors: {
    brand: [
      '#f1f0ff',
      '#e3e0fe',
      '#c7c2fb',
      '#b9b9f9',
      '#8d84f7',
      '#665efd',
      '#533afd',
      '#4434d4',
      '#2e2b8c',
      '#1c1e54'
    ]
  }
})

export function Providers({ children }: { children: React.ReactNode }) {
  const [qc] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false }
        }
      })
  )

  return (
    <QueryClientProvider client={qc}>
      <MantineProvider theme={theme}>
        <ModalsProvider>
          <Notifications position="top-right" />
          {children}
        </ModalsProvider>
      </MantineProvider>
    </QueryClientProvider>
  )
}