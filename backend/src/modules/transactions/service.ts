import { badRequest, forbidden, notFound } from '@/shared/errors'
import { dateKey, monthKey } from '@/shared/utils/dates'
import { convertMinor, fromMinor, toMinor } from '@/shared/utils/money'
import { cacheDel } from '@/shared/db/redis'
import { publish } from '@/shared/realtime'
import { enqueue } from '@/shared/queue'
import { TransactionRepo } from './repository'
import {
  Transaction,
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionFilter,
  TransactionWithMeta,
  Split
} from './interfaces'
import { Membership } from '@/modules/workspaces/interfaces'
import { WalletRepo } from '@/modules/wallets/repository'
import { WorkspaceRepo } from '@/modules/workspaces/repository'
import { CategoryRepo } from '@/modules/categories/repository'
import { TagRepo } from '@/modules/tags/repository'
import { AuditService } from '@/modules/audit/service'
import { ConfigService } from '@/modules/config/service'
import { UsersRepo } from '@/modules/users/repository'

interface WalletOp {
  walletId: string
  deltaMinor: number
}

export class TransactionService {
  constructor(
    private repo = new TransactionRepo(),
    private wallets = new WalletRepo(),
    private workspaces = new WorkspaceRepo(),
    private categories = new CategoryRepo(),
    private tags = new TagRepo(),
    private audit = new AuditService(),
    private config = new ConfigService(),
    private users = new UsersRepo()
  ) {}

  private async assertActiveMembership(userId: string, workspaceId: string) {
    const membership = await this.workspaces.findMembership(userId, workspaceId)
    if (!membership || membership.status !== 'active') throw forbidden('Not a member of this workspace')
    return membership
  }

  private async assertOwnTransaction(membership: Membership, tx: Transaction | null, userId: string): Promise<void> {
    if (membership.role === 'contributor' && tx && tx.createdBy !== userId) {
      throw forbidden('Contributors can only modify their own transactions')
    }
  }

  private async validateInput(
    workspaceId: string,
    input: CreateTransactionInput,
    userId: string
  ): Promise<{ amountMinor: number; currency: string }> {
    const wallet = await this.wallets.findByIdWorkspace(input.walletId, workspaceId)
    if (!wallet) throw badRequest('Wallet not found in this workspace', 'BAD_WALLET')
    const amountMinor = toMinor(input.amount, wallet.currency)
    if (amountMinor <= 0) throw badRequest('Amount must be positive', 'BAD_AMOUNT')

if (input.type === 'transfer') {
      if (!input.transferToWalletId) throw badRequest('Transfer requires a destination wallet', 'NO_TARGET')
      if (input.transferToWalletId === input.walletId) throw badRequest('Transfer target must differ from source', 'SAME_WALLET')
      const target = await this.wallets.findByIdWorkspace(input.transferToWalletId, workspaceId)
      if (!target) throw badRequest('Transfer target wallet not found in this workspace', 'BAD_TARGET')
      const source = await this.wallets.findByIdWorkspace(input.walletId, workspaceId)
      if (!source) throw badRequest('Transfers are not allowed from a non-existing source', 'BAD_SOURCE')
      const amountMinor = toMinor(input.amount, source.currency)
      const available = source.balanceMinor - source.heldMinor
      if (amountMinor > available) throw badRequest('Insufficient available balance in source wallet', 'INSUFFICIENT_FUNDS')
    }

    if (input.categoryId) {
      const category = await this.categories.findByIdWorkspace(input.categoryId, workspaceId)
      if (!category) throw badRequest('Category not found in this workspace', 'BAD_CATEGORY')
    }

    if (input.tags?.length) {
      const found = await this.tags.findByIdsWorkspace(input.tags, workspaceId)
      if (found.length !== input.tags.length) throw badRequest('Some tags do not exist in this workspace', 'BAD_TAG')
    }

    if (input.splitWith?.length) {
      const total = input.splitWith.reduce((sum, s) => sum + toMinor(s.amount, wallet.currency), 0)
      if (total > amountMinor) throw badRequest('Split amounts exceed the transaction amount', 'SPLIT_OVER')
      const userIds = input.splitWith.map((s) => s.userId)
      if (new Set(userIds).size !== userIds.length) throw badRequest('Duplicate users in split', 'SPLIT_DUP')
      for (const uid of userIds) {
        const membership = await this.workspaces.findMembership(uid, workspaceId)
        if (!membership || membership.status !== 'active') throw badRequest('Split references a non-member', 'SPLIT_MEMBER')
      }
    }

    if (input.paidBy) {
      const membership = await this.workspaces.findMembership(input.paidBy, workspaceId)
      if (!membership || membership.status !== 'active') throw badRequest('paidBy is not a workspace member', 'BAD_PAID_BY')
    }

    return { amountMinor, currency: wallet.currency }
  }

