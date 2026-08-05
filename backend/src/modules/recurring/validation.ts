import { t } from 'elysia'

export const CreateRecurringSchema = t.Object({
  walletId: t.String(),
  categoryId: t.Optional(t.Union([t.String(), t.Null()])),
  amount: t.Number({ minimum: 0.01, maximum: 999_999_999_999 }),
  frequency: t.Union([t.Literal('daily'), t.Literal('weekly'), t.Literal('monthly')]),
  firstDueDate: t.Optional(t.String({ pattern: '^\\d{4}-\\d{2}-\\d{2}$' })),
  active: t.Optional(t.Boolean()),
  notes: t.Optional(t.String({ maxLength: 200 }))
})

export const UpdateRecurringSchema = t.Partial(
  t.Object({
    walletId: t.String(),
    categoryId: t.Null(),
    amount: t.Number({ minimum: 0.01, maximum: 999_999_999_999 }),
    frequency: t.Union([t.Literal('daily'), t.Literal('weekly'), t.Literal('monthly')]),
    nextDueDate: t.String({ pattern: '^\\d{4}-\\d{2}-\\d{2}$' }),
    active: t.Boolean(),
    notes: t.Null()
  })
)
