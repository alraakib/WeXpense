import { getDb } from '@/shared/db/mongo'
import { id } from '@/shared/utils/ids'
import { Wallet } from './interfaces'

export class WalletRepo {
  private coll() {
    return getDb().collection<Wallet>('wallets')
  }

  async insert(w: Omit<Wallet, '_id' | 'createdAt' | 'updatedAt'>): Promise<Wallet> {
    const doc: Wallet = { ...w, _id: id('wlt'), createdAt: new Date(), updatedAt: new Date() }
    await this.coll().insertOne(doc)
    return doc
  }

  async findById(id: string): Promise<Wallet | null> {
    return this.coll().findOne({ _id: id })
  }

  async findByIdWorkspace(id: string, workspaceId: string): Promise<Wallet | null> {
    return this.coll().findOne({ _id: id, workspaceId, archivedAt: null })
  }

  async list(workspaceId: string, includeArchived = false): Promise<Wallet[]> {
    return this.coll()
      .find({ workspaceId, ...(includeArchived ? {} : { archivedAt: null }) })
      .sort({ createdAt: 1 })
      .toArray()
  }

  async update(id: string, workspaceId: string, patch: Partial<Wallet>): Promise<Wallet | null> {
    await this.coll().updateOne({ _id: id, workspaceId }, { $set: { ...patch, updatedAt: new Date() } })
    return this.findById(id)
  }

  async archive(id: string, workspaceId: string): Promise<void> {
    await this.coll().updateOne({ _id: id, workspaceId }, { $set: { archivedAt: new Date(), updatedAt: new Date() } })
  }

  async adjustBalance(walletId: string, deltaMinor: number): Promise<Wallet | null> {
    return this.coll().findOneAndUpdate(
      { _id: walletId },
      { $inc: { balanceMinor: deltaMinor }, $set: { updatedAt: new Date() } },
      { returnDocument: 'after' }
    )
  }

  async adjustHeld(walletId: string, deltaMinor: number): Promise<Wallet | null> {
    return this.coll().findOneAndUpdate(
      { _id: walletId },
      { $inc: { heldMinor: deltaMinor }, $set: { updatedAt: new Date() } },
      { returnDocument: 'after' }
    )
  }

  async countByWorkspace(workspaceId: string): Promise<number> {
    return this.coll().countDocuments({ workspaceId, archivedAt: null })
  }
}
