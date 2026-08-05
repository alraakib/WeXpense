import { Elysia, t } from 'elysia'
import { BillingService } from './service'
import { CheckoutSchema, AdminSubscriptionUpdateSchema } from './validation'
import { ok } from '@/shared/http'
import { authGroup, adminGroup } from '@/shared/middleware/auth'

const billing = new BillingService()

export const billingRoutes = new Elysia({ name: 'billing-routes' })
  .use(
    authGroup()
      .get('/api/billing/plan', async ({ user }) => {
        const subscription = await billing.getSubscription(user.id)
        const limits = await billing.limits(subscription.status === 'active' ? subscription.tier : 'hobby')
        return ok({ ...subscription, limits })
      })
      .post('/api/billing/checkout', async ({ user, body }) => {
        return ok(await billing.createCheckout(user.id, body.tier))
      }, { body: CheckoutSchema })
      .post('/api/billing/portal', async ({ user }) => ok(await billing.createPortal(user.id)))
      .post('/api/billing/cancel', async ({ user }) => {
        await billing.cancelSubscription(user.id)
        return ok({ canceled: true })
      })
  )
  .post('/api/billing/webhook', async ({ request, headers }) => {
    const raw = await request.text()
    const signature = headers['stripe-signature'] ?? null
    let event: Record<string, unknown> = {}
    try {
      event = raw ? (JSON.parse(raw) as Record<string, unknown>) : {}
    } catch {
      /* event parsed from signature flow when stripe */
    }
    await billing.handleWebhook(raw, signature, event)
    return ok({ received: true })
  })
  .use(
    adminGroup()
      .get('/api/admin/subscriptions', async () => ok(await billing.adminList()))
      .patch('/api/admin/subscriptions', async ({ body }) => {
        const sub = await billing.applyProviderTier(body.userId, body.tier, undefined, undefined, body.status ?? 'active')
        return ok(sub)
      }, { body: AdminSubscriptionUpdateSchema })
  )