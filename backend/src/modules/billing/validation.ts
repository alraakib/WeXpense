import { t } from 'elysia'

export const CheckoutSchema = t.Object({
  tier: t.Union([t.Literal('hobby'), t.Literal('pro'), t.Literal('team')])
})

export const AdminSubscriptionUpdateSchema = t.Object({
  userId: t.String(),
  tier: t.Union([t.Literal('hobby'), t.Literal('pro'), t.Literal('team')]),
  status: t.Optional(t.Union([t.Literal('active'), t.Literal('canceled'), t.Literal('past_due'), t.Literal('trialing')]))
})
