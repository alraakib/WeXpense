import { Elysia, t } from 'elysia'
import { TransactionService } from './service'
import { CreateTransactionSchema, UpdateTransactionSchema, ListTransactionsSchema } from './validation'
import { ok } from '@/shared/http'
import { wsGroup } from '@/shared/middleware/workspace'
import { parsePagination } from '@/shared/http'
import { ALL_ROLES, EDIT_ROLES } from '@/shared/types'

const transactions = new TransactionService()

export const transactionRoutes = new Elysia({ name: 'transaction-routes' })
  .use(
    wsGroup(ALL_ROLES)
      .get('/api/workspaces/:workspaceId/transactions', async ({ workspaceId, user, query }) => {
        const { page, limit } = parsePagination(query)
        return transactions.list(user.id, workspaceId, {
          page,
          limit,
          type: query.type,
          walletId: query.walletId,
          categoryId: query.categoryId,
          tag: query.tag,
          dateFrom: query.dateFrom,
          dateTo: query.dateTo,
          search: query.search,
          paidBy: query.paidBy
        })
      }, { query: ListTransactionsSchema })
      .get('/api/workspaces/:workspaceId/transactions/:transactionId', async ({ workspaceId, user, params }) => {
        return ok(await transactions.get(user.id, workspaceId, params.transactionId))
      }, { params: t.Object({ workspaceId: t.String(), transactionId: t.String() }) })
  )
  .use(
    wsGroup(EDIT_ROLES)
      .post('/api/workspaces/:workspaceId/transactions', async ({ workspaceId, user, body }) => {
        return ok(await transactions.create(user.id, workspaceId, body))
      }, { body: CreateTransactionSchema })
      .patch('/api/workspaces/:workspaceId/transactions/:transactionId', async ({ workspaceId, user, params, body }) => {
        return ok(await transactions.update(user.id, workspaceId, params.transactionId, body))
      }, { params: t.Object({ workspaceId: t.String(), transactionId: t.String() }), body: UpdateTransactionSchema })
      .delete('/api/workspaces/:workspaceId/transactions/:transactionId', async ({ workspaceId, user, params }) => {
        await transactions.remove(user.id, workspaceId, params.transactionId)
        return ok({ deleted: true })
      }, { params: t.Object({ workspaceId: t.String(), transactionId: t.String() }) })
  )