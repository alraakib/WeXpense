'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useAppStore } from './store'
import {
  analyticsApi,
  billingApi,
  budgetsApi,
  categoriesApi,
  goalsApi,
  notificationsApi,
  recurringApi,
  tagsApi,
  transactionsApi,
  usersApi,
  walletsApi,
  workspacesApi
} from './endpoints'

const REFRESH_KEYS = new Set(['transactions', 'goals', 'budgets', 'recurring', 'wallets', 'dashboard', 'notifications'])

export function useWebSocket(): void {
  const queryClient = useQueryClient()
  const workspace = useAppStore((s) => s.workspace)

  useEffect(() => {
    let ws: WebSocket | null = null
    let retry = 0
    let closed = false

    const connect = () => {
      const token = localStorage.getItem('ws-token')
      const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const host = process.env.NEXT_PUBLIC_WS_URL ?? `${proto}//${window.location.host}`
      ws = new WebSocket(`${host}/ws${token ? `?token=${token}` : ''}`)
      ws.onopen = () => (retry = 0)
      ws.onclose = () => {
        if (!closed) {
          const wait = Math.min(15000, 500 * 2 ** retry++)
          setTimeout(connect, wait)
        }
      }
      ws.onmessage = (ev) => {
        try {
          const env = JSON.parse(ev.data) as { data?: { type?: string } }
          const type = env?.data?.type ?? ''
          const ch = FORWARD.has(type) ? type : null
          if (ch) {
            queryClient.invalidateQueries({ queryKey: [ch] })
          }
        } catch {
          /* ignore */
        }
      }
    }

    const FORWARD = new Map<string, string[]>([
      ['transaction:created', ['transactions']],
      ['transaction:updated', ['transactions']],
      ['transaction:deleted', ['transactions']],
      ['wallet:balance_updated', ['wallets']],
      ['budget:threshold', ['budgets']],
      ['goal:milestone', ['goals']],
      ['goals:updated', ['goals']],
      ['recurring:upcoming', ['recurring']],
      ['snapshot:updated', ['dashboard']],
      ['notification:new', ['notifications']]
    ])

    connect()
    return () => {
      closed = true
      ws?.close()
    }
  }, [queryClient, workspace?._id])
}

export function useWorkspaces() {
  return useQuery({ queryKey: ['workspaces'], queryFn: workspacesApi.list })
}

export function useUser() {
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const me = await usersApi.me()
      useAppStore.getState().setUser(me)
      return me
    }
  })
}

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const s = await usersApi.settings()
      useAppStore.getState().setSettings(s)
      return s
    }
  })
}

export function usePlan() {
  return useQuery({ queryKey: ['plan'], queryFn: billingApi.plan })
}

export function useNotifications() {
  return useQuery({ queryKey: ['notifications'], queryFn: notificationsApi.list })
}

export function useWallets(wsId?: string) {
  return useQuery({ queryKey: ['wallets', wsId], queryFn: () => walletsApi.list(wsId!), enabled: !!wsId })
}

export function useTransactions(wsId: string | undefined, query: Record<string, string | number | undefined> = {}) {
  return useQuery({
    queryKey: ['transactions', wsId, query],
    queryFn: () => transactionsApi.list(wsId!, query),
    enabled: !!wsId
  })
}

export function useGoals(wsId?: string) {
  return useQuery({ queryKey: ['goals', wsId], queryFn: () => goalsApi.list(wsId!), enabled: !!wsId })
}

export function useBudgets(wsId?: string) {
  return useQuery({ queryKey: ['budgets', wsId], queryFn: () => budgetsApi.list(wsId!), enabled: !!wsId })
}

export function useRecurring(wsId?: string) {
  return useQuery({ queryKey: ['recurring', wsId], queryFn: () => recurringApi.list(wsId!), enabled: !!wsId })
}

export function useCategories(wsId?: string) {
  return useQuery({ queryKey: ['categories', wsId], queryFn: () => categoriesApi.list(wsId!), enabled: !!wsId })
}

export function useTags(wsId?: string) {
  return useQuery({ queryKey: ['tags', wsId], queryFn: () => tagsApi.list(wsId!), enabled: !!wsId })
}

export function useDashboard(wsId?: string, month?: string) {
  return useQuery({ queryKey: ['dashboard', wsId, month], queryFn: () => analyticsApi.dashboard(wsId!, month), enabled: !!wsId })
}

export function invalidateRefreshKeys(queryClient: ReturnType<typeof useQueryClient>, wsId?: string) {
  for (const k of REFRESH_KEYS) {
    queryClient.invalidateQueries({ queryKey: [k] })
    if (wsId) queryClient.invalidateQueries({ queryKey: [k, wsId] })
  }
}

export const REFRESH_KEYS_AS_CONST = Array.from(REFRESH_KEYS)