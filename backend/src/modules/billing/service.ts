import Stripe from 'stripe'
import { getEnv } from '@/env'
import { badRequest } from '@/shared/errors'
import logger from '@/shared/utils/logger'
import { cacheDelKey } from '@/shared/db/redis'
import { publish } from '@/shared/realtime'
import { getDb } from '@/shared/db/mongo'
import { ConfigService } from '@/modules/config/service'
import { BillingRepo } from './repository'
import { BillingProvider, CheckoutResult, Subscription } from './interfaces'
import { Tier } from '@/shared/types'

class StripeProvider implements BillingProvider {
  private stripe: Stripe

  constructor() {
    this.stripe = new Stripe(getEnv().STRIPE_SECRET_KEY as string)
  }

  async createCheckout(userId: string, tier: Tier): Promise<CheckoutResult> {
    const priceId = tier === 'pro' ? getEnv().STRIPE_PRICE_PRO : getEnv().STRIPE_PRICE_TEAM
    if (!priceId) throw badRequest('No price configured for this tier', 'PRICE_MISSING')
    const service = new BillingService(new BillingRepo())
    const sub = await service.getSubscription(userId)
    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${getEnv().APP_URL}/settings/billing?success=1`,
      cancel_url: `${getEnv().APP_URL}/settings/billing`,
      customer: sub.stripeCustomerId,
      client_reference_id: userId,
      metadata: { userId, tier },
      subscription_data: { metadata: { userId, tier } }
    })
    return { url: session.url ?? `${getEnv().APP_URL}/settings/billing`, mock: false, tier }
  }

  async createPortal(userId: string): Promise<{ url: string; mock: boolean }> {
    const service = new BillingService(new BillingRepo())
    const sub = await service.getSubscription(userId)
    if (!sub.stripeCustomerId) throw badRequest('No billing customer yet', 'NO_CUSTOMER')
    const session = await this.stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: `${getEnv().APP_URL}/settings/billing`
    })
    return { url: session.url, mock: false }
  }

  async handleEvent(rawBody: string, signature: string | null, event: Record<string, unknown>): Promise<void> {
    if (!signature) throw badRequest('Missing webhook signature', 'NO_SIGNATURE')
    if (!getEnv().STRIPE_WEBHOOK_SECRET) throw badRequest('Webhook secret not configured', 'NO_WEBHOOK_SECRET')
    const stripeEvent = this.stripe.webhooks.constructEvent(rawBody, signature, getEnv().STRIPE_WEBHOOK_SECRET as string)
    const service = new BillingService(new BillingRepo())
    switch (stripeEvent.type) {
      case 'checkout.session.completed': {
        const session = stripeEvent.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        if (userId) {
          await service.applyProviderTier(
            userId,
            (session.metadata?.tier as Tier) ?? 'pro',
            session.customer as string,
            session.subscription as string
          )
        }
        break
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = stripeEvent.data.object as Stripe.Subscription
        const userId = sub.metadata?.userId
        if (!userId) return
        await service.applyProviderTier(
          userId,
          (sub.metadata?.tier as Tier | undefined) ?? (sub.status === 'active' ? 'pro' : 'hobby'),
          sub.customer as string,
          sub.id,
          sub.status as Subscription['status'],
          sub.current_period_end ? new Date(sub.current_period_end * 1000) : undefined
        )
        break
      }
    }
  }

  async cancelSubscription(userId: string): Promise<void> {
    const service = new BillingService(new BillingRepo())
    const sub = await service.getSubscription(userId)
    if (!sub.stripeSubscriptionId) throw badRequest('No subscription to cancel', 'NO_SUBSCRIPTION')
    await this.stripe.subscriptions.cancel(sub.stripeSubscriptionId)
  }
}

class LocalProvider implements BillingProvider {
  async createCheckout(_userId: string, tier: Tier): Promise<CheckoutResult> {
    return { url: `${getEnv().APP_URL}/settings/billing?mock=upgrade&tier=${tier}`, mock: true, tier }
  }

  async createPortal(): Promise<{ url: string; mock: boolean }> {
    return { url: `${getEnv().APP_URL}/settings/billing`, mock: true }
  }

  async handleEvent(_raw: string, _sig: string | null, event: Record<string, unknown>): Promise<void> {
    if (event.type !== 'checkout.session.completed' && event.type !== 'local.tier.updated') return
    const data = event.data as { userId?: string; tier?: Tier; object?: { metadata?: { userId?: string; tier?: Tier } } }
    const userId = data?.userId ?? data?.object?.metadata?.userId
    const tier = data?.tier ?? data?.object?.metadata?.tier
    if (userId && tier) {
      await new BillingService(new BillingRepo()).applyProviderTier(userId, tier)
    }
  }

  async cancelSubscription(userId: string): Promise<void> {
    await new BillingService(new BillingRepo()).applyProviderTier(userId, 'hobby', undefined, undefined, 'canceled')
  }
}

export type WalletCounter = (workspaceId: string) => Promise<number>
export type WorkspaceCounter = (userId: string) => Promise<number>

export class BillingService {
  private provider: BillingProvider

  constructor(
    private repo = new BillingRepo(),
    private counters: { workspacesByUser: WorkspaceCounter; walletsByWorkspace: WalletCounter } = {
      workspacesByUser: async (userId) => {
        const memberships = getDb().collection('workspace_members')
        return memberships.countDocuments({ userId, status: 'active', role: 'owner' })
      },
      walletsByWorkspace: async (workspaceId) => {
        const wallets = getDb().collection('wallets')
        return wallets.countDocuments({ workspaceId, archivedAt: null })
      }
    }
  ) {
    this.provider = getEnv().STRIPE_SECRET_KEY ? new StripeProvider() : new LocalProvider()
  }

  async getSubscription(userId: string): Promise<Subscription> {
    return (await this.repo.findByUser(userId)) ?? this.repo.upsert(userId, {})
  }

  async createCheckout(userId: string, tier: Tier): Promise<CheckoutResult> {
    if (tier === 'hobby') throw badRequest('Hobby is the free tier', 'FREE_TIER')
    const result = await this.provider.createCheckout(userId, tier)
    logger.info({ userId, tier, mock: result.mock }, 'checkout created')
    return result
  }

  async createPortal(userId: string) {
    return this.provider.createPortal(userId)
  }

  async cancelSubscription(userId: string): Promise<void> {
    await this.provider.cancelSubscription(userId)
  }

  async handleWebhook(rawBody: string, signature: string | null, event: Record<string, unknown>): Promise<void> {
    await this.provider.handleEvent(rawBody, signature, event)
  }

  async applyProviderTier(
    userId: string,
    tier: Tier,
    stripeCustomerId?: string,
    stripeSubscriptionId?: string,
    status: Subscription['status'] = 'active',
    currentPeriodEnd?: Date
  ): Promise<Subscription> {
    const sub = await this.repo.upsert(userId, {
      tier,
      status,
      stripeCustomerId,
      stripeSubscriptionId,
      currentPeriodEnd
    })
    await cacheDelKey(`billing:sub:${userId}`)
    await publish(`user:${userId}`, {
      type: 'subscription:changed',
      payload: { tier, status: sub.status },
      timestamp: Date.now()
    })
    return sub
  }

  async getTier(userId: string): Promise<Tier> {
    const sub = await this.getSubscription(userId)
    if (sub.status === 'canceled' || sub.status === 'past_due') return 'hobby'
    return sub.tier
  }

  async canCreateWorkspace(userId: string): Promise<{ ok: boolean; reason?: string }> {
    const tier = await this.getTier(userId)
    const limits = await this.limits(tier)
    if (limits.maxWorkspaces < 1_000_000) {
      const count = await this.counters.workspacesByUser(userId)
      if (count >= limits.maxWorkspaces) {
        return { ok: false, reason: `Your ${tier} plan allows ${limits.maxWorkspaces} workspace(s). Upgrade to add more.` }
      }
    }
    return { ok: true }
  }

  async requireTeamForShared(userId: string): Promise<void> {
    const tier = await this.getTier(userId)
    const limits = await this.limits(tier)
    if (!limits.sharedWorkspaces) {
      throw badRequest('Shared workspaces require the Team plan', 'TIER_TEAM_REQUIRED')
    }
  }

  async canCreateWallet(userId: string, workspaceId: string): Promise<{ ok: boolean; reason?: string }> {
    const tier = await this.getTier(userId)
    const limits = await this.limits(tier)
    if (limits.maxWallets < 1_000_000) {
      const count = await this.counters.walletsByWorkspace(workspaceId)
      if (count >= limits.maxWallets) {
        return { ok: false, reason: `Your ${tier} plan allows ${limits.maxWallets} wallets per workspace. Upgrade to add more.` }
      }
    }
    return { ok: true }
  }

  async canInviteMembers(userId: string): Promise<void> {
    const tier = await this.getTier(userId)
    const limits = await this.limits(tier)
    if (!limits.inviteMembers) {
      throw badRequest('Inviting members requires the Team plan', 'TIER_TEAM_REQUIRED')
    }
  }

  async limits(tier: Tier) {
    return new ConfigService().getTierLimits(tier)
  }

  async adminList(): Promise<Subscription[]> {
    return this.repo.list()
  }
}
