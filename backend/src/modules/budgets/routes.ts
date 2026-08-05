import { Elysia, t } from 'elysia'
import { BudgetService } from './service'
import { CreateBudgetSchema, UpdateBudgetSchema } from './validation'
import { ok, paged } from '@/shared/http'
import { wsGroup } from '@/shared/middleware/workspace'
import { currentMonth } from '@/shared/utils/dates'
import { ALL_ROLES, EDIT_ROLES } from '@/shared/types'

const budgets = new BudgetService()

export const budgetRoutes = new Elysia({ name: 'budget-routes' })
  .use(
    wsGroup(EDIT_ROLES)
      .post('/api/workspaces/:workspaceId/budgets', async ({ workspaceId, user, body }) => {
        return ok(await budgets.create(user.id, workspaceId, body))
      }, { body: CreateBudgetSchema })
      .patch('/api/workspaces/:workspaceId/budgets/:budgetId', async ({ workspaceId, user, params, body }) => {
        return ok(await budgets.update(user.id, workspaceId, params.budgetId, body))
      }, { params: t.Object({ workspaceId: t.String(), budgetId: t.String() }), body: UpdateBudgetSchema })
      .delete('/api/workspaces/:workspaceId/budgets/:budgetId', async ({ workspaceId, user, params }) => {
        await budgets.remove(user.id, workspaceId, params.budgetId)
        return ok({ deleted: true })
      }, { params: t.Object({ workspaceId: t.String(), budgetId: t.String() }) })
  )
  .use(
    wsGroup(ALL_ROLES)
      .get('/api/workspaces/:workspaceId/budgets', async ({ workspaceId, user, query }) => {
        const month = query.month ?? currentMonth()
        const rows = await budgets.list(user.id, workspaceId, month)
        return paged(rows, rows.length, 1, 100)
      }, { query: t.Object({ month: t.Optional(t.String()) }) })
  )