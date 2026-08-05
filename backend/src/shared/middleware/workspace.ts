import { Elysia } from 'elysia'
import { getSession } from './auth'
import { WorkspaceRepo } from '@/modules/workspaces/repository'
import { Role, AuthUser } from '@/shared/types'
import { Membership } from '@/modules/workspaces/interfaces'
import { badRequest, forbidden } from '@/shared/errors'
import { cacheGet, cacheSet } from '@/shared/db/redis'

const repo = new WorkspaceRepo()

export function wsGroup(roles: readonly Role[]) {
  return new Elysia()
    .derive(async ({ request, params }): Promise<{ user: AuthUser; workspaceId: string; membership: Membership }> => {
      const { user } = await getSession(request.headers)
      const workspaceId = params.workspaceId as string | undefined
      if (!workspaceId) throw badRequest('workspaceId is required')
      const cacheKey = `ws:access:${user.id}:${workspaceId}`
      let membership = await cacheGet<Membership>(cacheKey)
      if (!membership) {
        membership = await repo.findMembership(user.id, workspaceId)
        if (membership) await cacheSet(cacheKey, membership, 900)
      }
      if (!membership || membership.status !== 'active') throw forbidden('Not a member of this workspace')
      if (!roles.includes(membership.role)) throw forbidden('Insufficient permissions')
      return { user, workspaceId, membership }
    })
}