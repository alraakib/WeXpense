import { badRequest, notFound } from '@/shared/errors'
import { currentMonth, periodRange } from '@/shared/utils/dates'
import { convertMinor, toMinor } from '@/shared/utils/money'
import { publish } from '@/shared/realtime'
import { BudgetRepo } from './repository'
import { Budget, BudgetWithSpend, CreateBudgetInput } from './interfaces'
import { WorkspaceRepo } from '@/modules/workspaces/repository'
import { CategoryRepo } from '@/modules/categories/repository'
import { AnalyticsService } from '@/modules/analytics/service'
import { NotificationService } from '@/modules/notifications/service'
import { AuditService } from '@/modules/audit/service'
import { ConfigService } from '@/modules/config/service'

export class BudgetService {
  constructor(
    private repo = new BudgetRepo(),
    private workspaces = new WorkspaceRepo(),
    private categories = new CategoryRepo(),
    private analytics = new AnalyticsService(),
    private notifications = new NotificationService(),
    private audit = new AuditService(),
    private config = new ConfigService()
  ) {}

  private async assertMember(userId: string, workspaceId: string) {
    const membership = await this.workspaces.findMembership(userId, workspaceId)
    if (!membership || membership.status !== 'active') throw badRequest('Not a member of this workspace', 'NOT_MEMBER')
    return membership
  }

  async create(userId: string, workspaceId: string, input: CreateBudgetInput): Promise<Budget> {
    await this.assertMember(userId, workspaceId)
    const category = await this.categories.findByIdWorkspace(input.categoryId, workspaceId)
    if (!category) throw badRequest('Category not found in this workspace', 'BAD_CATEGORY')
    const config = await this.config.getConfig()
    if (!config.currencies.includes(input.currency)) throw badRequest(`Unsupported currency: ${input.currency}`, 'BAD_CURRENCY')
    const budget = await this.repo.insert({
      workspaceId,
      categoryId: category._id,
      amountMinor: toMinor(input.amount, input.currency),
      currency: input.currency,
      period: input.period ?? 'monthly',
      rollover: input.rollover ?? false,
      active: true,
      createdBy: userId
    })
    await this.audit.log(workspaceId, userId, 'budget.created', 'budget', budget._id, { categoryId: category._id })
    return budget
  }

  private async withSpend(budget: Budget, month: string, baseCurrency: string): Promise<BudgetWithSpend> {
    const { from, to } = periodRange(budget.period, month)
    let spendMinor = await this.analytics.categorySpend(
      budget.workspaceId,
      budget.categoryId,
      budget.period,
      month,
      budget.currency
    )
    if (budget.rollover && spendMinor < budget.amountMinor) {
      const carry = await this.previousCarryover(budget, month)
      spendMinor = Math.max(0, spendMinor - carry)
    }
    const effective = budget.amountMinor
    const percent = effective > 0 ? Math.min(100, Math.round((spendMinor / effective) * 100)) : 0
    return {
      ...budget,
      spendMinor,
      spendCurrency: budget.currency,
      percent,
      remainingMinor: Math.max(0, effective - spendMinor)
    }
  }

  private async previousCarryover(budget: Budget, month: string): Promise<number> {
    const [y, m] = month.split('-').map(Number)
    const prev = new Date(Date.UTC(y as number, (m as number) - 2, 1))
    const prevKey = `${prev.getUTCFullYear()}-${String(prev.getUTCMonth() + 1).padStart(2, '0')}`
    const { from, to } = periodRange(budget.period, prevKey)
    const spend = await this.analytics.categorySpend(budget.workspaceId, budget.categoryId, budget.period, prevKey, budget.currency)
    const unused = budget.amountMinor - spend
    return unused > 0 ? unused : 0
  }

