import { api, get, post, put, del, qs, postRaw } from './api'
import type {
  AppNotification,
  Budget,
  Category,
  CategoryBreakdownPoint,
  DashboardData,
  Goal,
  Membership,
  PlanInfo,
  RecurringRule,
  Tag,
  Tier,
  Transaction,
  TransactionType,
  TrendPoint,
  UserProfile,
  UserSettings,
  Wallet,
  WorkspaceWithMeta
} from './types'

export const authApi = {
  signin: (email: string, password: string) =>
    postRaw<{ token?: string }>('/api/auth/sign-in/email', { email, password }),
  signup: (email: string, password: string, name: string) =>
    postRaw<{ token?: string }>('/api/auth/sign-up/email', { email, password, name }),
  signout: () => postRaw('/api/auth/sign-out')
}

export const usersApi = {
  me: () => get<UserProfile>('/api/users/me'),
  settings: () => get<UserSettings>('/api/users/me/settings'),
  updateSettings: (body: Partial<Omit<UserSettings, '_id' | 'userId'>>) => {
    return api<UserSettings>('/api/users/me/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
  },
  export: () => get<Record<string, unknown>>('/api/users/export')
}

export const workspacesApi = {
  list: () => get<WorkspaceWithMeta[]>('/api/workspaces'),
  get: (id: string) => get<WorkspaceWithMeta>(`/api/workspaces/${id}`),
  create: (body: { name: string; type?: 'personal' | 'shared'; baseCurrency?: string }) =>
    post<WorkspaceWithMeta>('/api/workspaces', body),
  update: (id: string, body: { name?: string; baseCurrency?: string }) => put<WorkspaceWithMeta>(`/api/workspaces/${id}`, body),
  del: (id: string) => del(`/api/workspaces/${id}`),
  members: (id: string) => get<Membership[]>(`/api/workspaces/${id}/members`),
  inviteLink: (id: string, body: { role?: string; expiresInDays?: number }) => post<{ token: string; url: string }>(`/api/workspaces/${id}/invite-link`, body),
  inviteEmail: (id: string, body: { email: string; role: string }) => post(`/api/workspaces/${id}/invites`, body),
  join: (id: string, token: string) => post(`/api/workspaces/${id}/join`, { token }),
  approve: (id: string, userId: string) => post(`/api/workspaces/${id}/members/${userId}/approve`),
  reject: (id: string, userId: string) => post(`/api/workspaces/${id}/members/${userId}/reject`),
  removeMember: (id: string, userId: string) => del(`/api/workspaces/${id}/members/${userId}`),
  leave: (id: string) => del(`/api/workspaces/${id}/leave`),
  audit: (id: string) => get<Array<Record<string, unknown>>>(`/api/workspaces/${id}/audit`)
}

export const walletsApi = {
  list: (wsId: string) => get<Wallet[]>(`/api/workspaces/${wsId}/wallets`),
  get: (wsId: string, id: string) => get<Wallet>(`/api/workspaces/${wsId}/wallets/${id}`),
  create: (wsId: string, body: { name: string; currency: string; initialBalance?: number }) =>
    post<Wallet>(`/api/workspaces/${wsId}/wallets`, body),
  update: (wsId: string, id: string, body: { name?: string }) =>
    put<Wallet>(`/api/workspaces/${wsId}/wallets/${id}`, body),
  archive: (wsId: string, id: string) => del<Wallet>(`/api/workspaces/${wsId}/wallets/${id}`)
}

export const categoriesApi = {
  list: (wsId: string) => get<Category[]>(`/api/workspaces/${wsId}/categories`),
  create: (wsId: string, body: { name: string; icon?: string; color?: string }) =>
    post<Category>(`/api/workspaces/${wsId}/categories`, body)
}

export const tagsApi = {
  list: (wsId: string) => get<Tag[]>(`/api/workspaces/${wsId}/tags`),
  create: (wsId: string, body: { name: string; color?: string }) => post<Tag>(`/api/workspaces/${wsId}/tags`, body)
}

export interface TransactionQuery {
  page?: number
  limit?: number
  type?: TransactionType
  walletId?: string
  categoryId?: string
  tag?: string
  dateFrom?: string
  dateTo?: string
  search?: string
}

export const transactionsApi = {
  list: (wsId: string, query: TransactionQuery = {}) =>
    get<{ data: Transaction[]; total: number; page: number; pages: number }>(
      `/api/workspaces/${wsId}/transactions${qs({ limit: 50, ...query })}`
    ),
  get: (wsId: string, id: string) => get<Transaction>(`/api/workspaces/${wsId}/transactions/${id}`),
  create: (wsId: string, body: Record<string, unknown>) => post<Transaction>(`/api/workspaces/${wsId}/transactions`, body),
  update: (wsId: string, id: string, body: Record<string, unknown>) =>
    put<Transaction>(`/api/workspaces/${wsId}/transactions/${id}`, body),
  del: (wsId: string, id: string) => del(`/api/workspaces/${wsId}/transactions/${id}`)
}

export const goalsApi = {
  list: (wsId: string) => get<Goal[]>(`/api/workspaces/${wsId}/goals`),
  get: (wsId: string, id: string) => get<Goal>(`/api/workspaces/${wsId}/goals/${id}`),
  create: (wsId: string, body: { name: string; target: number; currency: string; targetDate?: string }) =>
    post<Goal>(`/api/workspaces/${wsId}/goals`, body),
  del: (wsId: string, id: string) => del(`/api/workspaces/${wsId}/goals/${id}`),
  contribute: (wsId: string, id: string, body: { walletId: string; amount: number }) =>
    post<Goal>(`/api/workspaces/${wsId}/goals/${id}/contribute`, body),
  complete: (wsId: string, id: string) => post<Goal>(`/api/workspaces/${wsId}/goals/${id}/complete`)
}

export const budgetsApi = {
  list: (wsId: string) => get<Budget[]>(`/api/workspaces/${wsId}/budgets`),
  create: (wsId: string, body: { categoryId: string; amount: number; currency: string; period?: 'monthly' | 'yearly'; rollover?: boolean }) =>
    post<Budget>(`/api/workspaces/${wsId}/budgets`, body),
  del: (wsId: string, id: string) => del(`/api/workspaces/${wsId}/budgets/${id}`)
}

export const recurringApi = {
  list: (wsId: string) => get<RecurringRule[]>(`/api/workspaces/${wsId}/recurring`),
  create: (wsId: string, body: { walletId: string; amount: number; frequency: 'daily' | 'weekly' | 'monthly'; firstDueDate?: string; active?: boolean; notes?: string; categoryId?: string }) =>
    post<RecurringRule>(`/api/workspaces/${wsId}/recurring`, body),
  del: (wsId: string, id: string) => del(`/api/workspaces/${wsId}/recurring/${id}`),
  paid: (wsId: string, id: string) => post<RecurringRule>(`/api/workspaces/${wsId}/recurring/${id}/paid`)
}

export const analyticsApi = {
  dashboard: (wsId: string, month?: string) =>
    get<DashboardData>(`/api/workspaces/${wsId}/dashboard${qs({ month })}`),
  categories: (wsId: string, month?: string) =>
    get<CategoryBreakdownPoint[]>(`/api/workspaces/${wsId}/analytics/categories${qs({ month })}`),
  trend: (wsId: string, months = 6) =>
    get<TrendPoint[]>(`/api/workspaces/${wsId}/analytics/trend${qs({ months })}`)
}

export const billingApi = {
  plan: () => get<PlanInfo>('/api/billing/plan'),
  checkout: (tier: string) => post<{ url: string }>('/api/billing/checkout', { tier }),
  portal: () => post<{ url: string }>('/api/billing/portal'),
  cancel: () => post('/api/billing/cancel')
}

export const notificationsApi = {
  list: () => get<AppNotification[]>('/api/notifications'),
  unread: () => get<number>('/api/notifications/unread-count'),
  read: (id: string) => post(`/api/notifications/${id}/read`),
  readAll: () => post('/api/notifications/read-all')
}

export const onboardingApi = {
  complete: (body: { baseCurrency: string; walletName?: string; walletCurrency?: string; initialBalance?: number; goalName?: string; goalTarget?: number }) =>
    post<Record<string, unknown>>('/api/onboarding/complete', body)
}

export const adminApi = {
  flags: () => get<Record<string, boolean>>('/api/admin/flags'),
  setFlag: (key: string, workspaceId: string | undefined, enabled: boolean) =>
    put<{ key: string; enabled: boolean }>(`/api/admin/flags/${key}${wsQuery(workspaceId)}`, { enabled }),
  config: () => get<Record<string, unknown>>('/api/config'),
  updateConfig: (body: Record<string, unknown>) => put('/api/admin/config', body),
  refreshRates: () => post('/api/admin/config/refresh-rates')
}

function wsQuery(workspaceId?: string): string {
  return workspaceId ? `?workspaceId=${encodeURIComponent(workspaceId)}` : ''
}

export { api }
export type { Tier }