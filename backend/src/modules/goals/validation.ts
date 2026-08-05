import { t } from 'elysia'

export const CreateGoalSchema = t.Object({
  name: t.String({ minLength: 1, maxLength: 80 }),
  target: t.Number({ minimum: 0.01, maximum: 999_999_999_999 }),
  currency: t.String({ minLength: 3, maxLength: 5 }),
  targetDate: t.Optional(t.String({ pattern: '^\\d{4}-\\d{2}-\\d{2}$' }))
})

export const UpdateGoalSchema = t.Partial(
  t.Object({
    name: t.String({ minLength: 1, maxLength: 80 }),
    target: t.Number({ minimum: 0.01, maximum: 999_999_999_999 }),
    targetDate: t.Null()
  })
)

export const ContributeSchema = t.Object({
  walletId: t.String(),
  amount: t.Number({ minimum: 0.01, maximum: 999_999_999_999 }),
  note: t.Optional(t.String({ maxLength: 200 }))
})
