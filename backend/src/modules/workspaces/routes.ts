import { Elysia, t } from 'elysia'
import { WorkspaceService } from './service'
import {
  CreateWorkspaceSchema,
  UpdateWorkspaceSchema,
  InviteByEmailSchema,
  InviteLinkSchema,
  ChangeRoleSchema,
  JoinSchema
} from './validation'
import { ok, paged, parsePagination } from '@/shared/http'
import { authGroup, getSession } from '@/shared/middleware/auth'
import { wsGroup } from '@/shared/middleware/workspace'
import { AuditService } from '@/modules/audit/service'
import { ALL_ROLES, MANAGE_ROLES } from '@/shared/types'

const workspaces = new WorkspaceService()
const audit = new AuditService()

export const workspaceRoutes = new Elysia({ name: 'workspace-routes' })
  .use(
    authGroup()
      .get('/api/workspaces', async ({ user }) => ok(await workspaces.listForUser(user.id)))
      .post('/api/workspaces', async ({ user, body }) => ok(await workspaces.create(user.id, body)), {
        body: CreateWorkspaceSchema
      })
      .post('/api/workspaces/:workspaceId/join', async ({ user, params, body }) => {
        return ok(await workspaces.joinByToken(user.id, params.workspaceId, body.token))
      }, { body: JoinSchema })
  )
  .use(
    wsGroup(ALL_ROLES)
      .get('/api/workspaces/:workspaceId', async ({ workspaceId, user }) => ok(await workspaces.get(user.id, workspaceId)))
      .get('/api/workspaces/:workspaceId/members', async ({ workspaceId, user }) => ok(await workspaces.listMembers(user.id, workspaceId)))
      .get('/api/workspaces/:workspaceId/audit', async ({ workspaceId, user, query }) => {
        const { page, limit } = parsePagination(query)
        const { rows, total } = await audit.list({ workspaceId, page, limit })
        return paged(rows, total, page, limit)
      }, {
        query: t.Object({
          page: t.Optional(t.String()),
          limit: t.Optional(t.String()),
          actorId: t.Optional(t.String()),
          action: t.Optional(t.String())
        })
      })
      .delete('/api/workspaces/:workspaceId/leave', async ({ workspaceId, user }) => {
        await workspaces.leave(user.id, workspaceId)
        return ok({ left: true })
      })
  )
  .use(
    wsGroup(MANAGE_ROLES)
      .patch('/api/workspaces/:workspaceId', async ({ workspaceId, user, body }) => {
        return ok(await workspaces.update(user.id, workspaceId, body))
      }, { body: UpdateWorkspaceSchema })
      .delete('/api/workspaces/:workspaceId', async ({ workspaceId, user }) => {
        await workspaces.archive(user.id, workspaceId)
        return ok({ archived: true })
      })
      .post('/api/workspaces/:workspaceId/invites', async ({ workspaceId, user, body }) => {
        return ok(await workspaces.inviteByEmail(user.id, workspaceId, body.email, body.role ?? 'viewer'))
      }, { body: InviteByEmailSchema })
      .post('/api/workspaces/:workspaceId/invite-link', async ({ workspaceId, user, body }) => {
        const inviteToken = await workspaces.createInviteLink(user.id, workspaceId, body.role ?? 'viewer')
        return ok({ url: `/join/${workspaceId}?token=${inviteToken}`, token: inviteToken })
      }, { body: InviteLinkSchema })
      .post('/api/workspaces/:workspaceId/members/:userId/approve', async ({ workspaceId, user, params }) => {
        return ok(await workspaces.approveMember(user.id, workspaceId, params.userId))
      }, { params: t.Object({ workspaceId: t.String(), userId: t.String() }) })
      .post('/api/workspaces/:workspaceId/members/:userId/reject', async ({ workspaceId, user, params }) => {
        await workspaces.rejectMember(user.id, workspaceId, params.userId)
        return ok({ rejected: true })
      }, { params: t.Object({ workspaceId: t.String(), userId: t.String() }) })
      .patch('/api/workspaces/:workspaceId/members/:userId/role', async ({ workspaceId, user, params, body }) => {
        return ok(await workspaces.changeRole(user.id, workspaceId, params.userId, body.role))
      }, {
        params: t.Object({ workspaceId: t.String(), userId: t.String() }),
        body: ChangeRoleSchema
      })
      .delete('/api/workspaces/:workspaceId/members/:userId', async ({ workspaceId, user, params }) => {
        await workspaces.removeMember(user.id, workspaceId, params.userId)
        return ok({ removed: true })
      }, { params: t.Object({ workspaceId: t.String(), userId: t.String() }) })
  )