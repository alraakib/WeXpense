import { badRequest, notFound } from '@/shared/errors'
import { addDaysUtc, addPeriod, dateKey, parseDateOrNow } from '@/shared/utils/dates'
import { fromMinor, toMinor } from '@/shared/utils/money'
import { withLock, cacheGet, cacheSet } from '@/shared/db/redis'
import { publish } from '@/shared/realtime'
import { RecurringRepo } from './repository'
import { RecurringRule, RecurringRuleWithMeta, CreateRecurringInput, UpdateRecurringInput } from './interfaces'
import { WorkspaceRepo } from '@/modules/workspaces/repository'
import { WalletRepo } from '@/modules/wallets/repository'
import { CategoryRepo } from '@/modules/categories/repository'
import { TransactionService } from '@/modules/transactions/service'
import { NotificationService } from '@/modules/notifications/service'
import { AuditService } from '@/modules/audit/service'

export class RecurringService {
  constructor(
    private repo = new RecurringRepo(),
    private workspaces = new WorkspaceRepo(),
    private wallets = new WalletRepo(),
    private categories = new CategoryRepo(),
    private transactions = new TransactionService(),
    private notifications = new NotificationService(),
    private audit = new AuditService()
  ) {}

  private async assertMember(userId: string, workspaceId: string) {
    const membership = await this.workspaces.findMembership(userId, workspaceId)
    if (!membership || membership.status !== 'active') throw badRequest('Not a member of this workspace', 'NOT_MEMBER')
    return membership
  }

  private async validateRuleInput(workspaceId: string, input: { walletId: string; categoryId?: string | null; amount: number }) {
    const wallet = await this.wallets.findByIdWorkspace(input.walletId, workspaceId)
    if (!wallet) throw badRequest('Wallet not found in this workspace', 'BAD_WALLET')
    if (input.categoryId) {
      const category = await this.categories.findByIdWorkspace(input.categoryId, workspaceId)
      if (!category) throw badRequest('Category not found in this workspace', 'BAD_CATEGORY')
    }
    return { wallet, amountMinor: toMinor(input.amount, wallet.currency) }
  }

  async create(userId: string, workspaceId: string, input: CreateRecurringInput): Promise<RecurringRule> {
    await this.assertMember(userId, workspaceId)
    const { wallet, amountMinor } = await this.validateRuleInput(workspaceId, input)
    const rule = await this.repo.insert({
      workspaceId,
      walletId: wallet._id,
      categoryId: input.categoryId ?? null,
      amountMinor,
      currency: wallet.currency,
      frequency: input.frequency,
      nextDueDate: input.firstDueDate ? parseDateOrNow(input.firstDueDate) : new Date(),
      active: input.active ?? true,
      notes: input.notes ?? null,
      createdBy: userId,
      paidCount: 0,
      lastProcessedAt: null
    })
    await this.audit.log(workspaceId, userId, 'recurring.created', 'recurring', rule._id, { frequency: rule.frequency })
    return rule
  }

  async list(userId: string, workspaceId: string): Promise<RecurringRuleWithMeta[]> {
    await this.assertMember(userId, workspaceId)
    const rules = await this.repo.list(workspaceId)
    const wallets = await this.wallets.list(workspaceId, true)
    const walletMap = new Map(wallets.map((w) => [w._id, w.name]))
    const soon = addDaysUtc(new Date(), 3)
    return rules.map((r) => ({
      ...r,
      walletName: walletMap.get(r.walletId),
      isUpcoming: r.active && r.nextDueDate <= soon
    }))
  }

  async update(userId: string, workspaceId: string, ruleId: string, input: UpdateRecurringInput): Promise<RecurringRule> {
    await this.assertMember(userId, workspaceId)
    const rule = await this.repo.findByIdWorkspace(ruleId, workspaceId)
    if (!rule) throw notFound('Recurring rule not found')
    const patch: Partial<RecurringRule> = {}
    if (input.active !== undefined) patch.active = input.active
    if (input.frequency) patch.frequency = input.frequency
    if (input.notes !== undefined) patch.notes = input.notes
    if (input.nextDueDate) patch.nextDueDate = parseDateOrNow(input.nextDueDate)
    if (input.amount !== undefined) {
      const wallet = await this.wallets.findByIdWorkspace(input.walletId ?? rule.walletId, workspaceId)
      if (!wallet) throw badRequest('Wallet not found', 'BAD_WALLET')
      patch.amountMinor = toMinor(input.amount, wallet.currency)
      patch.currency = wallet.currency
    }
    if (input.walletId) {
      const wallet = await this.wallets.findByIdWorkspace(input.walletId, workspaceId)
      if (!wallet) throw badRequest('Wallet not found', 'BAD_WALLET')
      patch.walletId = wallet._id
      patch.currency = wallet.currency
    }
    if (input.categoryId !== undefined) {
      if (input.categoryId === null) patch.categoryId = null
      else {
        const category = await this.categories.findByIdWorkspace(input.categoryId, workspaceId)
        if (!category) throw badRequest('Category not found', 'BAD_CATEGORY')
        patch.categoryId = category._id
      }
    }
    const updated = await this.repo.update(ruleId, workspaceId, patch)
    await this.audit.log(workspaceId, userId, 'recurring.updated', 'recurring', ruleId)
    return updated as RecurringRule
  }

