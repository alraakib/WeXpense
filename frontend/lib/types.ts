export type Role = 'owner' | 'admin' | 'contributor' | 'viewer'
export type Tier = 'hobby' | 'pro' | 'team'

export interface AuthUser {
  id: string
  email: string
  name: string
  role?: string
  image?: string | null
}

export interface UserProfile {
  _id: string
  name: string
  email: string
  image?: string | null
  role?: string
  createdAt?: string
}

export interface UserSettings {
  _id: string
  userId: string
  baseCurrency: string
  language: string
  theme: 'light' | 'dark' | 'system'
  timezone: string
  onboardingCompleted: boolean
  notifyEmail: NotificationPrefs
}

export interface NotificationPrefs {
  budget: boolean
  goal: boolean
  recurring: boolean
  invite: boolean
  billing: boolean
  system: boolean
}

export interface Workspace {
  _id: string
  name: string
  type: 'personal' | 'shared'
  baseCurrency: string
  createdBy: string
  archivedAt?: string | null
  createdAt: string
}

export interface WorkspaceWithMeta extends Workspace {
  role: Role
  memberCount: number
  membershipStatus: string
}

export interface Membership {
  _id: string
  workspaceId: string
  userId: string
  role: Role
  status: 'invited' | 'pending' | 'active' | 'rejected'
  user?: { name?: string; email?: string }
  joinedAt?: string
}

export interface Wallet {
  _id: string
  workspaceId: string
  name: string
  currency: string
  initialBalanceMinor: number
  balanceMinor: number
  heldMinor: number
  equivalentMinor?: number
  equivalentCurrency?: string
  archivedAt?: string | null
}

export type TransactionType = 'income' | 'expense' | 'transfer'

export interface Transaction {
  _id: string
  workspaceId: string
  walletId: string
  type: TransactionType
  amountMinor: number
  currency: string
  transferToWalletId?: string | null
  categoryId?: string | null
  tags: string[]
  date: string
  notes?: string | null
  paidBy: string
  splitWith: Array<{ userId: string; amountMinor: number }>
  category?: { id: string; name: string; icon?: string; color?: string } | null
  walletName?: string
  walletCurrency: string
  tagDetails?: Array<{ id: string; name: string; color?: string }>
  paidByName?: string | null
  createdAt: string
}

export interface Category {
  _id: string
  name: string
  icon?: string
  color?: string
  parentId?: string | null
  isDefault: boolean
}

export interface Tag {
  _id: string
  name: string
  color?: string
}

export interface GoalContribution {
  id: string
  walletId: string
  amountMinor: number
  date: string
}

export interface Goal {
  _id: string
  name: string
  targetMinor: number
  currency: string
  targetDate?: string | null
  status: 'active' | 'complete' | 'archived'
  contributions: GoalContribution[]
  savedMinor?: number
  progressPercent?: number
  milestones?: Array<{ milestone: 25 | 50 | 75 | 100; reached: boolean }>
  daysLeft?: number | null
}

export interface Budget {
  _id: string
  categoryId: string
  amountMinor: number
  currency: string
  period: 'monthly' | 'yearly'
  rollover: boolean
  active: boolean
  spendMinor?: number
  percent?: number
  remainingMinor?: number
  category?: { name?: string; icon?: string; color?: string } | null
}

export interface RecurringRule {
  _id: string
  walletId: string
  categoryId?: string | null
  amountMinor: number
  currency: string
  frequency: 'daily' | 'weekly' | 'monthly'
  nextDueDate: string
  active: boolean
  notes?: string | null
  paidCount: number
  walletName?: string
  isUpcoming?: boolean
}

export interface AppNotification {
  _id: string
  type: string
  title: string
  body: string
  read: boolean
  createdAt: string
}

export interface CategoryBreakdownPoint {
  categoryId: string
  amountMinor: number
  count: number
  category?: { name?: string; icon?: string; color?: string }
}

export interface DashboardData {
  month: string
  baseCurrency: string
  incomeMinor: number
  expenseMinor: number
  balanceMinor: number
  savingsMinor: number
  byCategory: CategoryBreakdownPoint[]
  byWallet: Array<{ walletId: string; amountMinor: number; walletName?: string }>
  trend: Array<{ month: string; incomeMinor: number; expenseMinor: number }>
  recentTransactions: Transaction[]
}

export interface TrendPoint {
  month: string
  incomeMinor: number
  expenseMinor: number
}

export interface PlanInfo {
  tier: Tier
  limits: { maxWorkspaces: number; maxWallets: number; sharedWorkspaces: boolean; customCategories: boolean; inviteMembers: boolean }
  active: boolean
}