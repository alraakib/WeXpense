export type Env = {
  NODE_ENV: 'development' | 'test' | 'production'
  PORT: number
  MONGODB_URI: string
  MONGO_DB: string
  REDIS_URI: string
  REDIS_DB: number
  BETTER_AUTH_SECRET: string
  BETTER_AUTH_URL: string
  APP_URL: string
  LOG_LEVEL: string
  UPLOAD_DIR: string
  STRIPE_SECRET_KEY?: string
  STRIPE_WEBHOOK_SECRET?: string
  STRIPE_PRICE_PRO?: string
  STRIPE_PRICE_TEAM?: string
  EXCHANGE_RATE_API_KEY?: string
  FAKE_RATES?: string
  DEFAULT_ADMIN_EMAIL: string
  DEFAULT_ADMIN_PASSWORD: string
  QUEUE_DRIVER: 'bullmq' | 'inline'
}

let cached: Env | null = null

export function getEnv(): Env {
  if (cached) return cached
  cached = {
    NODE_ENV: (process.env.NODE_ENV as Env['NODE_ENV']) ?? 'development',
    PORT: Number(process.env.PORT ?? 8080),
    MONGODB_URI: process.env.MONGODB_URI ?? 'mongodb://localhost:27017',
    MONGO_DB: process.env.MONGO_DB ?? 'wexpense',
    REDIS_URI: process.env.REDIS_URI ?? 'redis://localhost:6379',
    REDIS_DB: Number(process.env.REDIS_DB ?? 0),
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ?? 'wexpense-dev-secret-change-me-in-production-0123456789',
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL ?? 'http://localhost:8080',
    APP_URL: process.env.APP_URL ?? 'http://localhost:3000',
    LOG_LEVEL: process.env.LOG_LEVEL ?? (process.env.NODE_ENV === 'test' ? 'silent' : 'info'),
    UPLOAD_DIR: process.env.UPLOAD_DIR ?? './uploads',
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    STRIPE_PRICE_PRO: process.env.STRIPE_PRICE_PRO,
    STRIPE_PRICE_TEAM: process.env.STRIPE_PRICE_TEAM,
    EXCHANGE_RATE_API_KEY: process.env.EXCHANGE_RATE_API_KEY,
    FAKE_RATES: process.env.FAKE_RATES,
    DEFAULT_ADMIN_EMAIL: process.env.DEFAULT_ADMIN_EMAIL ?? 'alraakib@gmail.com',
    DEFAULT_ADMIN_PASSWORD: process.env.DEFAULT_ADMIN_PASSWORD ?? 'Rkb243116',
    QUEUE_DRIVER: (process.env.QUEUE_DRIVER as Env['QUEUE_DRIVER']) ?? (process.env.NODE_ENV === 'test' ? 'inline' : 'bullmq')
  }
  return cached
}

export function resetEnvCache(): void {
  cached = null
}
