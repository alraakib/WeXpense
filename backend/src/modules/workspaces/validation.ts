import { t } from 'elysia'

export const CreateWorkspaceSchema = t.Object({
  name: t.String({ minLength: 1, maxLength: 80 }),
  type: t.Optional(t.Union([t.Literal('personal'), t.Literal('shared')])),
  baseCurrency: t.Optional(t.String({ minLength: 3, maxLength: 5 }))
})

export const UpdateWorkspaceSchema = t.Object({
  name: t.Optional(t.String({ minLength: 1, maxLength: 80 })),
  baseCurrency: t.Optional(t.String({ minLength: 3, maxLength: 5 }))
})

export const InviteByEmailSchema = t.Object({
  email: t.String({ format: 'email' }),
  role: t.Optional(t.Union([t.Literal('admin'), t.Literal('contributor'), t.Literal('viewer')]))
})

export const InviteLinkSchema = t.Object({
  role: t.Optional(t.Union([t.Literal('admin'), t.Literal('contributor'), t.Literal('viewer')]))
})

export const ChangeRoleSchema = t.Object({
  role: t.Union([t.Literal('admin'), t.Literal('contributor'), t.Literal('viewer')])
})

export const ApproveMemberSchema = t.Object({
  userId: t.String()
})

export const JoinSchema = t.Object({
  token: t.String({ minLength: 10 })
})
