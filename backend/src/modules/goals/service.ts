import { badRequest, notFound } from '@/shared/errors'
import { dateKey } from '@/shared/utils/dates'
import { fromMinor, toMinor } from '@/shared/utils/money'
import { id } from '@/shared/utils/ids'
import { publish } from '@/shared/realtime'
import { GoalRepo } from './repository'
import { Goal, GoalWithMeta, CreateGoalInput, ContributeInput } from './interfaces'
import { WorkspaceRepo } from '@/modules/workspaces/repository'
import { WalletRepo } from '@/modules/wallets/repository'
import { TransactionService } from '@/modules/transactions/service'
import { NotificationService } from '@/modules/notifications/service'
import { AuditService } from '@/modules/audit/service'
import { ConfigService } from '@/modules/config/service'

const MILESTONES = [25, 50, 75, 100] as const

export class GoalService {
  constructor(
    private repo = new GoalRepo(),
    private workspaces = new WorkspaceRepo(),
    private wallets = new WalletRepo(),
    private transactions = new TransactionService(),
    private notifications = new NotificationService(),
    private audit = new AuditService(),
    private config = new ConfigService()
  ) {}

  private async assertMember(userId: string, workspaceId: string) {
    const membership = await this.workspaces.findMembership(userId, workspaceId)
    if (!membership || membership.status !== 'active') throw badRequest('Not a member of this workspace', 'NOT_MEMBER')
    return membership
  }

  private withMeta(goal: Goal): GoalWithMeta {
    const savedMinor = goal.contributions.reduce((sum, c) => sum + c.amountMinor, 0)
    const progressPercent = Math.min(100, Math.round((savedMinor / Math.max(1, goal.targetMinor)) * 100))
    let daysLeft: number | null = null
    if (goal.targetDate) {
      const target = new Date(goal.targetDate)
      daysLeft = Math.ceil((target.getTime() - Date.now()) / 86_400_000)
    }
    return {
      ...goal,
      savedMinor,
      progressPercent,
      milestones: MILESTONES.map((m) => ({ milestone: m, reached: progressPercent >= m })),
      daysLeft
    }
  }

  async create(userId: string, workspaceId: string, input: CreateGoalInput): Promise<GoalWithMeta> {
    await this.assertMember(userId, workspaceId)
    const config = await this.config.getConfig()
    if (!config.currencies.includes(input.currency)) throw badRequest(`Unsupported currency: ${input.currency}`, 'BAD_CURRENCY')
    const goal = await this.repo.insert({
      workspaceId,
      name: input.name,
      targetMinor: toMinor(input.target, input.currency),
      currency: input.currency,
      targetDate: input.targetDate ?? null,
      status: 'active',
      createdBy: userId,
      contributions: [],
      completedAt: null,
      archivedAt: null
    })
    await this.audit.log(workspaceId, userId, 'goal.created', 'goal', goal._id, { name: goal.name })
    return this.withMeta(goal)
  }

  async list(userId: string, workspaceId: string, status?: string): Promise<GoalWithMeta[]> {
    await this.assertMember(userId, workspaceId)
    const goals = await this.repo.list(workspaceId, status)
    return goals.map((g) => this.withMeta(g))
  }

  async get(userId: string, workspaceId: string, goalId: string): Promise<GoalWithMeta> {
    await this.assertMember(userId, workspaceId)
    const goal = await this.repo.findByIdWorkspace(goalId, workspaceId)
    if (!goal) throw notFound('Goal not found')
    return this.withMeta(goal)
  }

  async update(userId: string, workspaceId: string, goalId: string, input: { name?: string; target?: number; targetDate?: string | null }): Promise<GoalWithMeta> {
    await this.assertMember(userId, workspaceId)
    const goal = await this.repo.findByIdWorkspace(goalId, workspaceId)
    if (!goal) throw notFound('Goal not found')
    if (goal.status === 'complete') throw badRequest('Completed goals are locked', 'GOAL_COMPLETE')
    const patch: Partial<Goal> = {}
    if (input.name !== undefined) patch.name = input.name
    if (input.target !== undefined) {
      const targetMinor = toMinor(input.target, goal.currency)
      if (targetMinor < goal.contributions.reduce((s, c) => s + c.amountMinor, 0)) {
        throw badRequest('Target cannot be below the amount already saved', 'TARGET_TOO_LOW')
      }
      patch.targetMinor = targetMinor
    }
    if (input.targetDate !== undefined) patch.targetDate = input.targetDate
    const updated = await this.repo.update(goalId, workspaceId, patch)
    await this.audit.log(workspaceId, userId, 'goal.updated', 'goal', goalId)
    return this.withMeta(updated as Goal)
  }

