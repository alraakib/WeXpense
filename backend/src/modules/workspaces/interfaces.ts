import { Role } from '@/shared/types'

export interface Workspace {
  _id: string
  name: string
  type: 'personal' | 'shared'
  baseCurrency: string
  createdBy: string
  archivedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface Membership {
  _id: string
  workspaceId: string
  userId: string
  role: Role
  status: 'invited' | 'pending' | 'active' | 'rejected'
  invitedBy?: string
  joinedAt?: Date
  approvedAt?: Date
  createdAt: Date
}

export interface Invite {
  _id: string
  workspaceId: string
  email?: string
  token: string
  role: Role
  createdBy: string
  expiresAt: Date
  usedAt?: Date | null
  createdAt: Date
}

export interface CreateWorkspaceInput {
  name: string
  type?: 'personal' | 'shared'
  baseCurrency?: string
}

export interface WorkspaceWithMeta extends Workspace {
  role: Role
  memberCount: number
  membershipStatus: string
}
