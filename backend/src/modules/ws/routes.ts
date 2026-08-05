import { Elysia } from 'elysia'
import { auth } from '@/modules/auth/auth'
import { subscribeLocal, unsubscribeAllLocal } from '@/shared/realtime'

export const wsRoutes = new Elysia({ name: 'ws-routes' })
  .ws('/ws', {
    async open(ws) {
      const url = new URL(ws.data.request.url)
      const token = url.searchParams.get('token') ?? ''
      const session = token
        ? await auth.api.getSession({ headers: { Authorization: `Bearer ${token}` } })
        : null
      if (!session) {
        ws.close(4001, 'unauthorized')
        return
      }
      const userId = session.user.id
      subscribeLocal(`user:${userId}`, ws as unknown as WebSocket)
      ws.send(JSON.stringify({ type: 'ws:connected', payload: { userId }, timestamp: Date.now() }))
    },
    message(ws, raw) {
      try {
        const msg = JSON.parse(String(raw)) as { type?: string; channel?: string }
        if (!msg || msg.type !== 'subscribe' || !msg.channel) return
        subscribeLocal(msg.channel, ws as unknown as WebSocket)
      } catch {
        /* ignore malformed */
      }
    },
    close(ws) {
      unsubscribeAllLocal(ws as unknown as WebSocket)
    }
  })
