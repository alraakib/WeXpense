import { getDb } from '@/shared/db/mongo'
import { id } from '@/shared/utils/ids'
import { FileRecord } from './interfaces'

export class FileRepo {
  private coll() {
    return getDb().collection<FileRecord>('files')
  }

  async insert(f: Omit<FileRecord, '_id' | 'createdAt'>): Promise<FileRecord> {
    const doc: FileRecord = { ...f, _id: id('file'), createdAt: new Date() }
    await this.coll().insertOne(doc)
    return doc
  }

  async findById(id: string): Promise<FileRecord | null> {
    return this.coll().findOne({ _id: id })
  }

  async findByIdOwner(id: string, ownerId: string): Promise<FileRecord | null> {
    return this.coll().findOne({ _id: id, ownerId })
  }

  async delete(id: string): Promise<void> {
    await this.coll().deleteOne({ _id: id })
  }
}
