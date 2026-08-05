import { t } from 'elysia'

export const TierLimitsSchema = t.Object({
  maxWorkspaces: t.Number(),
  maxWallets: t.Number(),
  sharedWorkspaces: t.Boolean(),
  customCategories: t.Boolean(),
  inviteMembers: t.Boolean()
})

export const UpdateConfigSchema = t.Object({
  appName: t.Optional(t.String({ minLength: 1, maxLength: 50 })),
  maintenance: t.Optional(t.Boolean()),
  currencies: t.Optional(t.Array(t.String({ minLength: 3, maxLength: 5 }))),
  tiers: t.Optional(
    t.Object({
      hobby: t.Optional(TierLimitsSchema),
      pro: t.Optional(TierLimitsSchema),
      team: t.Optional(TierLimitsSchema)
    })
  )
})
