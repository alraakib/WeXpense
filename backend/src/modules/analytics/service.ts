import { getDb } from '@/shared/db/mongo'
import { badRequest, forbidden } from '@/shared/errors'
import { currentMonth, dateKey, monthKey, periodRange } from '@/shared/utils/dates'
import { convertMinor, decimals } from '@/shared/utils/money'
import { cacheGet, cacheSet } from '@/shared/db/redis'
import { SnapshotRepo } from './repository'
import { DashboardData, MonthlySnapshot, TrendPoint } from './interfaces'
import { WorkspaceRepo } from '@/modules/workspaces/repository'
import { WalletRepo } from '@/modules/wallets/repository'
import { CategoryRepo } from '@/modules/categories/repository'
import { TransactionRepo } from '@/modules/transactions/repository'
import { ConfigService } from '@/modules/config/service'

const CACHE_TTL = 10 * 60

interface TxRow {
  type: string
  amountMinor: number
  walletCurrency: string
  categoryId?: string | null
  walletId: string
}

export class AnalyticsService {
  constructor(
    private snapshots = new SnapshotRepo(),
    private workspaces = new WorkspaceRepo(),
    private wallets = new WalletRepo(),
    private categories = new CategoryRepo(),
    private transactions = new TransactionRepo(),
    private config = new ConfigService()
  ) {}

  private async assertMember(userId: string, workspaceId: string) {
    const membership = await this.workspaces.findMembership(userId, workspaceId)
    if (!membership || membership.status !== 'active') throw forbidden('Not a member of this workspace')
    return membership
  }

  private baseMinorExpr(base: string, rates: Record<string, number>): Record<string, unknown> {
    const dBase = decimals(base)
    const cases = Object.entries(rates).map(([currency, rate]) => ({
      case: { $eq: ['$walletCurrency', currency] },
      then: {
        $round: [
          {
            $multiply: [
              { $divide: ['$amountMinor', Math.pow(10, decimals(currency))] },
              1 / rate,
              Math.pow(10, dBase)
            ]
          },
          0
        ]
      }
    }))
    return {
      $switch: { branches: cases, default: { $round: ['$amountMinor', 0] } }
    }
  }

  private async fetchRows(workspaceId: string, from: string, to: string): Promise<TxRow[]> {
    return getDb()
      .collection('transactions')
      .aggregate<TxRow>([
        { $match: { workspaceId, archivedAt: null, date: { $gte: from, $lte: to } } },
        {
          $lookup: {
            from: 'wallets',
            localField: 'walletId',
            foreignField: '_id',
            as: 'wallet'
          }
        },
        { $unwind: { path: '$wallet', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 0,
            type: 1,
            amountMinor: 1,
            walletCurrency: { $ifNull: ['$wallet.currency', 'USD'] },
            categoryId: 1,
            walletId: 1
          }
        }
      ])
      .toArray()
  }

