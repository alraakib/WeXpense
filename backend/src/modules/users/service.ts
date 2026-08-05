import { getDb } from '@/shared/db/mongo'
import { ObjectId, MongoNetworkError } from 'mongodb'
import { badRequest, notFound } from '@/shared/errors'
import { cacheDelKey } from '@/shared/db/redis'
import { publish } from '@/shared/realtime'
import { SettingsRepo } from './settings-repository'
import { UsersRepo } from './repository'
import { UserProfile, UserSettings, CompleteOnboardingInput, NotificationPrefs } from './interfaces'
import { WorkspaceService } from '@/modules/workspaces/service'
import { WorkspaceRepo } from '@/modules/workspaces/repository'
import { WalletRepo } from '@/modules/wallets/repository'
import { WalletService } from '@/modules/wallets/service'
import { GoalService } from '@/modules/goals/service'
import { NotificationService } from '@/modules/notifications/service'
import { ConfigService } from '@/modules/config/service'
import { enqueue } from '@/shared/queue'

interface UserDoc {
  _id: string | ObjectId
  name: string
  email: string
  image?: string | null
  emailVerified?: boolean
  role?: string
  banned?: boolean
  createdAt?: Date
}

const usersColl = () => getDb().collection<UserDoc>('users')

const toUserId = (id: string): string | ObjectId =>
  /^[0-9a-f]{24}$/.test(id) ? new ObjectId(id) : id

export class UserService {
  constructor(
    private settings = new SettingsRepo(),
    private users = new UsersRepo(),
    private workspaces = new WorkspaceService(),
    private workspaceRepo = new WorkspaceRepo(),
    private wallets = new WalletRepo(),
    private walletService = new WalletService(),
    private goals = new GoalService(),
    private notifications = new NotificationService(),
    private config = new ConfigService()
  ) {}

  async getProfile(userId: string): Promise<UserProfile> {
    const user = await usersColl().findOne({ _id: toUserId(userId) })
    if (!user) throw notFound('User not found')
    return {
      id: String(user._id),
      name: user.name,
      email: user.email,
      image: user.image ?? null,
      emailVerified: Boolean(user.emailVerified),
      role: user.role ?? 'user',
      createdAt: user.createdAt
    }
  }

  async updateProfile(userId: string, patch: { name?: string; image?: string | null }): Promise<UserProfile> {
    const set: Record<string, unknown> = {}
    if (patch.name !== undefined) set.name = patch.name
    if (patch.image !== undefined) set.image = patch.image
    await usersColl().updateOne({ _id: toUserId(userId) }, { $set: set })
    await cacheDelKey(`user:profile:${userId}`)
    await publish(`user:${userId}`, {
      type: 'user:profile_updated',
      payload: { userId },
      timestamp: Date.now()
    })
    return this.getProfile(userId)
  }

  async getSettings(userId: string): Promise<UserSettings> {
    return this.settings.ensure(userId)
  }

  async updateSettings(
    userId: string,
    patch: Omit<Partial<UserSettings>, 'notifyEmail' | 'notifyPush'> & { notifyEmail?: Partial<NotificationPrefs> }
  ): Promise<UserSettings> {
    const current = await this.settings.ensure(userId)
    const next: Partial<UserSettings> = {}
    if (patch.baseCurrency !== undefined) {
      const config = await this.config.getConfig()
      if (!config.currencies.includes(patch.baseCurrency)) {
        throw badRequest(`Unsupported currency: ${patch.baseCurrency}`, 'BAD_CURRENCY')
      }
      next.baseCurrency = patch.baseCurrency
    }
    if (patch.theme !== undefined) next.theme = patch.theme
    if (patch.timezone !== undefined) next.timezone = patch.timezone
    if (patch.onboardingCompleted !== undefined) next.onboardingCompleted = patch.onboardingCompleted
    if (patch.notifyEmail !== undefined) {
      next.notifyEmail = { ...current.notifyEmail, ...patch.notifyEmail }
    }
    const updated = await this.settings.update(userId, next)
    await publish(`user:${userId}`, {
      type: 'user:settings_updated',
      payload: { userId },
      timestamp: Date.now()
    })
    return updated
  }

