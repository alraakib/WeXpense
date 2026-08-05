export interface GoalContribution {
  id: string
  walletId: string
  amountMinor: number
  date: string
  note?: string
}

export interface Goal {
  _id: string
  workspaceId: string
  name: string
  targetMinor: number
  currency: string
  targetDate?: string | null
  status: 'active' | 'complete' | 'archived'
  createdBy: string
  contributions: GoalContribution[]
  completedAt?: Date | null
  archivedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface GoalWithMeta extends Goal {
  savedMinor: number
  progressPercent: number
  milestones: Array<{ milestone: 25 | 50 | 75 | 100; reached: boolean }>
  daysLeft?: number | null
}

export interface CreateGoalInput {
  name: string
  target: number
  currency: string
  targetDate?: string
}

export interface ContributeInput {
  walletId: string
  amount: number
  note?: string
}
