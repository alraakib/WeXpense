import { getDb } from '@/shared/db/mongo'
import { MonthlySnapshot } from './interfaces'

export class SnapshotRepo {
  private coll() {
    return getDb().collection<MonthlySnapshot>('monthly_snapshots')
  }

  async upsert(workspaceId: string, month: string, snapshot: Omit<MonthlySnapshot, '_id' | 'workspaceId' | 'month' | 'createdAt' | 'updatedAt'>): Promise<void> {
    await this.coll().updateOne(
      { workspaceId, month },
      {
        $set: { ...snapshot, updatedAt: new Date() },
        $setOnInsert: { createdAt: new Date() }
      },
      { upsert: true }
    )
  }

  async find(workspaceId: string, month: string): Promise<MonthlySnapshot | null> {
    return this.coll().findOne({ workspaceId, month })
  }

  async findRange(workspaceId: string, months: string[]): Promise<MonthlySnapshot[]> {
    return this.coll().find({ workspaceId, month: { $in: months } }).toArray()
  }
}
