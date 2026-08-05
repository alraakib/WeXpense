export interface Budget {
  _id: string
  workspaceId: string
  categoryId: string
  amountMinor: number
  currency: string
  period: 'monthly' | 'yearly'
  rollover: boolean
  active: boolean
  lastAlerted?: { month: string; thresholds: number[] }
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface BudgetWithSpend extends Budget {
  spendMinor: number
  spendCurrency: string
  percent: number
  remainingMinor: number
}

export interface CreateBudgetInput {
  categoryId: string
  amount: number
  currency: string
  period?: 'monthly' | 'yearly'
  rollover?: boolean
}
