import type { Elysia } from 'elysia'

export type App = Elysia

interface TestContext {
  app: App
  connect: () => Promise<void>
  close: () => Promise<void>
  clean: () => Promise<void>
  signup: (handle: App, email: string, password: string, name?: string) => Promise<{ cookies: string; userId: string }>
  req: (handle: App, cookies: string | null, method: string, path: string, body?: unknown) => Promise<{ status: number; json: any }>
}

let context: TestContext | null = null
let db: import('mongodb').Db | null = null
let redis: import('ioredis').Redis | null = null

export function getTestContext(): TestContext {
  if (!context) throw new Error('Test context not initialized. Call initTestContext() first.')
  return context
}

async function cleanDb(): Promise<void> {
  if (!db || !redis) return
  const cols = await db.listCollections().toArray()
  for (const c of cols) {
    await db.collection(c.name).deleteMany({})
  }
  const rl = await redis.keys('rl:*')
  if (rl.length) await redis.del(...rl)
  await redis.del('config:global')
}

export async function initTestContext(): Promise<TestContext> {
  if (context) return context
  const { connectMongo, getDb } = await import('@/shared/db/mongo')
  const { connectRedis, getRedis } = await import('@/shared/db/redis')
  await connectMongo('mongodb://localhost:27017', 'wexpense-test')
  await connectRedis('redis://localhost:6379', 1)
  db = getDb()
  redis = getRedis()

  await cleanDb()

  const { ConfigService } = await import('@/modules/config/service')
  await new ConfigService().getConfig()

  context = {
    app: null as unknown as App,
    async connect() {
      const { buildApp } = await import('@/app')
      const { registerQueueProcessors } = await import('@/shared/queue-processors')
      registerQueueProcessors()
      if (!this.app) this.app = await buildApp()
    },
    clean: cleanDb,
    async close() {
      await import('@/shared/realtime').then((m) => m.closeRelay())
      this.app = null as unknown as App
      context = null
    },
    async signup(handle, email, password, name = 'Test User') {
      const res = await handle.handle(
        new Request('http://localhost/api/auth/sign-up/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name })
        })
      )
      const setCookie = res.headers.getSetCookie().find((c) => c.startsWith('better-auth.session_token='))
      if (!setCookie) throw new Error(`signup failed: ${await res.text()}`)
      const cookies = setCookie.split(';')[0] as string
      let userId = ''
      try {
        const body = JSON.parse(await res.text()) as { user?: { id?: string } }
        userId = body?.user?.id ?? ''
      } catch {
        /* no json body */
      }
      if (!userId) {
        const sessionRes = await handle.handle(
          new Request('http://localhost/api/auth/get-session', { headers: { Cookie: cookies } })
        )
        const session = JSON.parse(await sessionRes.text()) as { user?: { id?: string } }
        userId = session?.user?.id ?? ''
      }
      return { cookies, userId }
    },
    async req(handle, cookies, method, path, body) {
      const headers = new Headers()
      if (cookies) headers.set('Cookie', cookies)
      if (body !== undefined) headers.set('Content-Type', 'application/json')
      const res = await handle.handle(
        new Request(`http://localhost${path}`, {
          method,
          headers,
          body: body !== undefined ? JSON.stringify(body) : undefined
        })
      )
      const text = await res.text()
      let json: any = null
      try {
        json = text ? JSON.parse(text) : null
      } catch {
        json = text
      }
      return { status: res.status, json }
    }
  }
  return context
}