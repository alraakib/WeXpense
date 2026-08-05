import { getDb } from '@/shared/db/mongo'
import { id } from '@/shared/utils/ids'
import { Goal } from './interfaces'

export class GoalRepo {
  private coll() {
    return getDb().collection<Goal>('savings_goals')
  }

  async insert(g: Omit<Goal, '_id' | 'createdAt' | 'updatedAt'>): Promise<Goal> {
    const doc: Goal = { ...g, _id: id('goal'), createdAt: new Date(), updatedAt: new Date() }
    await this.coll().insertOne(doc)
    return doc
  }

  async findById(id: string): Promise<Goal | null> {
    return this.coll().findOne({ _id: id })
  }

  async findByIdWorkspace(id: string, workspaceId: string): Promise<Goal | null> {
    return this.coll().findOne({ _id: id, workspaceId })
  }

  async list(workspaceId: string, status?: string): Promise<Goal[]> {
    return this.coll()
      .find({ workspaceId, archivedAt: null, ...(status ? { status: status as Goal['status'] } : {}) })
      .sort({ createdAt: -1 })
      .toArray()
  }

  async update(id: string, workspaceId: string, patch: Partial<Goal>): Promise<Goal | null> {
    await this.coll().updateOne({ _id: id, workspaceId }, { $set: { ...patch, updatedAt: new Date() } })
    return this.findById(id)
  }

  async pushContribution(id: string, workspaceId: string, contribution: Goal['contributions'][number]): Promise<void> {
    await this.coll().updateOne(
      { _id: id, workspaceId },
      { $push: { contributions: contribution }, $set: { updatedAt: new Date() } }
    )
  }
}
