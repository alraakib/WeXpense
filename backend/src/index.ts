import { connectMongo, disconnectMongo } from '@/shared/db/mongo'
import { connectRedis, closeRedis } from '@/shared/db/redis'
import { getEnv } from '@/env'
import { startQueueWorkers, stopQueue } from '@/shared/queue'
import { closeRelay } from '@/shared/realtime'
import logger from '@/shared/utils/logger'

async function main() {
  const env = getEnv()
  await connectMongo(env.MONGODB_URI)
  await connectRedis(env.REDIS_URI)

  const [{ buildApp }, { registerQueueProcessors }, { startCronJobs }] = await Promise.all([
    import('@/app'),
    import('@/shared/queue-processors'),
    import('@/shared/cron')
  ])

  registerQueueProcessors()
  startQueueWorkers()
  startCronJobs()

  const app = await buildApp()
  app.listen(env.PORT)

  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'shutting down')
    await app.server?.stop()
    await Promise.allSettled([disconnectMongo(), closeRedis(), closeRelay(), stopQueue()])
    process.exit(0)
  }

  process.on('SIGINT', () => void shutdown('SIGINT'))
  process.on('SIGTERM', () => void shutdown('SIGTERM'))

  logger.info({ port: env.PORT, url: env.APP_URL }, 'WeXpense API started')
}

main().catch((err) => {
  logger.fatal({ err }, 'fatal startup error')
  process.exit(1)
})
