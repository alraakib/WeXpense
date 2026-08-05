import { Elysia, t } from 'elysia'
import { FlagService } from './service'
import { UpsertFlagSchema, FlagQuerySchema } from './validation'
import { ok } from '@/shared/http'
import { authGroup, adminGroup } from '@/shared/middleware/auth'

const flags = new FlagService()

export const flagRoutes = new Elysia({ name: 'flag-routes' })
  .use(
    adminGroup()
      .get('/api/admin/flags', async ({ query }) => ok(await flags.list(query.workspaceId)), { query: FlagQuerySchema })
      .put('/api/admin/flags/:key', async ({ params, query, body }) => {
        const flag = await flags.set(params.key, query.workspaceId, body.enabled)
        return ok(flag)
      }, {
        params: t.Object({ key: t.String() }),
        query: t.Object({ workspaceId: t.String() }),
        body: UpsertFlagSchema
      })
  )
  .use(
    authGroup().get('/api/flags/:key', async ({ params, query }) => {
      const workspaceId = query.workspaceId
      if (!workspaceId) throw new Error('workspaceId is required')
      return ok({ key: params.key, enabled: await flags.isEnabled(params.key, workspaceId) })
    }, {
      params: t.Object({ key: t.String() }),
      query: t.Optional(t.Object({ workspaceId: t.Optional(t.String()) }))
    })
  )