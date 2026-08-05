import { connectMongo, getDb, disconnectMongo } from '@/shared/db/mongo'
import { connectRedis, closeRedis } from '@/shared/db/redis'
import { getEnv } from '@/env'
import { ConfigService } from '@/modules/config/service'
import logger from '@/shared/utils/logger'

async function ensureAdmin() {
  const env = getEnv()
  const coll = getDb().collection<{ _id: string; email: string; name: string; role?: string }>('users')
  const existing = await coll.findOne({ email: env.DEFAULT_ADMIN_EMAIL })
  if (existing) {
    if (existing.role !== 'super_admin') {
      await coll.updateOne({ _id: existing._id }, { $set: { role: 'super_admin', emailVerified: true } })
      logger.info('admin role ensured')
    } else {
      logger.info('admin already provisioned')
    }
    return
  }
  const { auth } = await import('@/modules/auth/auth')
  const created = await auth.api.signUpEmail({
    body: {
      email: env.DEFAULT_ADMIN_EMAIL,
      password: env.DEFAULT_ADMIN_PASSWORD,
      name: 'Super Admin'
    }
  })
  const fresh = await coll.findOne({ email: env.DEFAULT_ADMIN_EMAIL })
  await coll.updateOne(
    { _id: fresh?._id ?? created.user.id },
    { $set: { role: 'super_admin', emailVerified: true, createdAt: new Date() } }
  )
  const sessions = getDb().collection<{ userId: string }>('sessions')
  await sessions.updateMany({ userId: created.user.id }, { $set: { emailVerified: true } })
  logger.info({ userId: fresh?._id?.toString() ?? created.user.id }, 'admin provisioned')
}

async function createIndexes() {
  const db = getDb()
  const ensure = async (name: string, specs: [string, 1 | -1 | 'text'][], unique = false) => {
    await db.collection(name).createIndex(specs.reduce<Record<string, 1 | -1 | 'text'>>((acc, [k, v]) => {
      acc[k] = v
      return acc
    }, {}), { unique })
  }
  await ensure('users', [['email', 1]], true)
  await ensure('workspaces', [['createdBy', 1]])
  await ensure('workspace_members', [['userId', 1], ['workspaceId', 1]], true)
  await ensure('workspace_members', [['workspaceId', 1]])
  await ensure('invites', [['token', 1]], true)
  await ensure('wallets', [['workspaceId', 1]])
  await ensure('categories', [['workspaceId', 1]])
  await ensure('tags', [['workspaceId', 1]])
  await ensure('transactions', [['workspaceId', 1], ['date', 1]])
  await ensure('transactions', [['walletId', 1]])
  await ensure('recurring_rules', [['workspaceId', 1], ['nextDueDate', 1]])
  await ensure('savings_goals', [['workspaceId', 1]])
  await ensure('budgets', [['workspaceId', 1], ['categoryId', 1]])
  await ensure('monthly_snapshots', [['workspaceId', 1], ['month', 1]], true)
  await ensure('notifications', [['userId', 1], ['read', 1]])
  await ensure('audit_logs', [['workspaceId', 1], ['createdAt', 1]])
  await ensure('files', [['transactionId', 1]])
  await ensure('subscriptions', [['userId', 1]])
  logger.info('indexes ensured')
}

async function main() {
  const env = getEnv()
  await connectMongo(env.MONGODB_URI)
  await connectRedis(env.REDIS_URI)
  await new ConfigService().getConfig()
  await ensureAdmin()
  await createIndexes()
  logger.info('seed complete')
  await disconnectMongo()
  await closeRedis()
  process.exit(0)
}

main().catch((err) => {
  console.error('[seed] failed', err)
  process.exit(1)
})
