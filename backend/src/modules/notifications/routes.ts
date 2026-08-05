import { Elysia, t } from 'elysia'
import { NotificationService } from './service'
import { ok, paged, parsePagination } from '@/shared/http'
import { authGroup } from '@/shared/middleware/auth'

const notifications = new NotificationService()

export const notificationRoutes = new Elysia({ name: 'notification-routes' })
  .use(
    authGroup()
      .get('/api/notifications', async ({ user, query }) => {
        const { page, limit } = parsePagination(query)
        const unreadOnly = query.unread === 'true'
        const { rows, total } = await notifications.list(user.id, page, limit, unreadOnly)
        return paged(rows, total, page, limit)
      }, {
        query: t.Object({
          page: t.Optional(t.String()),
          limit: t.Optional(t.String()),
          unread: t.Optional(t.String())
        })
      })
      .get('/api/notifications/unread-count', async ({ user }) => ok({ count: await notifications.unreadCount(user.id) }))
      .post('/api/notifications/:id/read', async ({ user, params }) => ok({ marked: await notifications.markRead(user.id, params.id) }), {
        params: t.Object({ id: t.String() })
      })
      .post('/api/notifications/read-all', async ({ user }) => {
        await notifications.markAllRead(user.id)
        return ok({ marked: true })
      })
  )