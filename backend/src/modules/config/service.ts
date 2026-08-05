import { getEnv } from '@/env'
import { badRequest } from '@/shared/errors'
import { cacheGet, cacheSet, cacheDelKey } from '@/shared/db/redis'
import { dateKey } from '@/shared/utils/dates'
import { convertMinor } from '@/shared/utils/money'
import { ConfigRepo } from './repository'
import { UpdateConfigInput, GlobalConfig, TierLimits } from './interfaces'

const FALLBACK_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  BDT: 110,
  INR: 83,
  JPY: 150,
  CAD: 1.36,
  AUD: 1.52,
  SGD: 1.34,
  AED: 3.67,
  BTC: 0.000016,
  ETH: 0.00029
}

export class ConfigService {
  constructor(private repo = new ConfigRepo()) {}

  async getConfig(): Promise<GlobalConfig> {
    const cached = await cacheGet<GlobalConfig>('config:global')
    if (cached) return cached
    const config = await this.repo.get()
    await cacheSet('config:global', config, 60)
    return config
  }

  async updateConfig(input: UpdateConfigInput): Promise<GlobalConfig> {
    const patch: Partial<GlobalConfig> = {}
    if (input.appName !== undefined) patch.appName = input.appName
    if (input.maintenance !== undefined) patch.maintenance = input.maintenance
    if (input.currencies !== undefined) patch.currencies = [...new Set(input.currencies)]
    if (input.tiers !== undefined) {
      const current = await this.repo.get()
      for (const tier of ['hobby', 'pro', 'team'] as const) {
        const t = input.tiers[tier]
        if (t) patch.tiers = { ...(patch.tiers ?? current.tiers), [tier]: { ...current.tiers[tier], ...t } }
      }
    }
    const updated = await this.repo.update(patch)
    await cacheDelKey('config:global')
    return updated
  }

  async getRates(): Promise<{ date: string; base: string; rates: Record<string, number>; source: string }> {
    const today = dateKey(new Date())
    const config = await this.getConfig()
    if (config.rates?.date === today) return config.rates
    return this.refreshRates()
  }

  async refreshRates(): Promise<{ date: string; base: string; rates: Record<string, number>; source: string }> {
    const today = dateKey(new Date())
    let rates = { ...FALLBACK_RATES }
    let source = 'fallback'
    if (!getEnv().FAKE_RATES) {
      try {
        const url = getEnv().EXCHANGE_RATE_API_KEY
          ? `https://v6.exchangerate-api.com/v6/${getEnv().EXCHANGE_RATE_API_KEY}/latest/USD`
          : 'https://open.er-api.com/v6/latest/USD'
        const res = await fetch(url, { signal: AbortSignal.timeout(4000) })
        if (res.ok) {
          const data = (await res.json()) as { result?: string; rates?: Record<string, number> }
          if (data.result === 'success' && data.rates) {
            rates = { ...FALLBACK_RATES, ...data.rates }
            source = 'live'
          }
        }
      } catch {
        /* keep fallback */
      }
    }
    const stored = { date: today, base: 'USD', rates, source }
    await this.repo.update({ rates: stored })
    await cacheDelKey('config:global')
    return stored
  }

  async convert(amountMinor: number, from: string, to: string): Promise<number> {
    if (from === to) return amountMinor
    const { rates } = await this.getRates()
    if (!rates[from] || !rates[to]) throw badRequest(`No exchange rate available for ${from} -> ${to}`, 'NO_RATE')
    return convertMinor(amountMinor, from, to, rates)
  }

  async getTierLimits(tier: string): Promise<TierLimits> {
    const config = await this.getConfig()
    const t = config.tiers[tier as keyof typeof config.tiers]
    if (!t) throw badRequest(`Unknown tier: ${tier}`)
    return t
  }
}
