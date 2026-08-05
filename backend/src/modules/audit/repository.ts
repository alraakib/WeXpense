import { getDb } from '@/shared/db/mongo'
import { id } from '@/shared/utils/ids'
import { AuditLog, AuditListFilter } from './interfaces'
import { AuditAction } from '@/shared/types'

export class AuditRepo {
  private coll() {
    return getDb().collection<AuditLog>('audit_logs')
  }

  async insert(entry: Omit<AuditLog, '_id' | 'createdAt'>): Promise<AuditLog> {
    const doc: AuditLog = { ...entry, _id: id('aud'), createdAt: new Date() }
    await this.coll().insertOne(doc)
    return doc
  }

  async list(filter: AuditListFilter): Promise<{ rows: AuditLog[]; total: number }> {
    const query: Record<string, unknown> = { workspaceId: filter.workspaceId }
    if (filter.actorId) query.userId = filter.actorId
    if (filter.action) query.action = filter.action
    const [rows, total] = await Promise.all([
      this.coll()
        .find(query)
        .sort({ createdAt: -1 })
        .skip((filter.page - 1) * filter.limit)
        .limit(filter.limit)
        .toArray(),
      this.coll().countDocuments(query)
    ])
    return { rows, total }
  }
}
