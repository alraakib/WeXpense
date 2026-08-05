import { Elysia, t } from 'elysia'
import { TagService } from './service'
import { CreateTagSchema, UpdateTagSchema } from './validation'
import { ok, paged } from '@/shared/http'
import { wsGroup } from '@/shared/middleware/workspace'
import { ALL_ROLES, EDIT_ROLES } from '@/shared/types'

const tags = new TagService()

export const tagRoutes = new Elysia({ name: 'tag-routes' })
  .use(
    wsGroup(EDIT_ROLES)
      .post('/api/workspaces/:workspaceId/tags', async ({ workspaceId, user, body }) => {
        return ok(await tags.create(user.id, workspaceId, body))
      }, { body: CreateTagSchema })
      .patch('/api/workspaces/:workspaceId/tags/:tagId', async ({ workspaceId, user, params, body }) => {
        return ok(await tags.update(user.id, workspaceId, params.tagId, body))
      }, { params: t.Object({ workspaceId: t.String(), tagId: t.String() }), body: UpdateTagSchema })
      .delete('/api/workspaces/:workspaceId/tags/:tagId', async ({ workspaceId, user, params }) => {
        await tags.delete(user.id, workspaceId, params.tagId)
        return ok({ deleted: true })
      }, { params: t.Object({ workspaceId: t.String(), tagId: t.String() }) })
  )
  .use(
    wsGroup(ALL_ROLES)
      .get('/api/workspaces/:workspaceId/tags', async ({ workspaceId, user }) => {
        const rows = await tags.list(user.id, workspaceId)
        return paged(rows, rows.length, 1, 100)
      })
  )