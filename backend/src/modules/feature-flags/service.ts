import { cacheGet, cacheSet, cacheDelKey } from '@/shared/db/redis'
import { notFound } from '@/shared/errors'
import { FlagRepo } from './repository'
import { FeatureFlag } from './interfaces'

export class FlagService {
  constructor(private repo = new FlagRepo()) {}

  async set(key: string, workspaceId: string, enabled: boolean): Promise<FeatureFlag> {
    const flag = await this.repo.upsert(key, workspaceId, enabled)
    await cacheDelKey(`feature:${key}:${workspaceId}`)
    return flag
  }

  async isEnabled(key: string, workspaceId: string): Promise<boolean> {
    const cacheKey = `feature:${key}:${workspaceId}`
    const cached = await cacheGet(cacheKey)
    if (cached !== null) return cached === '1'
    const flag = await this.repo.get(key, workspaceId)
    const enabled = flag ? flag.enabled : false
    await cacheSet(cacheKey, enabled ? '1' : '0', 300)
    return enabled
  }

  async list(workspaceId?: string): Promise<FeatureFlag[]> {
    return this.repo.list(workspaceId)
  }
}
