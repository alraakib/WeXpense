export interface TierLimits {
  maxWorkspaces: number
  maxWallets: number
  sharedWorkspaces: boolean
  customCategories: boolean
  inviteMembers: boolean
}

export interface GlobalConfig {
  _id: 'global'
  appName: string
  maintenance: boolean
  currencies: string[]
  rates: { date: string; base: string; rates: Record<string, number>; source: string } | null
  tiers: Record<'hobby' | 'pro' | 'team', TierLimits>
  updatedAt: Date
}

export interface UpdateConfigInput {
  appName?: string
  maintenance?: boolean
  currencies?: string[]
  tiers?: Partial<Record<'hobby' | 'pro' | 'team', Partial<TierLimits>>>
}
