import { getDb } from '@/shared/db/mongo'
import { id } from '@/shared/utils/ids'
import { FeatureFlag } from './interfaces'

export class FlagRepo {
  private coll() {
    return getDb().collection<FeatureFlag>('feature_flags')
  }

  async upsert(key: string, workspaceId: string, enabled: boolean): Promise<FeatureFlag> {
    await this.coll().updateOne(
      { key, workspaceId },
      { $set: { enabled, updatedAt: new Date() }, $setOnInsert: { _id: id('flg') } },
      { upsert: true }
    )
    return this.coll().findOne({ key, workspaceId }) as Promise<FeatureFlag>
  }

  async get(key: string, workspaceId: string): Promise<FeatureFlag | null> {
    return this.coll().findOne({ key, workspaceId })
  }

  async list(workspaceId?: string): Promise<FeatureFlag[]> {
    const filter = workspaceId ? { workspaceId } : {}
    return this.coll().find(filter).toArray()
  }
}
