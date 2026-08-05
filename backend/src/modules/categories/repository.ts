import { getDb } from '@/shared/db/mongo'
import { id } from '@/shared/utils/ids'
import { Category, CreateCategoryInput } from './interfaces'

export const DEFAULT_CATEGORIES = [
  { name: 'Food & Dining', icon: 'utensils', color: '#fa5252' },
  { name: 'Transport', icon: 'car', color: '#228be6' },
  { name: 'Housing', icon: 'home', color: '#7950f2' },
  { name: 'Utilities', icon: 'bolt', color: '#f59f00' },
  { name: 'Entertainment', icon: 'movie', color: '#e64980' },
  { name: 'Shopping', icon: 'bag', color: '#12b886' },
  { name: 'Health', icon: 'heart-pulse', color: '#f76707' },
  { name: 'Education', icon: 'book', color: '#0ca678' },
  { name: 'Income', icon: 'coin', color: '#37b24d' },
  { name: 'Other', icon: 'dots', color: '#868e96' }
]

export class CategoryRepo {
  private coll() {
    return getDb().collection<Category>('categories')
  }

  async insert(c: Omit<Category, '_id' | 'createdAt'>): Promise<Category> {
    const doc: Category = { ...c, _id: id('cat'), createdAt: new Date() }
    await this.coll().insertOne(doc)
    return doc
  }

  async insertMany(workspaceId: string, createdBy: string): Promise<number> {
    const docs = DEFAULT_CATEGORIES.map((c, i) => ({
      _id: id('cat'),
      workspaceId,
      ...c,
      isDefault: true,
      order: i,
      createdBy,
      archivedAt: null,
      createdAt: new Date()
    }))
    await this.coll().insertMany(docs)
    return docs.length
  }

  async findById(id: string): Promise<Category | null> {
    return this.coll().findOne({ _id: id })
  }

  async findByIdWorkspace(id: string, workspaceId: string): Promise<Category | null> {
    return this.coll().findOne({ _id: id, workspaceId, archivedAt: null })
  }

  async list(workspaceId: string, includeArchived = false): Promise<Category[]> {
    return this.coll()
      .find({ workspaceId, ...(includeArchived ? {} : { archivedAt: null }) })
      .sort({ order: 1, name: 1 })
      .toArray()
  }

  async update(id: string, workspaceId: string, patch: Partial<Category>): Promise<Category | null> {
    await this.coll().updateOne({ _id: id, workspaceId }, { $set: { ...patch, archivedAt: patch.archivedAt ?? null } })
    return this.findById(id)
  }

  async archive(id: string, workspaceId: string): Promise<void> {
    await this.coll().updateOne({ _id: id, workspaceId }, { $set: { archivedAt: new Date() } })
  }

  async countByWorkspace(workspaceId: string): Promise<number> {
    return this.coll().countDocuments({ workspaceId, archivedAt: null })
  }
}