  async remove(userId: string, workspaceId: string, ruleId: string): Promise<void> {
    await this.assertMember(userId, workspaceId)
    const rule = await this.repo.findByIdWorkspace(ruleId, workspaceId)
    if (!rule) throw notFound('Recurring rule not found')
    await this.repo.delete(ruleId, workspaceId)
    await this.audit.log(workspaceId, userId, 'recurring.deleted', 'recurring', ruleId)
  }

  async markPaid(userId: string, workspaceId: string, ruleId: string): Promise<RecurringRule> {
    await this.assertMember(userId, workspaceId)
    const rule = await this.repo.findByIdWorkspace(ruleId, workspaceId)
    if (!rule) throw notFound('Recurring rule not found')
    const processed = await this.processRule(rule, true)
    if (!processed) throw badRequest('Rule is not due yet', 'NOT_DUE')
    return processed
  }

  async processRule(rule: RecurringRule, isManual: boolean): Promise<RecurringRule | null> {
    const lockKey = `lock:recurring:${rule._id}`
    return withLock(lockKey, 5 * 60 * 1000, async () => {
      const fresh = await this.repo.findById(rule._id)
      if (!fresh || !fresh.active) return null
      const now = new Date()
      await this.transactions.createSystem(fresh.workspaceId, {
        type: 'expense',
        amount: fromMinor(fresh.amountMinor, fresh.currency),
        walletId: fresh.walletId,
        categoryId: fresh.categoryId ?? undefined,
        date: dateKey(fresh.nextDueDate),
        notes: fresh.notes ?? `Recurring expense (${fresh.frequency})`
      })
      let next = fresh.nextDueDate
      while (next.getTime() <= now.getTime()) next = addPeriod(fresh.frequency, next)
      const updated = await this.repo.update(fresh._id, fresh.workspaceId, {
        nextDueDate: next,
        paidCount: fresh.paidCount + 1,
        lastProcessedAt: now
      })
      await publish(`workspace:${fresh.workspaceId}`, {
        type: 'recurring:processed',
        payload: { ruleId: fresh._id, dueDate: fresh.nextDueDate.toISOString(), manual: isManual },
        timestamp: Date.now()
      })
      const members = await this.workspaces.membershipsInWorkspace(fresh.workspaceId)
      for (const member of members) {
        if (member.status !== 'active') continue
        await this.notifications.create(
          member.userId,
          'recurring_processed',
          'Recurring expense processed',
          `Your ${fresh.frequency} expense was recorded automatically.`,
          { ruleId: fresh._id }
        )
      }
      return updated
    })
  }

  async processDueRules(): Promise<number> {
    const due = await this.repo.findDue(new Date())
    let count = 0
    for (const rule of due) {
      const result = await this.processRule(rule, false)
      if (result) count++
    }
    return count
  }

  async sendUpcomingReminders(): Promise<number> {
    const from = new Date()
    const to = addDaysUtc(from, 3)
    const due = await this.repo.findDueInRange(from, to)
    let sent = 0
    for (const rule of due) {
      const key = `notif:recurring:${rule._id}:${dateKey(new Date())}`
      const existing = await cacheGet(key)
      if (existing) continue
      const members = await this.workspaces.membershipsInWorkspace(rule.workspaceId)
      for (const member of members) {
        if (member.status !== 'active') continue
        await this.notifications.create(
          member.userId,
          'recurring_reminder',
          'Upcoming recurring expense',
          `A ${rule.frequency} expense of ${rule.amountMinor} ${rule.currency} is due on ${dateKey(rule.nextDueDate)}.`,
          { ruleId: rule._id, dueDate: rule.nextDueDate.toISOString() }
        )
      }
      await cacheSet(key, true, 24 * 60 * 60)
      sent++
    }
    return sent
  }
}