  async list(userId: string, workspaceId: string, month: string): Promise<BudgetWithSpend[]> {
    await this.assertMember(userId, workspaceId)
    const workspace = await this.workspaces.findWorkspaceById(workspaceId)
    const budgets = await this.repo.list(workspaceId)
    const rows: BudgetWithSpend[] = []
    for (const budget of budgets) {
      rows.push(await this.withSpend(budget, month, workspace?.baseCurrency ?? 'USD'))
    }
    return rows
  }

  async update(userId: string, workspaceId: string, budgetId: string, input: Partial<CreateBudgetInput> & { active?: boolean }): Promise<Budget> {
    await this.assertMember(userId, workspaceId)
    const budget = await this.repo.findByIdWorkspace(budgetId, workspaceId)
    if (!budget) throw notFound('Budget not found')
    const patch: Partial<Budget> = {}
    if (input.categoryId) {
      const category = await this.categories.findByIdWorkspace(input.categoryId, workspaceId)
      if (!category) throw badRequest('Category not found', 'BAD_CATEGORY')
      patch.categoryId = category._id
    }
    if (input.amount !== undefined) patch.amountMinor = toMinor(input.amount, budget.currency)
    if (input.period) patch.period = input.period
    if (input.rollover !== undefined) patch.rollover = input.rollover
    if (input.active !== undefined) patch.active = input.active
    if (input.currency && input.currency !== budget.currency) {
      const config = await this.config.getConfig()
      if (!config.currencies.includes(input.currency)) throw badRequest(`Unsupported currency: ${input.currency}`, 'BAD_CURRENCY')
      const rates = await this.config.getRates()
      patch.amountMinor = input.amount
        ? toMinor(input.amount, input.currency)
        : convertMinor(budget.amountMinor, budget.currency, input.currency, rates.rates)
      patch.currency = input.currency
    }
    const updated = await this.repo.update(budgetId, workspaceId, patch)
    await this.audit.log(workspaceId, userId, 'budget.updated', 'budget', budgetId)
    return updated as Budget
  }

  async remove(userId: string, workspaceId: string, budgetId: string): Promise<void> {
    await this.assertMember(userId, workspaceId)
    const budget = await this.repo.findByIdWorkspace(budgetId, workspaceId)
    if (!budget) throw notFound('Budget not found')
    await this.repo.delete(budgetId, workspaceId)
    await this.audit.log(workspaceId, userId, 'budget.deleted', 'budget', budgetId)
  }

  async checkAll(month: string = currentMonth()): Promise<number> {
    const budgets = await this.repo.listAllActive()
    let alerted = 0
    for (const budget of budgets) {
      const workspace = await this.workspaces.findWorkspaceById(budget.workspaceId)
      if (!workspace) continue
      const withSpend = await this.withSpend(budget, month, workspace.baseCurrency)
      const thresholds = [80, 100].filter((t) => withSpend.percent >= t)
      const alertedMonth = budget.lastAlerted?.month === month ? budget.lastAlerted.thresholds : []
      const newThresholds = thresholds.filter((t) => !alertedMonth.includes(t))
      if (!newThresholds.length) continue
      await this.repo.update(budget._id, budget.workspaceId, {
        lastAlerted: { month, thresholds: [...alertedMonth, ...newThresholds] }
      })
      const members = await this.workspaces.membershipsInWorkspace(budget.workspaceId)
      for (const member of members) {
        if (member.status !== 'active') continue
        await this.notifications.create(
          member.userId,
          'budget_alert',
          newThresholds.includes(100) ? 'Budget exceeded' : 'Budget 80% used',
          `"${budget.categoryId}" category budget is at ${withSpend.percent}% of its limit this month.`,
          { budgetId: budget._id, percentage: withSpend.percent }
        )
      }
      for (const threshold of newThresholds) {
        await publish(`workspace:${budget.workspaceId}`, {
          type: 'budget:threshold',
          payload: { budgetId: budget._id, percentage: threshold },
          timestamp: Date.now()
        })
      }
      alerted++
    }
    return alerted
  }
}
