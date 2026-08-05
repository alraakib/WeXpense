import { AuditRepo } from './repository'
import { AuditListFilter } from './interfaces'
import { AuditAction } from '@/shared/types'

export class AuditService {
  constructor(private repo = new AuditRepo()) {}

  async log(
    workspaceId: string,
    userId: string,
    action: AuditAction,
    entity: string,
    entityId?: string,
    meta?: Record<string, unknown>
  ): Promise<void> {
    try {
      await this.repo.insert({ workspaceId, userId, action, entity, entityId, meta })
    } catch {
      /* audit must never break the primary operation */
    }
  }

  async list(filter: AuditListFilter) {
    return this.repo.list(filter)
  }
}