  async provisionNewUser(userId: string, email: string, name: string): Promise<void> {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await this.settings.ensure(userId)
        const workspaces = await this.workspaceRepo.findByUser(userId)
        if (!workspaces.length) {
          const workspace = await this.workspaces.create(userId, {
            name: `${name.split(' ')[0] ?? 'My'}'s Workspace`,
            type: 'personal',
            baseCurrency: 'USD'
          })
          await this.walletService.create(userId, workspace._id, {
            name: 'Cash',
            currency: 'USD',
            initialBalance: 0
          })
        }
        await this.notifications.create(userId, 'welcome', 'Welcome to WeXpense!', 'Track budgets, save goals, and manage money together.', {})
        await enqueue({
          name: 'email.send',
          payload: {
            to: email,
            subject: 'Welcome to WeXpense',
            html: `<p>Hi ${name},</p><p>Welcome to WeXpense. Start by setting up your first workspace.</p>`
          }
        })
        return
      } catch (err) {
        const transient = err instanceof MongoNetworkError
        if (!transient || attempt === 2) {
          console.error('[provision] failed for', userId, err)
          return
        }
        await new Promise((r) => setTimeout(r, 150 * (attempt + 1)))
      }
    }
  }

  async completeOnboarding(userId: string, input: CompleteOnboardingInput): Promise<Record<string, unknown>> {
    const config = await this.config.getConfig()
    if (!config.currencies.includes(input.baseCurrency)) {
      throw badRequest(`Unsupported currency: ${input.baseCurrency}`, 'BAD_CURRENCY')
    }
    await this.settings.update(userId, {
      baseCurrency: input.baseCurrency,
      onboardingCompleted: true
    })
    const results: Record<string, unknown> = {}
    const workspaces = await this.workspaceRepo.findByUser(userId)
    const workspace = workspaces[0]
    if (workspace) {
      if (input.walletName) {
        results.wallet = await this.walletService.create(userId, workspace._id, {
          name: input.walletName,
          currency: input.walletCurrency ?? input.baseCurrency,
          initialBalance: input.initialBalance ?? 0
        })
      }
      if (input.goalName && input.goalTarget) {
        results.goal = await this.goals.create(userId, workspace._id, {
          name: input.goalName,
          target: input.goalTarget,
          currency: input.baseCurrency
        })
      }
    }
    return results
  }

  async exportData(userId: string): Promise<Record<string, unknown>> {
    const [profile, settings, workspaces] = await Promise.all([
      this.getProfile(userId),
      this.getSettings(userId),
      this.workspaceRepo.findByUser(userId)
    ])
    const data: Record<string, unknown> = { profile, settings, workspaces: [] as unknown[] }
    for (const workspace of workspaces) {
      const [wallets, memberships, transactions, goals, budgets] = await Promise.all([
        this.wallets.list(workspace._id, true),
        this.workspaceRepo.membershipsInWorkspace(workspace._id),
        getDb().collection('transactions').find({ workspaceId: workspace._id, archivedAt: null }).toArray(),
        getDb().collection('savings_goals').find({ workspaceId: workspace._id }).toArray(),
        getDb().collection('budgets').find({ workspaceId: workspace._id }).toArray()
      ])
      ;(data.workspaces as unknown[]).push({ ...workspace, wallets, memberships, transactions, goals, budgets })
    }
    return data
  }

  async deleteAccount(userId: string): Promise<void> {
    const memberships = await getDb().collection('workspace_members').find({ userId }).toArray()
    for (const membership of memberships) {
      const workspace = await this.workspaceRepo.findWorkspaceById(membership.workspaceId)
      if (workspace && workspace.createdBy === userId) {
        await this.workspaceRepo.archiveWorkspace(workspace._id)
      }
    }
    await getDb().collection('workspace_members').deleteMany({ userId })
    await getDb().collection('user_settings').deleteMany({ userId })
    await getDb().collection('notifications').deleteMany({ userId })
    await usersColl().updateOne(
      { _id: toUserId(userId) },
      { $set: { deletedAt: new Date(), banned: true, email: `deleted-${userId}@wexpense.local` } }
    )
    await getDb().collection('sessions').deleteMany({ userId: toUserId(userId) })
  }
}
