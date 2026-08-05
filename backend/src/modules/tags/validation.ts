import { t } from 'elysia'

export const CreateTagSchema = t.Object({
  name: t.String({ minLength: 1, maxLength: 30 }),
  color: t.Optional(t.String({ pattern: '^#[0-9a-fA-F]{6}$' }))
})

export const UpdateTagSchema = t.Partial(
  t.Object({
    name: t.String({ minLength: 1, maxLength: 30 }),
    color: t.String({ pattern: '^#[0-9a-fA-F]{6}$' })
  })
)
