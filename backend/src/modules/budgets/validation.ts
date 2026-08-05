import { t } from 'elysia'

export const CreateBudgetSchema = t.Object({
  categoryId: t.String(),
  amount: t.Number({ minimum: 0.01, maximum: 999_999_999_999 }),
  currency: t.String({ minLength: 3, maxLength: 5 }),
  period: t.Optional(t.Union([t.Literal('monthly'), t.Literal('yearly')])),
  rollover: t.Optional(t.Boolean())
})

export const UpdateBudgetSchema = t.Partial(
  t.Object({
    categoryId: t.String(),
    amount: t.Number({ minimum: 0.01, maximum: 999_999_999_999 }),
    period: t.Union([t.Literal('monthly'), t.Literal('yearly')]),
    rollover: t.Boolean(),
    active: t.Boolean()
  })
)
