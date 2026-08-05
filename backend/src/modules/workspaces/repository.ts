import { getDb } from '@/shared/db/mongo'
import { id } from '@/shared/utils/ids'
import { Workspace, Membership, Invite } from './interfaces'
import { Role } from '@/shared/types'

export class WorkspaceRepo {
  private workspaces() {
    return getDb().collection<Workspace>('workspaces')
  }
  private memberships() {
    return getDb().collection<Membership>('workspace_members')
  }
  private invites() {
    return getDb().collection<Invite>('invites')
  }

  async insertWorkspace(w: Omit<Workspace, '_id' | 'createdAt' | 'updatedAt'>): Promise<Workspace> {
    const doc: Workspace = { ...w, _id: id('ws'), createdAt: new Date(), updatedAt: new Date() }
    await this.workspaces().insertOne(doc)
    return doc
  }

  async findWorkspaceById(id: string): Promise<Workspace | null> {
    return this.workspaces().findOne({ _id: id, archivedAt: null })
  }

  async updateWorkspace(id: string, patch: Partial<Workspace>): Promise<Workspace | null> {
    await this.workspaces().updateOne({ _id: id }, { $set: { ...patch, updatedAt: new Date() } })
    return this.workspaces().findOne({ _id: id })
  }

  async archiveWorkspace(id: string): Promise<void> {
    await this.workspaces().updateOne({ _id: id }, { $set: { archivedAt: new Date(), updatedAt: new Date() } })
  }

  async countByUser(userId: string): Promise<number> {
    const ids = await this.memberships().find({ userId, status: 'active' }).project({ workspaceId: 1 }).toArray()
    return this.workspaces().countDocuments({
      _id: { $in: ids.map((m) => m.workspaceId) },
      archivedAt: null
    })
  }

  async findByUser(userId: string): Promise<Workspace[]> {
    const memberships = await this.memberships().find({ userId, status: 'active' }).toArray()
    const wsIds = memberships.map((m) => m.workspaceId)
    if (!wsIds.length) return []
    return this.workspaces().find({ _id: { $in: wsIds }, archivedAt: null }).toArray()
  }

  async insertMembership(m: Omit<Membership, '_id' | 'createdAt'>): Promise<Membership> {
    const doc: Membership = { ...m, _id: id('mem'), createdAt: new Date() }
    await this.memberships().insertOne(doc)
    return doc
  }

  async findMembership(userId: string, workspaceId: string): Promise<Membership | null> {
    return this.memberships().findOne({ userId, workspaceId })
  }

  async updateMembership(userId: string, workspaceId: string, patch: Partial<Membership>): Promise<Membership | null> {
    await this.memberships().updateOne({ userId, workspaceId }, { $set: patch })
    return this.findMembership(userId, workspaceId)
  }

  async deleteMembership(userId: string, workspaceId: string): Promise<void> {
    await this.memberships().deleteOne({ userId, workspaceId })
  }

  async membershipsInWorkspace(workspaceId: string): Promise<Membership[]> {
    return this.memberships().find({ workspaceId }).toArray()
  }

  async activeMembershipCount(workspaceId: string): Promise<number> {
    return this.memberships().countDocuments({ workspaceId, status: 'active' })
  }

  async memberCounts(workspaceIds: string[]): Promise<Map<string, number>> {
    const rows = await this.memberships()
      .aggregate<{ _id: string; count: number }>([
        { $match: { workspaceId: { $in: workspaceIds }, status: 'active' } },
        { $group: { _id: '$workspaceId', count: { $sum: 1 } } }
      ])
      .toArray()
    return new Map(rows.map((r) => [r._id, r.count]))
  }

  async insertInvite(inv: Omit<Invite, '_id' | 'createdAt'>): Promise<Invite> {
    const doc: Invite = { ...inv, _id: id('inv'), createdAt: new Date() }
    await this.invites().insertOne(doc)
    return doc
  }

  async findInviteByToken(token: string): Promise<Invite | null> {
    return this.invites().findOne({ token })
  }

  async findInviteByEmail(workspaceId: string, email: string): Promise<Invite | null> {
    return this.invites().findOne({ workspaceId, email, usedAt: null })
  }

  async markInviteUsed(id: string): Promise<void> {
    await this.invites().updateOne({ _id: id }, { $set: { usedAt: new Date() } })
  }

  async deleteExpiredInvites(): Promise<number> {
    const res = await this.invites().deleteMany({ expiresAt: { $lt: new Date() } })
    return res.deletedCount
  }
}
