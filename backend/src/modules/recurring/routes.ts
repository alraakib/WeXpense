import { Elysia, t } from 'elysia'
import { RecurringService } from './service'
import { CreateRecurringSchema, UpdateRecurringSchema } from './validation'
import { ok, paged } from '@/shared/http'
import { wsGroup } from '@/shared/middleware/workspace'
import { ALL_ROLES, EDIT_ROLES } from '@/shared/types'

const recurring = new RecurringService()

export const recurringRoutes = new Elysia({ name: 'recurring-routes' })
  .use(
    wsGroup(EDIT_ROLES)
      .post('/api/workspaces/:workspaceId/recurring', async ({ workspaceId, user, body }) => {
        return ok(await recurring.create(user.id, workspaceId, body))
      }, { body: CreateRecurringSchema })
      .patch('/api/workspaces/:workspaceId/recurring/:ruleId', async ({ workspaceId, user, params, body }) => {
        return ok(await recurring.update(user.id, workspaceId, params.ruleId, body))
      }, { params: t.Object({ workspaceId: t.String(), ruleId: t.String() }), body: UpdateRecurringSchema })
      .post('/api/workspaces/:workspaceId/recurring/:ruleId/paid', async ({ workspaceId, user, params }) => {
        return ok(await recurring.markPaid(user.id, workspaceId, params.ruleId))
      }, { params: t.Object({ workspaceId: t.String(), ruleId: t.String() }) })
      .delete('/api/workspaces/:workspaceId/recurring/:ruleId', async ({ workspaceId, user, params }) => {
        await recurring.remove(user.id, workspaceId, params.ruleId)
        return ok({ deleted: true })
      }, { params: t.Object({ workspaceId: t.String(), ruleId: t.String() }) })
  )
  .use(
    wsGroup(ALL_ROLES)
      .get('/api/workspaces/:workspaceId/recurring', async ({ workspaceId, user }) => {
        const rows = await recurring.list(user.id, workspaceId)
        return paged(rows, rows.length, 1, 100)
      })
  )