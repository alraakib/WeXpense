import { Elysia } from 'elysia'
import { checkRateLimit } from '@/shared/db/redis'

export const rateLimit = new Elysia({ name: 'rate-limit' }).onBeforeHandle(
  async ({ request, server }) => {
    const ip = server?.requestIP(request)?.address ?? 'unknown'
    await checkRateLimit(`rl:ip:${ip}`, 300, 60)
  }
)
