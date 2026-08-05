import { Tier } from '@/shared/types'

export interface Subscription {
  _id: string
  userId: string
  tier: Tier
  status: 'active' | 'canceled' | 'past_due' | 'trialing'
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  currentPeriodEnd?: Date
  canceledAt?: Date
  updatedAt: Date
  createdAt: Date
}

export interface CheckoutResult {
  url: string
  mock: boolean
  tier: Tier
}

export interface BillingProvider {
  createCheckout(userId: string, tier: Tier): Promise<CheckoutResult>
  createPortal(userId: string): Promise<{ url: string; mock: boolean }>
  handleEvent(rawBody: string, signature: string | null, event: Record<string, unknown>): Promise<void>
  cancelSubscription(userId: string): Promise<void>
}
