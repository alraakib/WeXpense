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
  primaryColor: 'primary',
  primaryShade: { light: 3, dark: 3 },
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
  shadows: {
    xs: 'none',
    sm: 'none',
    md: 'none',
    lg: 'none',
    xl: 'none'
  },
  colors: {
    primary: [
      '#ebeeff',
      '#a6bfff',
      '#88b1ff',
      '#5561ff',
      '#3241ff',
      '#2b38cc',
      '#1f289c',
      '#1a2280',
      '#151c68',
      '#0f1450'
    ],
    success: [
      '#ecf7ee',
      '#b6e6b7',
      '#97db9a',
      '#6dab8e',
      '#4caf50',
      '#3f9643',
      '#2e6831',
      '#275829',
      '#204a22',
      '#1a3c1c'
    ],
    warning: [
      '#fff9f6',
      '#ffe699',
      '#ffdb6f',
      '#ffcc31',
      '#ffc107',
      '#d9a80a',
      '#b38705',
      '#9a7504',
      '#806204',
      '#664f03'
    ],
    error: [
      '#feeceb',
      '#f8b2ad',
      '#f9928a',
      '#f66358',
      '#e43e36',
      '#cc3730',
      '#952921',
      '#7f231c',
      '#6a1e18',
      '#551814'
    ],
    neutral: [
      '#eff2f5',
      '#becdcf',
      '#a2b4bc',
      '#7b939f',
      '#60788b',
      '#4d6270',
      '#3b4c55',
      '#324148',
      '#28363b',
      '#1f2b2e'
    ],
    gray: [
      '#eff2f5',
      '#becdcf',
      '#a2b4bc',
      '#7b939f',
      '#60788b',
      '#4d6270',
      '#3b4c55',
      '#324148',
      '#28363b',
      '#1f2b2e'
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