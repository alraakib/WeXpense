import { getDb } from '@/shared/db/mongo'
import { id } from '@/shared/utils/ids'
import { Subscription } from './interfaces'
import { Tier } from '@/shared/types'

export class BillingRepo {
  private coll() {
    return getDb().collection<Subscription>('subscriptions')
  }

  async findByUser(userId: string): Promise<Subscription | null> {
    return this.coll().findOne({ userId })
  }

  async upsert(userId: string, patch: Partial<Subscription>): Promise<Subscription> {
    const existing = await this.findByUser(userId)
    if (!existing) {
      const doc: Subscription = {
        _id: id('sub'),
        userId,
        tier: 'hobby',
        status: 'active',
        ...patch,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      await this.coll().insertOne(doc)
      return doc
    }
    await this.coll().updateOne({ _id: existing._id }, { $set: { ...patch, updatedAt: new Date() } })
    return (await this.findByUser(userId)) as Subscription
  }

  async list(): Promise<Subscription[]> {
    return this.coll().find().sort({ createdAt: -1 }).toArray()
  }
}
