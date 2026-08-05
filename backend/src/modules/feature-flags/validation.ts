import { t } from 'elysia'

export const UpsertFlagSchema = t.Object({
  enabled: t.Boolean()
})

export const FlagQuerySchema = t.Object({
  workspaceId: t.Optional(t.String()),
  key: t.Optional(t.String())
})
