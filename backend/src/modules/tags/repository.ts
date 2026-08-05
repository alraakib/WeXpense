import { getDb } from '@/shared/db/mongo'
import { id } from '@/shared/utils/ids'
import { Tag } from './interfaces'

export class TagRepo {
  private coll() {
    return getDb().collection<Tag>('tags')
  }

  async insert(t: Omit<Tag, '_id' | 'createdAt'>): Promise<Tag> {
    const doc: Tag = { ...t, _id: id('tag'), createdAt: new Date() }
    await this.coll().insertOne(doc)
    return doc
  }

  async findByIdWorkspace(id: string, workspaceId: string): Promise<Tag | null> {
    return this.coll().findOne({ _id: id, workspaceId })
  }

  async findByIdsWorkspace(ids: string[], workspaceId: string): Promise<Tag[]> {
    return this.coll().find({ _id: { $in: ids }, workspaceId }).toArray()
  }

  async list(workspaceId: string): Promise<Tag[]> {
    return this.coll().find({ workspaceId }).sort({ name: 1 }).toArray()
  }

  async update(id: string, workspaceId: string, patch: Partial<Tag>): Promise<Tag | null> {
    await this.coll().updateOne({ _id: id, workspaceId }, { $set: patch })
    return this.findByIdWorkspace(id, workspaceId)
  }

  async delete(id: string, workspaceId: string): Promise<void> {
    await this.coll().deleteOne({ _id: id, workspaceId })
  }
}
