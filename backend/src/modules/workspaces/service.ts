import { badRequest, forbidden, notFound } from '@/shared/errors'
import { token } from '@/shared/utils/ids'
import { cacheDelKey } from '@/shared/db/redis'
import { publish } from '@/shared/realtime'
import { addDaysUtc } from '@/shared/utils/dates'
import { ALL_ROLES, MANAGE_ROLES, Role, isManager } from '@/shared/types'
import { getEnv } from '@/env'
import { WorkspaceRepo } from './repository'
import { Workspace, Membership, Invite, CreateWorkspaceInput, WorkspaceWithMeta } from './interfaces'
import { UsersRepo } from '@/modules/users/repository'
import { BillingService } from '@/modules/billing/service'
import { AuditService } from '@/modules/audit/service'
import { NotificationService } from '@/modules/notifications/service'
import { CategoryRepo } from '@/modules/categories/repository'
import { ConfigService } from '@/modules/config/service'
import { enqueue } from '@/shared/queue'

export class WorkspaceService {
  constructor(
    private repo = new WorkspaceRepo(),
    private users = new UsersRepo(),
    private billing = new BillingService(),
    private audit = new AuditService(),
    private notifications = new NotificationService(),
    private categories = new CategoryRepo(),
    private config = new ConfigService()
  ) {}

  private async requireMembership(userId: string, workspaceId: string): Promise<Membership> {
    const membership = await this.repo.findMembership(userId, workspaceId)
    if (!membership || membership.status !== 'active') throw forbidden('Not a member of this workspace')
    return membership
  }

  private async requireManager(membership: Membership): Promise<void> {
    if (!isManager(membership.role)) throw forbidden('Manager role required')
  }

  async create(userId: string, input: CreateWorkspaceInput): Promise<Workspace> {
    const type = input.type ?? 'personal'
    if (type === 'shared') await this.billing.requireTeamForShared(userId)
    const allowed = await this.billing.canCreateWorkspace(userId)
    if (!allowed.ok) throw badRequest(allowed.reason as string, 'TIER_LIMIT')
    const config = await this.config.getConfig()
    const currency = input.baseCurrency ?? 'USD'
    if (!config.currencies.includes(currency)) throw badRequest(`Unsupported currency: ${currency}`, 'BAD_CURRENCY')
    const workspace = await this.repo.insertWorkspace({
      name: input.name,
      type,
      baseCurrency: currency,
      createdBy: userId,
      archivedAt: null
    })
    await this.repo.insertMembership({
      workspaceId: workspace._id,
      userId,
      role: 'owner',
      status: 'active',
      joinedAt: new Date(),
      approvedAt: new Date()
    })
    await this.categories.insertMany(workspace._id, userId)
    await this.audit.log(workspace._id, userId, 'workspace.created', 'workspace', workspace._id, { name: workspace.name })
    return workspace
  }

  async listForUser(userId: string): Promise<WorkspaceWithMeta[]> {
    const workspaces = await this.repo.findByUser(userId)
    if (!workspaces.length) return []
    const memberCounts = await this.repo.memberCounts(workspaces.map((w) => w._id))
    const rows: WorkspaceWithMeta[] = []
    for (const w of workspaces) {
      const membership = await this.repo.findMembership(userId, w._id)
      if (!membership) continue
      rows.push({
        ...w,
        role: membership.role,
        memberCount: memberCounts.get(w._id) ?? 1,
        membershipStatus: membership.status
      })
    }
    return rows
  }

  async get(userId: string, workspaceId: string): Promise<WorkspaceWithMeta> {
    const membership = await this.requireMembership(userId, workspaceId)
    const workspace = await this.repo.findWorkspaceById(workspaceId)
    if (!workspace) throw notFound('Workspace not found')
    return {
      ...workspace,
      role: membership.role,
      memberCount: await this.repo.activeMembershipCount(workspaceId),
      membershipStatus: membership.status
    }
  }

  async getMembership(userId: string, workspaceId: string): Promise<Membership | null> {
    return this.repo.findMembership(userId, workspaceId)
  }

  async update(userId: string, workspaceId: string, patch: { name?: string; baseCurrency?: string }): Promise<Workspace> {
    const membership = await this.requireMembership(userId, workspaceId)
    await this.requireManager(membership)
    const workspace = await this.repo.findWorkspaceById(workspaceId)
    if (!workspace) throw notFound('Workspace not found')
    const set: Partial<Workspace> = {}
    if (patch.name !== undefined) set.name = patch.name
    if (patch.baseCurrency !== undefined) {
      const config = await this.config.getConfig()
      if (!config.currencies.includes(patch.baseCurrency)) throw badRequest(`Unsupported currency: ${patch.baseCurrency}`, 'BAD_CURRENCY')
      set.baseCurrency = patch.baseCurrency
    }
    const updated = await this.repo.updateWorkspace(workspaceId, set)
    await this.audit.log(workspaceId, userId, 'workspace.updated', 'workspace', workspaceId, patch)
    return updated as Workspace
  }

