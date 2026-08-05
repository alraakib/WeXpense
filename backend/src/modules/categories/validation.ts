import { t } from 'elysia'

export const CreateCategorySchema = t.Object({
  name: t.String({ minLength: 1, maxLength: 50 }),
  icon: t.Optional(t.String({ maxLength: 30 })),
  color: t.Optional(t.String({ pattern: '^#[0-9a-fA-F]{6}$' })),
  parentId: t.Optional(t.String())
})

export const UpdateCategorySchema = t.Partial(
  t.Object({
    name: t.String({ minLength: 1, maxLength: 50 }),
    icon: t.String({ maxLength: 30 }),
    color: t.String({ pattern: '^#[0-9a-fA-F]{6}$' }),
    parentId: t.Null()
  })
)
