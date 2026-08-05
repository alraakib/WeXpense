export interface MonthlySnapshot {
  _id: string
  workspaceId: string
  month: string
  baseCurrency: string
  incomeMinor: number
  expenseMinor: number
  byCategory: Array<{ categoryId: string; amountMinor: number; count: number }>
  byWallet: Array<{ walletId: string; amountMinor: number }>
  createdAt: Date
  updatedAt: Date
}

export interface DashboardData {
  month: string
  baseCurrency: string
  incomeMinor: number
  expenseMinor: number
  balanceMinor: number
  savingsMinor: number
  byCategory: Array<{ categoryId: string; amountMinor: number; count: number }>
  byWallet: Array<{ walletId: string; amountMinor: number }>
  trend: Array<{ month: string; incomeMinor: number; expenseMinor: number }>
  recentTransactions: Array<Record<string, unknown>>
}

export interface TrendPoint {
  month: string
  incomeMinor: number
  expenseMinor: number
}
