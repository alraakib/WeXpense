export interface RecurringRule {
  _id: string
  workspaceId: string
  walletId: string
  categoryId?: string | null
  amountMinor: number
  currency: string
  frequency: 'daily' | 'weekly' | 'monthly'
  nextDueDate: Date
  active: boolean
  notes?: string | null
  createdBy: string
  paidCount: number
  lastProcessedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface RecurringRuleWithMeta extends RecurringRule {
  walletName?: string
  isUpcoming: boolean
}

export interface CreateRecurringInput {
  walletId: string
  categoryId?: string | null
  amount: number
  frequency: 'daily' | 'weekly' | 'monthly'
  firstDueDate?: string
  active?: boolean
  notes?: string
}

export interface UpdateRecurringInput {
  walletId?: string
  categoryId?: string | null
  amount?: number
  frequency?: 'daily' | 'weekly' | 'monthly'
  nextDueDate?: string
  active?: boolean
  notes?: string | null
}
