import { Elysia, t } from 'elysia'
import { CategoryService } from './service'
import { CreateCategorySchema, UpdateCategorySchema } from './validation'
import { ok, paged } from '@/shared/http'
import { wsGroup } from '@/shared/middleware/workspace'
import { ALL_ROLES, EDIT_ROLES } from '@/shared/types'

const categories = new CategoryService()

export const categoryRoutes = new Elysia({ name: 'category-routes' })
  .use(
    wsGroup(EDIT_ROLES)
      .post('/api/workspaces/:workspaceId/categories', async ({ workspaceId, user, body }) => {
        return ok(await categories.create(workspaceId, user.id, body))
      }, { body: CreateCategorySchema })
      .patch('/api/workspaces/:workspaceId/categories/:categoryId', async ({ workspaceId, user, params, body }) => {
        return ok(await categories.update(workspaceId, user.id, params.categoryId, body))
      }, { params: t.Object({ workspaceId: t.String(), categoryId: t.String() }), body: UpdateCategorySchema })
      .delete('/api/workspaces/:workspaceId/categories/:categoryId', async ({ workspaceId, user, params }) => {
        await categories.archive(workspaceId, user.id, params.categoryId)
        return ok({ archived: true })
      }, { params: t.Object({ workspaceId: t.String(), categoryId: t.String() }) })
  )
  .use(
    wsGroup(ALL_ROLES)
      .get('/api/workspaces/:workspaceId/categories', async ({ workspaceId }) => {
        const rows = await categories.list(workspaceId)
        return paged(rows, rows.length, 1, 100)
      })
  )