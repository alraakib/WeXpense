import Redis from 'ioredis'
import { getEnv } from '@/env'
import { tooMany } from '@/shared/errors'

let client: Redis | null = null

export function getRedis(): Redis {
  if (!client) throw new Error('Redis not connected. Call connectRedis() first.')
  return client
}

export async function connectRedis(uri = getEnv().REDIS_URI, db = getEnv().REDIS_DB): Promise<Redis> {
  if (client) return client
  const redis = new Redis(uri, {
    db,
    maxRetriesPerRequest: 2,
    enableOfflineQueue: false,
    lazyConnect: true
  })
  await redis.connect()
  client = redis
  return client
}

export async function closeRedis(): Promise<void> {
  if (client) {
    client.disconnect()
    client = null
  }
}

export const redisConnected = () => client !== null

export async function cacheGet<T>(key: string): Promise<T | null> {
  const raw = await getRedis().get(key)
  return raw ? (JSON.parse(raw) as T) : null
}

export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  await getRedis().set(key, JSON.stringify(value), 'EX', ttlSeconds)
}

export async function cacheDel(pattern: string): Promise<void> {
  const redis = getRedis()
  const keys = await redis.keys(pattern)
  if (keys.length) await redis.del(...keys)
}

export async function cacheDelKey(key: string): Promise<void> {
  await getRedis().del(key)
}

export async function withLock<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T | null> {
  const redis = getRedis()
  const acquired = await redis.set(key, '1', 'PX', ttlMs, 'NX')
  if (!acquired) return null
  try {
    return await fn()
  } finally {
    await redis.del(key)
  }
}

export async function checkRateLimit(key: string, max: number, windowSeconds: number): Promise<void> {
  const redis = getRedis()
  const now = Date.now()
  const windowMs = windowSeconds * 1000
  const pipeline = redis.pipeline()
  pipeline.zremrangebyscore(key, 0, now - windowMs)
  pipeline.zadd(key, now, `${now}-${Math.random()}`)
  pipeline.zcard(key)
  pipeline.expire(key, windowSeconds)
  const results = await pipeline.exec()
  const count = results?.[2]?.[1] as number
  if (count > max) throw tooMany()
}

export async function flushRedis(): Promise<void> {
  await getRedis().flushdb()
}
