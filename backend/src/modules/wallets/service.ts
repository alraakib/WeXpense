import { badRequest, notFound } from '@/shared/errors'
import { convertMinor, toMinor } from '@/shared/utils/money'
import { cacheDelKey } from '@/shared/db/redis'
import { publish } from '@/shared/realtime'
import { WalletRepo } from './repository'
import { Wallet, CreateWalletInput, UpdateWalletInput, WalletWithEquivalent } from './interfaces'
import { WorkspaceRepo } from '@/modules/workspaces/repository'
import { BillingService } from '@/modules/billing/service'
import { AuditService } from '@/modules/audit/service'
import { ConfigService } from '@/modules/config/service'

export class WalletService {
  constructor(
    private repo = new WalletRepo(),
    private workspaces = new WorkspaceRepo(),
    private billing = new BillingService(undefined, {
      workspacesByUser: async () => 0,
      walletsByWorkspace: async (workspaceId) => this.repo.countByWorkspace(workspaceId)
    }),
    private audit = new AuditService(),
    private config = new ConfigService()
  ) {}

  private async requireActiveMembership(userId: string, workspaceId: string) {
    const membership = await this.workspaces.findMembership(userId, workspaceId)
    if (!membership || membership.status !== 'active') throw badRequest('Not a member of this workspace', 'NOT_MEMBER')
    return membership
  }

  async create(userId: string, workspaceId: string, input: CreateWalletInput): Promise<Wallet> {
    await this.requireActiveMembership(userId, workspaceId)
    const config = await this.config.getConfig()
    if (!config.currencies.includes(input.currency)) throw badRequest(`Unsupported currency: ${input.currency}`, 'BAD_CURRENCY')
    const allowed = await this.billing.canCreateWallet(userId, workspaceId)
    if (!allowed.ok) throw badRequest(allowed.reason as string, 'TIER_LIMIT')
    const initialMinor = toMinor(input.initialBalance ?? 0, input.currency)
    const wallet = await this.repo.insert({
      workspaceId,
      name: input.name,
      currency: input.currency,
      initialBalanceMinor: initialMinor,
      balanceMinor: initialMinor,
      heldMinor: 0,
      icon: input.icon,
      color: input.color,
      createdBy: userId,
      archivedAt: null
    })
    await this.audit.log(workspaceId, userId, 'wallet.created', 'wallet', wallet._id, { name: wallet.name, currency: wallet.currency })
    await publish(`workspace:${workspaceId}`, {
      type: 'wallet:created',
      payload: wallet,
      timestamp: Date.now()
    })
    return wallet
  }

  async list(userId: string, workspaceId: string, baseCurrency: string): Promise<WalletWithEquivalent[]> {
    await this.requireActiveMembership(userId, workspaceId)
    const wallets = await this.repo.list(workspaceId)
    const equivalentCurrency = baseCurrency
    const { rates } = await this.config.getRates()
    return wallets.map((w) => ({
      ...w,
      equivalentMinor: convertMinor(w.balanceMinor, w.currency, equivalentCurrency, rates),
      equivalentCurrency
    }))
  }

  async get(userId: string, workspaceId: string, walletId: string): Promise<WalletWithEquivalent> {
    await this.requireActiveMembership(userId, workspaceId)
    const wallet = await this.repo.findByIdWorkspace(walletId, workspaceId)
    if (!wallet) throw notFound('Wallet not found')
    const { rates } = await this.config.getRates()
    return {
      ...wallet,
      equivalentMinor: convertMinor(wallet.balanceMinor, wallet.currency, 'USD', rates),
      equivalentCurrency: 'USD'
    }
  }

  async update(userId: string, workspaceId: string, walletId: string, input: UpdateWalletInput): Promise<Wallet> {
    await this.requireActiveMembership(userId, workspaceId)
    const wallet = await this.repo.findByIdWorkspace(walletId, workspaceId)
    if (!wallet) throw notFound('Wallet not found')
    const updated = await this.repo.update(walletId, workspaceId, {
      name: input.name ?? wallet.name,
      icon: input.icon ?? wallet.icon,
      color: input.color ?? wallet.color
    })
    await this.audit.log(workspaceId, userId, 'wallet.updated', 'wallet', walletId)
    return updated as Wallet
  }

  async archive(userId: string, workspaceId: string, walletId: string): Promise<void> {
    await this.requireActiveMembership(userId, workspaceId)
    const wallet = await this.repo.findByIdWorkspace(walletId, workspaceId)
    if (!wallet) throw notFound('Wallet not found')
    await this.repo.archive(walletId, workspaceId)
    await cacheDelKey(`wallet:balance:${walletId}`)
    await this.audit.log(workspaceId, userId, 'wallet.archived', 'wallet', walletId)
  }
}