  private async balanceOps(tx: Transaction): Promise<WalletOp[]> {
    if (tx.type === 'income') return [{ walletId: tx.walletId, deltaMinor: tx.amountMinor }]
    if (tx.type === 'expense') return [{ walletId: tx.walletId, deltaMinor: -tx.amountMinor }]
    const source = await this.wallets.findByIdWorkspace(tx.walletId, tx.workspaceId)
    const target = await this.wallets.findByIdWorkspace(tx.transferToWalletId as string, tx.workspaceId)
    if (!source || !target) return []
    let targetDelta = tx.amountMinor
    if (source.currency !== target.currency) {
      const { rates } = await this.config.getRates()
      targetDelta = convertMinor(tx.amountMinor, source.currency, target.currency, rates)
    }
    return [
      { walletId: tx.walletId, deltaMinor: -tx.amountMinor },
      { walletId: target._id, deltaMinor: targetDelta }
    ]
  }

  private async applyOps(ops: WalletOp[]): Promise<void> {
    for (const op of ops) {
      const wallet = await this.wallets.adjustBalance(op.walletId, op.deltaMinor)
      if (wallet) {
        await publish(`wallet:${op.walletId}`, {
          type: 'wallet:balance_updated',
          payload: { walletId: op.walletId, balance: wallet.balanceMinor },
          timestamp: Date.now()
        })
      }
    }
  }

  private async invalidate(workspaceId: string, walletIds: string[], month: string): Promise<void> {
    await cacheDel(`cache:dashboard:${workspaceId}:*`)
    for (const walletId of walletIds) await cacheDel(`wallet:balance:${walletId}`)
    await enqueue({ name: 'snapshot.recompute', payload: { workspaceId, month } })
  }

  private buildDoc(
    workspaceId: string,
    userId: string,
    input: CreateTransactionInput,
    amountMinor: number,
    currency: string
  ): Omit<Transaction, '_id' | 'createdAt' | 'updatedAt'> {
    return {
      workspaceId,
      walletId: input.walletId,
      type: input.type,
      amountMinor,
      currency,
      transferToWalletId: input.type === 'transfer' ? input.transferToWalletId : null,
      categoryId: input.categoryId ?? null,
      tags: input.tags ?? [],
      date: input.date ?? dateKey(new Date()),
      notes: input.notes ?? null,
      paidBy: input.paidBy ?? userId,
      splitWith: (input.splitWith ?? []).map((s): Split => ({ userId: s.userId, amountMinor: toMinor(s.amount, currency) })),
      receiptFileId: input.receiptFileId ?? null,
      createdBy: userId,
      archivedAt: null
    }
  }

