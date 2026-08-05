import { t } from 'elysia'

export const UpdateProfileSchema = t.Object({
  name: t.Optional(t.String({ minLength: 1, maxLength: 80 })),
  image: t.Optional(t.Null(t.String({ maxLength: 2000 })))
})

export const UpdateSettingsSchema = t.Partial(
  t.Object({
    baseCurrency: t.String({ minLength: 3, maxLength: 5 }),
    theme: t.Union([t.Literal('light'), t.Literal('dark'), t.Literal('system')]),
    timezone: t.String({ minLength: 1, maxLength: 60 }),
    onboardingCompleted: t.Boolean(),
    notifyEmail: t.Partial(
      t.Object({
        budget: t.Boolean(),
        goal: t.Boolean(),
        recurring: t.Boolean(),
        invite: t.Boolean(),
        billing: t.Boolean(),
        system: t.Boolean()
      })
    )
  })
)

export const CompleteOnboardingSchema = t.Object({
  baseCurrency: t.String({ minLength: 3, maxLength: 5 }),
  walletName: t.Optional(t.String({ minLength: 1, maxLength: 50 })),
  walletCurrency: t.Optional(t.String({ minLength: 3, maxLength: 5 })),
  initialBalance: t.Optional(t.Number({ minimum: 0, maximum: 1_000_000_000 })),
  goalName: t.Optional(t.String({ minLength: 1, maxLength: 80 })),
  goalTarget: t.Optional(t.Number({ minimum: 0.01 }))
})
