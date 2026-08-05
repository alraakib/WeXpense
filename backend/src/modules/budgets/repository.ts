import { getDb } from '@/shared/db/mongo'
import { id } from '@/shared/utils/ids'
import { Budget } from './interfaces'

export class BudgetRepo {
  private coll() {
    return getDb().collection<Budget>('budgets')
  }

  async insert(b: Omit<Budget, '_id' | 'createdAt' | 'updatedAt'>): Promise<Budget> {
    const doc: Budget = { ...b, _id: id('bgt'), createdAt: new Date(), updatedAt: new Date() }
    await this.coll().insertOne(doc)
    return doc
  }

  async findById(id: string): Promise<Budget | null> {
    return this.coll().findOne({ _id: id })
  }

  async findByIdWorkspace(id: string, workspaceId: string): Promise<Budget | null> {
    return this.coll().findOne({ _id: id, workspaceId })
  }

  async list(workspaceId: string): Promise<Budget[]> {
    return this.coll().find({ workspaceId }).sort({ createdAt: 1 }).toArray()
  }

  async listAllActive(): Promise<Budget[]> {
    return this.coll().find({ active: true }).toArray()
  }

  async update(id: string, workspaceId: string, patch: Partial<Budget>): Promise<Budget | null> {
    await this.coll().updateOne({ _id: id, workspaceId }, { $set: { ...patch, updatedAt: new Date() } })
    return this.findById(id)
  }

  async delete(id: string, workspaceId: string): Promise<void> {
    await this.coll().deleteOne({ _id: id, workspaceId })
  }
}
