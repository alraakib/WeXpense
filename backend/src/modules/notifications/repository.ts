import { getDb } from '@/shared/db/mongo'
import { id } from '@/shared/utils/ids'
import { AppNotification } from './interfaces'

export class NotificationRepo {
  private coll() {
    return getDb().collection<AppNotification>('notifications')
  }

  async insert(n: Omit<AppNotification, '_id' | 'createdAt'>): Promise<AppNotification> {
    const doc: AppNotification = { ...n, _id: id('ntf'), createdAt: new Date() }
    await this.coll().insertOne(doc)
    return doc
  }

  async list(userId: string, page: number, limit: number, unreadOnly: boolean): Promise<{ rows: AppNotification[]; total: number }> {
    const query: Record<string, unknown> = { userId }
    if (unreadOnly) query.read = false
    const [rows, total] = await Promise.all([
      this.coll()
        .find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray(),
      this.coll().countDocuments(query)
    ])
    return { rows, total }
  }

  async unreadCount(userId: string): Promise<number> {
    return this.coll().countDocuments({ userId, read: false })
  }

  async markRead(userId: string, notificationId: string): Promise<boolean> {
    const res = await this.coll().updateOne({ _id: notificationId, userId }, { $set: { read: true } })
    return res.modifiedCount > 0
  }

  async markAllRead(userId: string): Promise<void> {
    await this.coll().updateMany({ userId, read: false }, { $set: { read: true } })
  }

  async deleteOld(days: number): Promise<number> {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    const res = await this.coll().deleteMany({ read: true, createdAt: { $lt: cutoff } })
    return res.deletedCount
  }
}
