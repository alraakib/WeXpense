export interface NotificationPrefs {
  budget: boolean
  goal: boolean
  recurring: boolean
  invite: boolean
  billing: boolean
  system: boolean
}

export interface UserSettings {
  _id: string
  userId: string
  baseCurrency: string
  theme: 'light' | 'dark' | 'system'
  timezone: string
  onboardingCompleted: boolean
  notifyEmail: NotificationPrefs
  notifyPush: NotificationPrefs
  createdAt: Date
  updatedAt: Date
}

export interface UserProfile {
  id: string
  name: string
  email: string
  image?: string | null
  emailVerified: boolean
  role: string
  createdAt?: Date
}

export interface CompleteOnboardingInput {
  baseCurrency: string
  walletName?: string
  walletCurrency?: string
  initialBalance?: number
  goalName?: string
  goalTarget?: number
}
