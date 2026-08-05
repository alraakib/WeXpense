import { Elysia, t } from 'elysia'
import { WalletService } from './service'
import { CreateWalletSchema, UpdateWalletSchema } from './validation'
import { ok } from '@/shared/http'
import { wsGroup } from '@/shared/middleware/workspace'
import { WorkspaceRepo } from '@/modules/workspaces/repository'
import { ALL_ROLES, EDIT_ROLES } from '@/shared/types'

const wallets = new WalletService()
const workspaces = new WorkspaceRepo()

export const walletRoutes = new Elysia({ name: 'wallet-routes' })
  .use(
    wsGroup(EDIT_ROLES)
      .post('/api/workspaces/:workspaceId/wallets', async ({ workspaceId, user, body }) => {
        return ok(await wallets.create(user.id, workspaceId, body))
      }, { body: CreateWalletSchema })
      .patch('/api/workspaces/:workspaceId/wallets/:walletId', async ({ workspaceId, user, params, body }) => {
        return ok(await wallets.update(user.id, workspaceId, params.walletId, body))
      }, { params: t.Object({ workspaceId: t.String(), walletId: t.String() }), body: UpdateWalletSchema })
      .delete('/api/workspaces/:workspaceId/wallets/:walletId', async ({ workspaceId, user, params }) => {
        await wallets.archive(user.id, workspaceId, params.walletId)
        return ok({ archived: true })
      }, { params: t.Object({ workspaceId: t.String(), walletId: t.String() }) })
  )
  .use(
    wsGroup(ALL_ROLES)
      .get('/api/workspaces/:workspaceId/wallets', async ({ workspaceId, user }) => {
        const workspace = await workspaces.findWorkspaceById(workspaceId)
        const base = workspace?.baseCurrency ?? 'USD'
        return ok(await wallets.list(user.id, workspaceId, base))
      })
      .get('/api/workspaces/:workspaceId/wallets/:walletId', async ({ workspaceId, user, params }) => {
        return ok(await wallets.get(user.id, workspaceId, params.walletId))
      }, { params: t.Object({ workspaceId: t.String(), walletId: t.String() }) })
  )