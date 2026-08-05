import { getDb } from '@/shared/db/mongo'
import { id } from '@/shared/utils/ids'
import { RecurringRule } from './interfaces'

export class RecurringRepo {
  private coll() {
    return getDb().collection<RecurringRule>('recurring_rules')
  }

  async insert(r: Omit<RecurringRule, '_id' | 'createdAt' | 'updatedAt'>): Promise<RecurringRule> {
    const doc: RecurringRule = { ...r, _id: id('rec'), createdAt: new Date(), updatedAt: new Date() }
    await this.coll().insertOne(doc)
    return doc
  }

  async findById(id: string): Promise<RecurringRule | null> {
    return this.coll().findOne({ _id: id })
  }

  async findByIdWorkspace(id: string, workspaceId: string): Promise<RecurringRule | null> {
    return this.coll().findOne({ _id: id, workspaceId })
  }

  async list(workspaceId: string): Promise<RecurringRule[]> {
    return this.coll().find({ workspaceId }).sort({ nextDueDate: 1 }).toArray()
  }

  async update(id: string, workspaceId: string, patch: Partial<RecurringRule>): Promise<RecurringRule | null> {
    await this.coll().updateOne({ _id: id, workspaceId }, { $set: { ...patch, updatedAt: new Date() } })
    return this.findById(id)
  }

  async delete(id: string, workspaceId: string): Promise<void> {
    await this.coll().deleteOne({ _id: id, workspaceId })
  }

  async findDue(now: Date, limit = 500): Promise<RecurringRule[]> {
    return this.coll().find({ active: true, nextDueDate: { $lte: now } }).limit(limit).toArray()
  }

  async findDueInRange(from: Date, to: Date, limit = 500): Promise<RecurringRule[]> {
    return this.coll()
      .find({ active: true, nextDueDate: { $gte: from, $lte: to } })
      .limit(limit)
      .toArray()
  }
}
