import { getDb } from '@/shared/db/mongo'
import { GlobalConfig } from './interfaces'

export const DEFAULT_TIERS = {
  hobby: {
    maxWorkspaces: 1,
    maxWallets: 2,
    sharedWorkspaces: false,
    customCategories: false,
    inviteMembers: false
  },
  pro: {
    maxWorkspaces: 5,
    maxWallets: 1_000_000,
    sharedWorkspaces: false,
    customCategories: true,
    inviteMembers: false
  },
  team: {
    maxWorkspaces: 1_000_000,
    maxWallets: 1_000_000,
    sharedWorkspaces: true,
    customCategories: true,
    inviteMembers: true
  }
} as const

export const DEFAULT_CURRENCIES = ['USD', 'EUR', 'GBP', 'BDT', 'INR', 'JPY', 'CAD', 'AUD', 'SGD', 'AED', 'BTC', 'ETH']

export class ConfigRepo {
  private coll() {
    return getDb().collection<GlobalConfig>('configs')
  }

  private defaults(): GlobalConfig {
    return {
      _id: 'global',
      appName: 'WeXpense',
      maintenance: false,
      currencies: [...DEFAULT_CURRENCIES],
      rates: null,
      tiers: structuredClone(DEFAULT_TIERS),
      updatedAt: new Date()
    }
  }

  async get(): Promise<GlobalConfig> {
    const existing = (await this.coll().findOne({ _id: 'global' })) as Partial<GlobalConfig> | null
    const doc: GlobalConfig = { ...this.defaults(), ...(existing ?? {}) }
    if (!existing) await this.coll().updateOne({ _id: 'global' }, { $setOnInsert: doc }, { upsert: true })
    return doc
  }

  async update(patch: Partial<GlobalConfig>): Promise<GlobalConfig> {
    await this.coll().updateOne({ _id: 'global' }, { $setOnInsert: this.defaults() }, { upsert: true })
    await this.coll().updateOne({ _id: 'global' }, { $set: { ...patch, updatedAt: new Date() } })
    return this.get()
  }
}