  async recompute(workspaceId: string, month: string, baseCurrency = 'USD'): Promise<MonthlySnapshot> {
    const { from, to } = periodRange('monthly', month)
    const [rows, rates] = await Promise.all([
      this.fetchRows(workspaceId, dateKey(from), dateKey(to)),
      this.config.getRates()
    ])
    const baseMinor = this.baseMinorExpr(baseCurrency, rates.rates)
    const pipeline = [
      { $match: { workspaceId, archivedAt: null, date: { $gte: dateKey(from), $lte: dateKey(to) } } },
      {
        $lookup: { from: 'wallets', localField: 'walletId', foreignField: '_id', as: 'wallet' }
      },
      { $unwind: { path: '$wallet', preserveNullAndEmptyArrays: true } },
      { $project: { _id: 0, type: 1, amountMinor: 1, walletCurrency: { $ifNull: ['$wallet.currency', 'USD'] }, categoryId: 1, walletId: 1 } },
      { $addFields: { baseMinor: baseMinor } }
    ] as never[]

    const [incomeRows, expenseRows, categoryRows, walletRows] = await Promise.all([
      getDb().collection('transactions').aggregate<{ total: number }>([...pipeline, { $match: { type: 'income' } }, { $group: { _id: null, total: { $sum: '$baseMinor' } } }]).toArray(),
      getDb().collection('transactions').aggregate<{ total: number }>([...pipeline, { $match: { type: 'expense' } }, { $group: { _id: null, total: { $sum: '$baseMinor' } } }]).toArray(),
      getDb()
        .collection('transactions')
        .aggregate<{ _id: string; amountMinor: number; count: number }>([
          ...pipeline,
          { $match: { type: 'expense', categoryId: { $ne: null } } },
          { $group: { _id: '$categoryId', amountMinor: { $sum: '$baseMinor' }, count: { $sum: 1 } } },
          { $sort: { amountMinor: -1 } }
        ])
        .toArray(),
      getDb()
        .collection('transactions')
        .aggregate<{ _id: string; amountMinor: number }>([
          ...pipeline,
          { $group: { _id: '$walletId', amountMinor: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, { $multiply: ['$baseMinor', -1] }, '$baseMinor'] } } } }
        ])
        .toArray()
    ])

    const snapshot: Omit<MonthlySnapshot, '_id' | 'workspaceId' | 'month' | 'createdAt' | 'updatedAt'> = {
      baseCurrency,
      incomeMinor: incomeRows[0]?.total ?? 0,
      expenseMinor: expenseRows[0]?.total ?? 0,
      byCategory: categoryRows.map((r) => ({ categoryId: r._id, amountMinor: r.amountMinor, count: r.count })),
      byWallet: walletRows.map((r) => ({ walletId: r._id, amountMinor: r.amountMinor }))
    }
    await this.snapshots.upsert(workspaceId, month, snapshot)
    return (await this.snapshots.find(workspaceId, month)) as MonthlySnapshot
  }

  async categorySpend(
    workspaceId: string,
    categoryId: string,
    period: 'monthly' | 'yearly',
    month: string,
    targetCurrency: string
  ): Promise<number> {
    const { from, to } = periodRange(period, month)
    const rows = await this.fetchRows(workspaceId, dateKey(from), dateKey(to))
    const rates = await this.config.getRates()
    let total = 0
    for (const row of rows) {
      if (row.type !== 'expense' || row.categoryId !== categoryId) continue
      total += convertMinor(row.amountMinor, row.walletCurrency, targetCurrency, rates.rates)
    }
    return total
  }

  async getSnapshot(workspaceId: string, month: string): Promise<MonthlySnapshot> {
    const existing = await this.snapshots.find(workspaceId, month)
    if (existing) return existing
    return this.recompute(workspaceId, month)
  }

  async dashboard(userId: string, workspaceId: string, month: string): Promise<DashboardData> {
    await this.assertMember(userId, workspaceId)
    const cacheKey = `cache:dashboard:${workspaceId}:${month}`
    const cached = await cacheGet<DashboardData>(cacheKey)
    if (cached) return cached

    const [workspace, snapshot, wallets, transactions] = await Promise.all([
      this.workspaces.findWorkspaceById(workspaceId),
      this.getSnapshot(workspaceId, month),
      this.wallets.list(workspaceId),
      this.transactions.list({ workspaceId, page: 1, limit: 5 })
    ])
    const baseCurrency = workspace?.baseCurrency ?? 'USD'
    const rates = await this.config.getRates()
    let balanceMinor = 0
    for (const wallet of wallets) {
      balanceMinor += convertMinor(wallet.balanceMinor, wallet.currency, baseCurrency, rates.rates)
    }

    const trend = await this.trend(workspaceId, baseCurrency, 6, month)
    const data: DashboardData = {
      month,
      baseCurrency,
      incomeMinor: snapshot.incomeMinor,
      expenseMinor: snapshot.expenseMinor,
      balanceMinor,
      savingsMinor: Math.max(0, snapshot.incomeMinor - snapshot.expenseMinor),
      byCategory: snapshot.byCategory,
      byWallet: snapshot.byWallet,
      trend,
      recentTransactions: transactions.rows as unknown as Record<string, unknown>[]
    }
    await cacheSet(cacheKey, data, CACHE_TTL)
    return data
  }

  async trend(workspaceId: string, baseCurrency: string, months: number, endMonth?: string): Promise<TrendPoint[]> {
    const end = endMonth ?? currentMonth()
    const [y, m] = end.split('-').map(Number)
    const labels: string[] = []
    const cursor = new Date(Date.UTC(y as number, (m as number) - months + 1, 1))
    for (let i = 0; i < months; i++) {
      labels.push(monthKey(cursor))
      cursor.setUTCMonth(cursor.getUTCMonth() + 1)
    }
    const existing = await this.snapshots.findRange(workspaceId, labels)
    const map = new Map(existing.map((s) => [s.month, s]))
    const missing = labels.filter((l) => !map.has(l))
    for (const l of missing) {
      const fresh = await this.recompute(workspaceId, l, baseCurrency)
      map.set(l, fresh)
    }
    return labels.map((l) => {
      const s = map.get(l)
      return {
        month: l,
        incomeMinor: s?.incomeMinor ?? 0,
        expenseMinor: s?.expenseMinor ?? 0
      }
    })
  }

  async categoryBreakdown(userId: string, workspaceId: string, month: string, categoryId?: string): Promise<Record<string, unknown>> {
    await this.assertMember(userId, workspaceId)
    const snapshot = await this.getSnapshot(workspaceId, month)
    const categories = await this.categories.list(workspaceId, true)
    const categoryMap = new Map(categories.map((c) => [c._id, c]))
    const breakdown = snapshot.byCategory
      .filter((c) => !categoryId || c.categoryId === categoryId)
      .map((c) => ({
        categoryId: c.categoryId,
        name: categoryMap.get(c.categoryId)?.name ?? 'Unknown',
        icon: categoryMap.get(c.categoryId)?.icon ?? null,
        color: categoryMap.get(c.categoryId)?.color ?? null,
        amountMinor: c.amountMinor,
        count: c.count
      }))
    const total = breakdown.reduce((s, b) => s + b.amountMinor, 0)
    return {
      month,
      total,
      breakdown: breakdown.map((b) => ({ ...b, percent: total ? Math.round((b.amountMinor / total) * 100) : 0 }))
    }
  }

  async exportCsv(userId: string, workspaceId: string, from?: string, to?: string): Promise<string> {
    await this.assertMember(userId, workspaceId)
    const fromDate = from ?? '2000-01-01'
    const toDate = to ?? dateKey(new Date())
    const { rows } = await this.transactions.list({ workspaceId, page: 1, limit: 10000, dateFrom: fromDate, dateTo: toDate })
    const header = ['date', 'type', 'amount', 'currency', 'walletId', 'categoryId', 'notes', 'tags', 'createdBy', 'createdAt']
    const lines = rows.map((r) =>
      [
        r.date,
        r.type,
        (r.amountMinor / 10 ** decimals(r.currency)).toFixed(decimals(r.currency)),
        r.currency,
        r.walletId,
        r.categoryId ?? '',
        `"${(r.notes ?? '').replace(/"/g, '""')}"`,
        r.tags.join('|'),
        r.createdBy,
        r.createdAt.toISOString()
      ].join(',')
    )
    return [header.join(','), ...lines].join('\n')
  }
}
