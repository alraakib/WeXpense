import { AuditAction } from '@/shared/types'

export interface AuditLog {
  _id: string
  workspaceId: string
  userId: string
  action: AuditAction
  entity: string
  entityId?: string
  meta?: Record<string, unknown>
  createdAt: Date
}

export interface AuditListFilter {
  workspaceId: string
  page: number
  limit: number
  actorId?: string
  action?: string
}