  async contribute(userId: string, workspaceId: string, goalId: string, input: ContributeInput): Promise<GoalWithMeta> {
    await this.assertMember(userId, workspaceId)
    const goal = await this.repo.findByIdWorkspace(goalId, workspaceId)
    if (!goal) throw notFound('Goal not found')
    if (goal.status !== 'active') throw badRequest('Goal is not active', 'GOAL_NOT_ACTIVE')
    const wallet = await this.wallets.findByIdWorkspace(input.walletId, workspaceId)
    if (!wallet) throw badRequest('Wallet not found in this workspace', 'BAD_WALLET')
    const amountMinor = toMinor(input.amount, goal.currency)
    const available = wallet.balanceMinor - wallet.heldMinor
    if (amountMinor > available) throw badRequest('Insufficient available balance in wallet', 'INSUFFICIENT_FUNDS')

    await this.wallets.adjustHeld(wallet._id, amountMinor)
    const contribution = { id: id('ctb'), walletId: wallet._id, amountMinor, date: dateKey(new Date()), note: input.note }
    await this.repo.pushContribution(goalId, workspaceId, contribution)

    const before = this.withMeta(goal)
    const fresh = await this.repo.findById(goalId)
    const after = this.withMeta(fresh as Goal)
    for (const m of MILESTONES) {
      if (!before.milestones.find((x) => x.milestone === m)?.reached && after.milestones.find((x) => x.milestone === m)?.reached) {
        await publish(`goal:${goalId}`, {
          type: 'goal:milestone',
          payload: { goalId, milestone: m },
          timestamp: Date.now()
        })
        const members = await this.workspaces.membershipsInWorkspace(workspaceId)
        for (const member of members) {
          if (member.status !== 'active') continue
          await this.notifications.create(
            member.userId,
            m === 100 ? 'goal_completed' : 'goal_milestone',
            m === 100 ? 'Goal completed!' : `Goal ${m}% reached`,
            `"${goal.name}" is ${m}% complete.`,
            { goalId, milestone: m }
          )
        }
      }
    }
    await this.audit.log(workspaceId, userId, 'goal.contributed', 'goal', goalId, { amountMinor })
    if (after.progressPercent >= 100) {
      return this.complete(userId, workspaceId, goalId)
    }
    return after
  }

  async complete(userId: string, workspaceId: string, goalId: string): Promise<GoalWithMeta> {
    await this.assertMember(userId, workspaceId)
    const goal = await this.repo.findByIdWorkspace(goalId, workspaceId)
    if (!goal) throw notFound('Goal not found')
    if (goal.status === 'complete') return this.withMeta(goal)

    const byWallet = new Map<string, number>()
    for (const c of goal.contributions) {
      byWallet.set(c.walletId, (byWallet.get(c.walletId) ?? 0) + c.amountMinor)
    }
    for (const [walletId, amountMinor] of byWallet) {
      const wallet = await this.wallets.findByIdWorkspace(walletId, workspaceId)
      if (!wallet) continue
      await this.wallets.adjustHeld(walletId, -amountMinor)
      await this.transactions.createSystem(workspaceId, {
        type: 'expense',
        amount: fromMinor(amountMinor, wallet.currency),
        walletId,
        date: dateKey(new Date()),
        notes: `Savings goal: ${goal.name}`
      })
    }
    const updated = await this.repo.update(goalId, workspaceId, {
      status: 'complete',
      completedAt: new Date()
    })
    await publish(`goal:${goalId}`, {
      type: 'goal:milestone',
      payload: { goalId, milestone: 100 },
      timestamp: Date.now()
    })
    await this.audit.log(workspaceId, userId, 'goal.completed', 'goal', goalId, { savedMinor: goal.contributions.reduce((s, c) => s + c.amountMinor, 0) })
    return this.withMeta(updated as Goal)
  }

  async archive(userId: string, workspaceId: string, goalId: string): Promise<void> {
    await this.assertMember(userId, workspaceId)
    const goal = await this.repo.findByIdWorkspace(goalId, workspaceId)
    if (!goal) throw notFound('Goal not found')
    if (goal.status === 'active') {
      const byWallet = new Map<string, number>()
      for (const c of goal.contributions) {
        byWallet.set(c.walletId, (byWallet.get(c.walletId) ?? 0) + c.amountMinor)
      }
      for (const [walletId, amountMinor] of byWallet) {
        await this.wallets.adjustHeld(walletId, -amountMinor)
      }
    }
    await this.repo.update(goalId, workspaceId, { status: 'archived', archivedAt: new Date() })
    await this.audit.log(workspaceId, userId, 'goal.archived', 'goal', goalId)
  }
}