  async archive(userId: string, workspaceId: string): Promise<void> {
    const membership = await this.requireMembership(userId, workspaceId)
    await this.requireManager(membership)
    await this.repo.archiveWorkspace(workspaceId)
    await this.audit.log(workspaceId, userId, 'workspace.archived', 'workspace', workspaceId)
  }

  async listMembers(userId: string, workspaceId: string): Promise<Array<Record<string, unknown>>> {
    await this.requireMembership(userId, workspaceId)
    const memberships = await this.repo.membershipsInWorkspace(workspaceId)
    const users = await this.users.findByIds(memberships.map((m) => m.userId))
    const byId = new Map(users.map((u) => [u._id, u]))
    return memberships.map((m) => ({
      userId: m.userId,
      name: byId.get(m.userId)?.name ?? 'Unknown',
      email: byId.get(m.userId)?.email ?? '',
      image: byId.get(m.userId)?.image ?? null,
      role: m.role,
      status: m.status,
      joinedAt: m.joinedAt ?? null,
      approvedAt: m.approvedAt ?? null,
      invitedAt: m.createdAt
    }))
  }

  async inviteByEmail(userId: string, workspaceId: string, email: string, role: Role = 'viewer'): Promise<Invite> {
    const membership = await this.requireMembership(userId, workspaceId)
    await this.requireManager(membership)
    if (role === 'owner') throw badRequest('Owner role cannot be invited')
    await this.billing.canInviteMembers(userId)
    const existing = await this.repo.findInviteByEmail(workspaceId, email)
    if (existing) throw badRequest('An active invite already exists for this email', 'INVITE_EXISTS')
    const invite = await this.repo.insertInvite({
      workspaceId,
      email: email.toLowerCase(),
      token: token(),
      role,
      createdBy: userId,
      expiresAt: addDaysUtc(new Date(), 7)
    })
    const workspace = await this.repo.findWorkspaceById(workspaceId)
    const target = await this.users.findByEmail(email)
    if (target) {
      await this.repo.insertMembership({
        workspaceId,
        userId: target._id,
        role,
        status: 'invited',
        invitedBy: userId
      })
      await this.notifications.create(
        target._id,
        'workspace_invite',
        `Invited to ${workspace?.name ?? 'a workspace'}`,
        `You were invited as ${role}. Join to request access.`,
        { workspaceId, token: invite.token }
      )
    } else {
      await enqueue({
        name: 'email.send',
        payload: {
          to: email,
          subject: `You're invited to ${workspace?.name ?? 'WeXpense'}`,
          html: `<p>Join <strong>${workspace?.name ?? 'a WeXpense workspace'}</strong> as ${role}.</p><p>Sign up at ${getEnv().APP_URL}/signup and use the invite token: <code>${invite.token}</code></p>`
        }
      })
    }
    await this.audit.log(workspaceId, userId, 'member.invited', 'workspace', workspaceId, { email, role })
    return invite
  }

  async createInviteLink(userId: string, workspaceId: string, role: Role = 'viewer'): Promise<string> {
    const membership = await this.requireMembership(userId, workspaceId)
    await this.requireManager(membership)
    if (role === 'owner') throw badRequest('Owner role cannot be invited')
    await this.billing.canInviteMembers(userId)
    const invite = await this.repo.insertInvite({
      workspaceId,
      token: token(),
      role,
      createdBy: userId,
      expiresAt: addDaysUtc(new Date(), 7)
    })
    await this.audit.log(workspaceId, userId, 'member.invited', 'workspace', workspaceId, { link: true, role })
    return invite.token
  }

  async joinByToken(userId: string, workspaceId: string, inviteToken: string): Promise<Membership> {
    const workspace = await this.repo.findWorkspaceById(workspaceId)
    if (!workspace) throw notFound('Workspace not found')
    const invite = await this.repo.findInviteByToken(inviteToken)
    if (!invite || invite.workspaceId !== workspaceId) throw badRequest('Invalid invite token', 'BAD_INVITE')
    if (invite.expiresAt < new Date()) throw badRequest('Invite has expired', 'INVITE_EXPIRED')
    let membership = await this.repo.findMembership(userId, workspaceId)
    if (membership?.status === 'active') return membership
    if (membership) {
      membership = await this.repo.updateMembership(userId, workspaceId, { status: 'pending', role: invite.role })
    } else {
      membership = await this.repo.insertMembership({
        workspaceId,
        userId,
        role: invite.role,
        status: 'pending',
        invitedBy: invite.createdBy
      })
    }
    await this.repo.markInviteUsed(invite._id)
    await this.audit.log(workspaceId, userId, 'member.joined', 'workspace', workspaceId, { pending: true })
    const managers = (await this.repo.membershipsInWorkspace(workspaceId)).filter((m) => isManager(m.role))
    for (const manager of managers) {
      await this.notifications.create(
        manager.userId,
        'member_joined',
        'New join request',
        `A user requested access to ${workspace.name}. Approve or reject the request.`,
        { workspaceId, userId }
      )
    }
    if (!membership) throw notFound('Membership not created')
    return membership
  }