  async create(userId: string, workspaceId: string, input: CreateTransactionInput): Promise<Transaction> {
    await this.assertActiveMembership(userId, workspaceId)
    const { amountMinor, currency } = await this.validateInput(workspaceId, input, userId)
    const created = await this.repo.insert(this.buildDoc(workspaceId, userId, input, amountMinor, currency))
    await this.applyOps(await this.balanceOps(created))
    await this.audit.log(workspaceId, userId, 'transaction.created', 'transaction', created._id, {
      type: created.type,
      amountMinor: created.amountMinor
    })
    await publish(`workspace:${workspaceId}`, {
      type: 'transaction:created',
      payload: created,
      timestamp: Date.now()
    })
    await this.invalidate(workspaceId, [created.walletId, created.transferToWalletId ?? ''].filter(Boolean), monthKey(created.date))
    return created
  }

  async createSystem(workspaceId: string, input: CreateTransactionInput): Promise<Transaction> {
    const { amountMinor, currency } = await this.validateInput(workspaceId, input, 'system')
    const created = await this.repo.insert(this.buildDoc(workspaceId, 'system', input, amountMinor, currency))
    await this.applyOps(await this.balanceOps(created))
    await publish(`workspace:${workspaceId}`, {
      type: 'transaction:created',
      payload: created,
      timestamp: Date.now()
    })
    await this.invalidate(workspaceId, [created.walletId, created.transferToWalletId ?? ''].filter(Boolean), monthKey(created.date))
    return created
  }

  async update(
    userId: string,
    workspaceId: string,
    transactionId: string,
    input: UpdateTransactionInput
  ): Promise<Transaction> {
    const membership = await this.assertActiveMembership(userId, workspaceId)
    const existing = await this.repo.findByIdWorkspace(transactionId, workspaceId)
    if (!existing) throw notFound('Transaction not found')
    await this.assertOwnTransaction(membership, existing, userId)

    const merged: CreateTransactionInput = {
      type: input.type ?? existing.type,
      amount: input.amount ?? fromMinor(existing.amountMinor, existing.currency),
      walletId: input.walletId ?? existing.walletId,
      transferToWalletId: input.transferToWalletId ?? existing.transferToWalletId ?? undefined,
      categoryId: input.categoryId ?? existing.categoryId ?? undefined,
      tags: input.tags ?? existing.tags,
      date: input.date ?? existing.date,
      notes: input.notes ?? existing.notes ?? undefined,
      paidBy: input.paidBy ?? existing.paidBy,
      splitWith: input.splitWith
        ? input.splitWith.map((s) => ({ userId: s.userId, amount: s.amount }))
        : existing.splitWith.map((s) => ({ userId: s.userId, amount: fromMinor(s.amountMinor, existing.currency) })),
      receiptFileId: input.receiptFileId ?? existing.receiptFileId ?? undefined
    }
    const { amountMinor, currency } = await this.validateInput(workspaceId, merged, userId)

    const oldOps = await this.balanceOps(existing)
    await this.applyOps(oldOps.map((op) => ({ ...op, deltaMinor: -op.deltaMinor })))
    const next: Transaction = { ...existing, ...this.buildDoc(workspaceId, userId, merged, amountMinor, currency) }
    await this.applyOps(await this.balanceOps(next))

    const updated = await this.repo.update(transactionId, workspaceId, {
      type: next.type,
      amountMinor,
      currency,
      walletId: next.walletId,
      transferToWalletId: next.transferToWalletId,
      categoryId: next.categoryId,
      tags: next.tags,
      date: next.date,
      notes: next.notes,
      paidBy: next.paidBy,
      splitWith: next.splitWith,
      receiptFileId: next.receiptFileId
    })
    if (!updated) throw notFound('Transaction not found')

    await this.audit.log(workspaceId, userId, 'transaction.updated', 'transaction', transactionId, { type: updated.type })
    await publish(`workspace:${workspaceId}`, {
      type: 'transaction:updated',
      payload: updated,
      timestamp: Date.now()
    })
    const walletIds = [existing.walletId, existing.transferToWalletId ?? '', updated.walletId, updated.transferToWalletId ?? ''].filter(Boolean)
    await this.invalidate(workspaceId, walletIds, monthKey(updated.date))
    return updated
  }

