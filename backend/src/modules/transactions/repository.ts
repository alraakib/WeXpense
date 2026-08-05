import { getDb } from '@/shared/db/mongo'
import { id } from '@/shared/utils/ids'
import { Transaction, TransactionFilter } from './interfaces'

export class TransactionRepo {
  private coll() {
    return getDb().collection<Transaction>('transactions')
  }

  async insert(t: Omit<Transaction, '_id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    const doc: Transaction = { ...t, _id: id('txn'), createdAt: new Date(), updatedAt: new Date() }
    await this.coll().insertOne(doc)
    return doc
  }

  async findById(id: string): Promise<Transaction | null> {
    return this.coll().findOne({ _id: id, archivedAt: null })
  }

  async findByIdWorkspace(id: string, workspaceId: string): Promise<Transaction | null> {
    return this.coll().findOne({ _id: id, workspaceId, archivedAt: null })
  }

  async update(id: string, workspaceId: string, patch: Partial<Transaction>): Promise<Transaction | null> {
    await this.coll().updateOne({ _id: id, workspaceId }, { $set: { ...patch, updatedAt: new Date() } })
    return this.findById(id)
  }

  async archive(id: string, workspaceId: string): Promise<void> {
    await this.coll().updateOne({ _id: id, workspaceId }, { $set: { archivedAt: new Date(), updatedAt: new Date() } })
  }

  async list(filter: TransactionFilter): Promise<{ rows: Transaction[]; total: number }> {
    const query: Record<string, unknown> = { workspaceId: filter.workspaceId, archivedAt: null }
    if (filter.type) query.type = filter.type
    if (filter.walletId) query.walletId = filter.walletId
    if (filter.categoryId) query.categoryId = filter.categoryId
    if (filter.paidBy) query.paidBy = filter.paidBy
    if (filter.tag) query.tags = filter.tag
    if (filter.dateFrom || filter.dateTo) {
      const range: { $gte?: string; $lte?: string } = {}
      if (filter.dateFrom) range.$gte = filter.dateFrom
      if (filter.dateTo) range.$lte = filter.dateTo
      query.date = range
    }
    if (filter.search) {
      query.$or = [{ notes: { $regex: filter.search, $options: 'i' } }, { _id: filter.search }]
    }
    const [rows, total] = await Promise.all([
      this.coll()
        .find(query)
        .sort({ date: -1, createdAt: -1 })
        .skip((filter.page - 1) * filter.limit)
        .limit(filter.limit)
        .toArray(),
      this.coll().countDocuments(query)
    ])
    return { rows, total }
  }

  async sumByCategory(workspaceId: string, categoryId: string, from: string, to: string): Promise<number> {
    const rows = await this.coll()
      .aggregate<{ total: number }>([
        { $match: { workspaceId, categoryId, type: 'expense', archivedAt: null, date: { $gte: from, $lte: to } } },
        { $group: { _id: null, total: { $sum: '$amountMinor' } } }
      ])
      .toArray()
    return rows[0]?.total ?? 0
  }

  async sumByWallet(walletId: string, from: string, to: string): Promise<{ income: number; expense: number }> {
    const rows = await this.coll()
      .aggregate<{ _id: string; total: number }>([
        {
          $match: {
            $or: [{ walletId }, { transferToWalletId: walletId }],
            type: { $in: ['income', 'expense'] },
            archivedAt: null,
            date: { $gte: from, $lte: to }
          }
        },
        { $group: { _id: '$type', total: { $sum: '$amountMinor' } } }
      ])
      .toArray()
    return {
      income: rows.find((r) => r._id === 'income')?.total ?? 0,
      expense: rows.find((r) => r._id === 'expense')?.total ?? 0
    }
  }

  async countByWallet(walletId: string): Promise<number> {
    return this.coll().countDocuments({ $or: [{ walletId }, { transferToWalletId: walletId }], archivedAt: null })
  }
}
