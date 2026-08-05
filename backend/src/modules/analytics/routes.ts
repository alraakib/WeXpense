import { Elysia, t } from 'elysia'
import { AnalyticsService } from './service'
import { DashboardQuerySchema, TrendQuerySchema, ExportQuerySchema } from './validation'
import { ok } from '@/shared/http'
import { wsGroup } from '@/shared/middleware/workspace'
import { currentMonth } from '@/shared/utils/dates'
import { WorkspaceRepo } from '@/modules/workspaces/repository'
import { ALL_ROLES } from '@/shared/types'

const analytics = new AnalyticsService()
const workspaces = new WorkspaceRepo()

export const analyticsRoutes = new Elysia({ name: 'analytics-routes' })
  .use(
    wsGroup(ALL_ROLES)
      .get('/api/workspaces/:workspaceId/dashboard', async ({ workspaceId, user, query }) => {
        const month = query.month ?? currentMonth()
        return ok(await analytics.dashboard(user.id, workspaceId, month))
      }, { query: DashboardQuerySchema })
      .get('/api/workspaces/:workspaceId/analytics/categories', async ({ workspaceId, user, query }) => {
        return ok(await analytics.categoryBreakdown(user.id, workspaceId, query.month ?? currentMonth(), query.categoryId))
      }, {
        query: t.Object({
          month: t.Optional(t.String({ pattern: '^\\d{4}-\\d{2}$' })),
          categoryId: t.Optional(t.String())
        })
      })
      .get('/api/workspaces/:workspaceId/analytics/trend', async ({ workspaceId, query }) => {
        const months = Math.min(24, Math.max(3, Number(query.months) || 6))
        const workspace = await workspaces.findWorkspaceById(workspaceId)
        return ok(await analytics.trend(workspaceId, workspace?.baseCurrency ?? 'USD', months))
      }, { query: TrendQuerySchema })
      .get('/api/workspaces/:workspaceId/analytics/export', async ({ workspaceId, user, query, set }) => {
        const csv = await analytics.exportCsv(user.id, workspaceId, query.from, query.to)
        set.headers['Content-Type'] = 'text/csv'
        set.headers['Content-Disposition'] = 'attachment; filename="wexpense-transactions.csv"'
        return csv
      }, { query: ExportQuerySchema })
  )