  async remove(userId: string, workspaceId: string, transactionId: string): Promise<void> {
    const membership = await this.assertActiveMembership(userId, workspaceId)
    const existing = await this.repo.findByIdWorkspace(transactionId, workspaceId)
    if (!existing) throw notFound('Transaction not found')
    await this.assertOwnTransaction(membership, existing, userId)
    await this.applyOps((await this.balanceOps(existing)).map((op) => ({ ...op, deltaMinor: -op.deltaMinor })))
    await this.repo.archive(transactionId, workspaceId)
    await this.audit.log(workspaceId, userId, 'transaction.deleted', 'transaction', transactionId)
    await publish(`workspace:${workspaceId}`, {
      type: 'transaction:deleted',
      payload: { id: transactionId },
      timestamp: Date.now()
    })
    await this.invalidate(
      workspaceId,
      [existing.walletId, existing.transferToWalletId ?? ''].filter(Boolean),
      monthKey(existing.date)
    )
  }

  async list(
    userId: string,
    workspaceId: string,
    filter: Omit<TransactionFilter, 'workspaceId' | 'page' | 'limit'> & { page?: number; limit?: number }
  ): Promise<{ rows: TransactionWithMeta[]; total: number; page: number; pages: number }> {
    await this.assertActiveMembership(userId, workspaceId)
    const page = filter.page ?? 1
    const limit = filter.limit ?? 20
    const { rows, total } = await this.repo.list({ workspaceId, page, limit, ...filter })
    return { rows: await this.enrich(rows, workspaceId), total, page, pages: Math.max(1, Math.ceil(total / limit)) }
  }

  async get(userId: string, workspaceId: string, transactionId: string): Promise<TransactionWithMeta> {
    await this.assertActiveMembership(userId, workspaceId)
    const tx = await this.repo.findByIdWorkspace(transactionId, workspaceId)
    if (!tx) throw notFound('Transaction not found')
    return (await this.enrich([tx], workspaceId))[0] as TransactionWithMeta
  }

  private async enrich(rows: Transaction[], workspaceId: string): Promise<TransactionWithMeta[]> {
    const walletIds = [...new Set(rows.flatMap((r) => [r.walletId, r.transferToWalletId ?? '']))].filter(Boolean)
    const categoryIds = [...new Set(rows.map((r) => r.categoryId).filter(Boolean))] as string[]
    const tagIds = [...new Set(rows.flatMap((r) => r.tags))]
    const userIds = [...new Set(rows.flatMap((r) => [r.paidBy, r.createdBy, ...r.splitWith.map((s) => s.userId)]))]

    const [wallets, categories, tags, userInfos] = await Promise.all([
      walletIds.length ? this.wallets.list(workspaceId, true) : Promise.resolve([]),
      categoryIds.length ? this.categories.list(workspaceId, true) : Promise.resolve([]),
      tagIds.length ? this.tags.list(workspaceId) : Promise.resolve([]),
      userIds.length ? this.users.findByIds(userIds) : Promise.resolve([])
    ])
    const walletMap = new Map(wallets.map((w) => [w._id, w]))
    const categoryMap = new Map(categories.map((c) => [c._id, c]))
    const tagMap = new Map(tags.map((t) => [t._id, t]))
    const userMap = new Map(userInfos.map((u) => [u._id, u.name]))

    return rows.map((r) => {
      const wallet = walletMap.get(r.walletId)
      const category = r.categoryId ? categoryMap.get(r.categoryId) : undefined
      return {
        ...r,
        category: category ? { id: category._id, name: category.name, icon: category.icon, color: category.color } : null,
        walletName: wallet?.name,
        walletCurrency: wallet?.currency ?? r.currency,
        tagDetails: r.tags.map((tagId) => {
          const tag = tagMap.get(tagId)
          return tag ? { id: tag._id, name: tag.name, color: tag.color } : { id: tagId, name: tagId }
        }),
        paidByName: userMap.get(r.paidBy) ?? null
      }
    })
  }
}
