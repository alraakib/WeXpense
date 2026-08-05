import { Elysia, t } from 'elysia'
import { GoalService } from './service'
import { CreateGoalSchema, UpdateGoalSchema, ContributeSchema } from './validation'
import { ok, paged } from '@/shared/http'
import { wsGroup } from '@/shared/middleware/workspace'
import { ALL_ROLES, EDIT_ROLES } from '@/shared/types'

const goals = new GoalService()

export const goalRoutes = new Elysia({ name: 'goal-routes' })
  .use(
    wsGroup(EDIT_ROLES)
      .post('/api/workspaces/:workspaceId/goals', async ({ workspaceId, user, body }) => {
        return ok(await goals.create(user.id, workspaceId, body))
      }, { body: CreateGoalSchema })
      .patch('/api/workspaces/:workspaceId/goals/:goalId', async ({ workspaceId, user, params, body }) => {
        return ok(await goals.update(user.id, workspaceId, params.goalId, body))
      }, { params: t.Object({ workspaceId: t.String(), goalId: t.String() }), body: UpdateGoalSchema })
      .post('/api/workspaces/:workspaceId/goals/:goalId/contribute', async ({ workspaceId, user, params, body }) => {
        return ok(await goals.contribute(user.id, workspaceId, params.goalId, body))
      }, { params: t.Object({ workspaceId: t.String(), goalId: t.String() }), body: ContributeSchema })
      .post('/api/workspaces/:workspaceId/goals/:goalId/complete', async ({ workspaceId, user, params }) => {
        return ok(await goals.complete(user.id, workspaceId, params.goalId))
      }, { params: t.Object({ workspaceId: t.String(), goalId: t.String() }) })
      .delete('/api/workspaces/:workspaceId/goals/:goalId', async ({ workspaceId, user, params }) => {
        await goals.archive(user.id, workspaceId, params.goalId)
        return ok({ archived: true })
      }, { params: t.Object({ workspaceId: t.String(), goalId: t.String() }) })
  )
  .use(
    wsGroup(ALL_ROLES)
      .get('/api/workspaces/:workspaceId/goals', async ({ workspaceId, user, query }) => {
        const status = query.status === 'complete' || query.status === 'archived' ? query.status : undefined
        const rows = await goals.list(user.id, workspaceId, status)
        return paged(rows, rows.length, 1, 100)
      }, { query: t.Object({ status: t.Optional(t.String()) }) })
      .get('/api/workspaces/:workspaceId/goals/:goalId', async ({ workspaceId, user, params }) => {
        return ok(await goals.get(user.id, workspaceId, params.goalId))
      }, { params: t.Object({ workspaceId: t.String(), goalId: t.String() }) })
  )