  async approveMember(userId: string, workspaceId: string, targetUserId: string): Promise<Membership | null> {
    const membership = await this.requireMembership(userId, workspaceId)
    await this.requireManager(membership)
    const target = await this.repo.findMembership(targetUserId, workspaceId)
    if (!target) throw notFound('Member not found')
    const updated = await this.repo.updateMembership(targetUserId, workspaceId, {
      status: 'active',
      approvedAt: new Date()
    })
    await this.audit.log(workspaceId, userId, 'member.approved', 'workspace', workspaceId, { targetUserId })
    await this.notifications.create(targetUserId, 'member_approved', 'Access approved', 'Your workspace access request was approved.')
    await publish(`workspace:${workspaceId}`, {
      type: 'workspace:member_joined',
      payload: { userId: targetUserId, role: target.role },
      timestamp: Date.now()
    })
    return updated
  }

  async rejectMember(userId: string, workspaceId: string, targetUserId: string): Promise<void> {
    const membership = await this.requireMembership(userId, workspaceId)
    await this.requireManager(membership)
    await this.repo.updateMembership(targetUserId, workspaceId, { status: 'rejected' })
    await this.audit.log(workspaceId, userId, 'member.removed', 'workspace', workspaceId, { targetUserId, reason: 'rejected' })
  }

  async changeRole(userId: string, workspaceId: string, targetUserId: string, role: Role): Promise<Membership | null> {
    const membership = await this.requireMembership(userId, workspaceId)
    await this.requireManager(membership)
    if (role === 'owner') throw badRequest('Owner role cannot be assigned')
    const target = await this.repo.findMembership(targetUserId, workspaceId)
    if (!target) throw notFound('Member not found')
    if (target.role === 'owner') throw badRequest('Owner role cannot be changed')
    if (targetUserId === userId && target.role === 'admin' && role !== 'admin') {
      const adminCount = (await this.repo.membershipsInWorkspace(workspaceId)).filter(
        (m) => m.role === 'admin' && m.status === 'active'
      ).length
      if (adminCount <= 1) throw badRequest('Cannot demote the last admin')
    }
    const updated = await this.repo.updateMembership(targetUserId, workspaceId, { role })
    await cacheDelKey(`ws:access:${targetUserId}:${workspaceId}`)
    await this.audit.log(workspaceId, userId, 'member.role_changed', 'workspace', workspaceId, { targetUserId, role })
    return updated
  }

  async removeMember(userId: string, workspaceId: string, targetUserId: string): Promise<void> {
    const membership = await this.requireMembership(userId, workspaceId)
    await this.requireManager(membership)
    if (targetUserId === userId) throw badRequest('Use leave instead')
    const target = await this.repo.findMembership(targetUserId, workspaceId)
    if (!target) throw notFound('Member not found')
    if (target.role === 'owner') throw badRequest('Owner cannot be removed')
    await this.repo.deleteMembership(targetUserId, workspaceId)
    await this.audit.log(workspaceId, userId, 'member.removed', 'workspace', workspaceId, { targetUserId })
    await publish(`workspace:${workspaceId}`, {
      type: 'workspace:member_left',
      payload: { userId: targetUserId },
      timestamp: Date.now()
    })
  }

  async leave(userId: string, workspaceId: string): Promise<void> {
    const membership = await this.requireMembership(userId, workspaceId)
    if (membership.role === 'owner') throw badRequest('Owner cannot leave. Archive the workspace instead.')
    await this.repo.deleteMembership(userId, workspaceId)
    await this.audit.log(workspaceId, userId, 'member.left', 'workspace', workspaceId)
    await publish(`workspace:${workspaceId}`, {
      type: 'workspace:member_left',
      payload: { userId },
      timestamp: Date.now()
    })
  }

  async memberIds(workspaceId: string): Promise<string[]> {
    const memberships = await this.repo.membershipsInWorkspace(workspaceId)
    return memberships.filter((m) => m.status === 'active').map((m) => m.userId)
  }
}
