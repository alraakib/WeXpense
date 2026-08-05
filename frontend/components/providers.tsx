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
  primaryShade: { light: 3, dark: 4 },
  defaultRadius: 'md',
  fontFamily:
    "var(--font-figtree), var(--font-noto-bengali), 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  headings: {
    fontFamily:
      "var(--font-figtree), var(--font-noto-bengali), 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontWeight: '500',
    sizes: {
      h1: { fontSize: '2.25rem', lineHeight: '1.03' },
      h2: { fontSize: '1.75rem', lineHeight: '1.1' },
      h3: { fontSize: '1.25rem', lineHeight: '1.2' },
      h4: { fontSize: '1.1rem', lineHeight: '1.4' }
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
    ],
    dark: [
      '#c9cdd4',
      '#a8acb4',
      '#878c97',
      '#676c7a',
      '#464d5d',
      '#3b4252',
      '#2e3548',
      '#232a3a',
      '#191f2c',
      '#0f1117'
    ]
  },
  components: {
    AppShell: {
      styles: {
        main: {
          background: 'transparent'
        },
        header: {
          background: 'var(--mantine-color-dark-8)',
          borderBottom: '1px solid var(--mantine-color-dark-5)'
        },
        navbar: {
          background: 'var(--mantine-color-dark-8)',
          borderRight: '1px solid var(--mantine-color-dark-5)'
        }
      }
    },
    NavLink: {
      styles: {
        root: {
          borderRadius: 'var(--mantine-radius-sm)'
        }
      }
    },
    Paper: {
      defaultProps: {
        withBorder: true
      }
    },
    Card: {
      defaultProps: {
        withBorder: true
      }
    },
    Table: {
      styles: {
        th: {
          fontWeight: 600,
          fontSize: '0.75rem',
          textTransform: 'uppercase' as const,
          letterSpacing: '0.05em'
        }
      }
    }
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