export type Role = 'owner' | 'admin' | 'contributor' | 'viewer'
export const ALL_ROLES: Role[] = ['owner', 'admin', 'contributor', 'viewer']
export const MANAGE_ROLES: Role[] = ['owner', 'admin']
export const EDIT_ROLES: Role[] = ['owner', 'admin', 'contributor']
export const isManager = (role: Role) => MANAGE_ROLES.includes(role)
export const canEdit = (role: Role) => EDIT_ROLES.includes(role)

export type Tier = 'hobby' | 'pro' | 'team'
export const TIERS: Tier[] = ['hobby', 'pro', 'team']

export interface AuthUser {
  id: string
  email: string
  name: string
  role: string
  image?: string | null
  emailVerified?: boolean
  banned?: boolean
}

export interface AuthSession {
  id: string
  userId: string
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
  token?: string
  ipAddress?: string
  userAgent?: string
}

export interface Pagination {
  page: number
  limit: number
  skip: number
}

export interface RealTimeEvent {
  type: string
  payload: object
  timestamp: number
}

export interface Envelope {
  channel: string
  event: RealTimeEvent
}

export interface MembershipView {
  userId: string
  name: string
  email: string
  role: Role
  status: string
  joinedAt: Date | null
}

export type AuditAction =
  | 'workspace.created'
  | 'workspace.updated'
  | 'workspace.archived'
  | 'member.invited'
  | 'member.joined'
  | 'member.approved'
  | 'member.role_changed'
  | 'member.removed'
  | 'member.left'
  | 'wallet.created'
  | 'wallet.updated'
  | 'wallet.archived'
  | 'category.created'
  | 'category.updated'
  | 'category.archived'
  | 'tag.created'
  | 'tag.updated'
  | 'tag.deleted'
  | 'transaction.created'
  | 'transaction.updated'
  | 'transaction.deleted'
  | 'recurring.created'
  | 'recurring.updated'
  | 'recurring.deleted'
  | 'goal.created'
  | 'goal.updated'
  | 'goal.contributed'
  | 'goal.completed'
  | 'goal.archived'
  | 'budget.created'
  | 'budget.updated'
  | 'budget.deleted'
