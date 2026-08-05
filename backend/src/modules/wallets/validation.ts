import { t } from 'elysia'

export const CreateWalletSchema = t.Object({
  name: t.String({ minLength: 1, maxLength: 50 }),
  currency: t.String({ minLength: 3, maxLength: 5 }),
  initialBalance: t.Optional(t.Number({ minimum: 0, maximum: 1_000_000_000 })),
  icon: t.Optional(t.String({ maxLength: 30 })),
  color: t.Optional(t.String({ pattern: '^#[0-9a-fA-F]{6}$' }))
})

export const UpdateWalletSchema = t.Partial(
  t.Object({
    name: t.String({ minLength: 1, maxLength: 50 }),
    icon: t.String({ maxLength: 30 }),
    color: t.String({ pattern: '^#[0-9a-fA-F]{6}$' })
  })
)
