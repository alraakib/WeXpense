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
  primaryColor: 'indigo',
  defaultRadius: 'md'
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