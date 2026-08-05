import { Elysia, t } from 'elysia'
import { flagRoutes } from '@/modules/feature-flags/routes'
import { configRoutes } from '@/modules/config/routes'
import { notificationRoutes } from '@/modules/notifications/routes'
import { billingRoutes } from '@/modules/billing/routes'
import { userRoutes } from '@/modules/users/routes'
import { workspaceRoutes } from '@/modules/workspaces/routes'
import { walletRoutes } from '@/modules/wallets/routes'
import { categoryRoutes } from '@/modules/categories/routes'
import { tagRoutes } from '@/modules/tags/routes'
import { transactionRoutes } from '@/modules/transactions/routes'
import { recurringRoutes } from '@/modules/recurring/routes'
import { goalRoutes } from '@/modules/goals/routes'
import { budgetRoutes } from '@/modules/budgets/routes'
import { analyticsRoutes } from '@/modules/analytics/routes'
import { fileRoutes } from '@/modules/files/routes'
import { wsRoutes } from '@/modules/ws/routes'
import { authPlugin } from '@/shared/middleware/auth'
import { rateLimit } from '@/shared/middleware/rate-limit'
import { errorHandler } from '@/shared/middleware/error-handler'
import { ok } from '@/shared/http'
import { getDb } from '@/shared/db/mongo'
import { getRedis } from '@/shared/db/redis'
import { Envelope } from '@/shared/types'
import { deliverLocal, startRelay } from '@/shared/realtime'

export async function buildApp() {
  await startRelay((envelope: Envelope) => deliverLocal(envelope))

  const app = new Elysia({ name: 'wexpense-api' })
    .use(errorHandler)
    .use(rateLimit)
    .use(authPlugin)
    .use(flagRoutes)
    .use(configRoutes)
    .use(notificationRoutes)
    .use(billingRoutes)
    .use(userRoutes)
    .use(workspaceRoutes)
    .use(walletRoutes)
    .use(categoryRoutes)
    .use(tagRoutes)
    .use(transactionRoutes)
    .use(recurringRoutes)
    .use(goalRoutes)
    .use(budgetRoutes)
    .use(analyticsRoutes)
    .use(fileRoutes)
    .use(wsRoutes)
    .get('/api/health', async () => {
      let dbOk = 'disconnected'
      let redisOk = 'disconnected'
      try {
        const conn = getDb()
        if (conn) await conn.command({ ping: 1 })
        dbOk = 'connected'
      } catch {
        /* db down */
      }
      try {
        await getRedis().ping()
        redisOk = 'connected'
      } catch {
        /* redis down */
      }
      return ok({ status: 'ok', db: dbOk, redis: redisOk })
    })
    .get('/api', () => ok({ name: 'WeXpense API', version: '1.0.0' }))

  return app
}
