import '../env'
import { beforeAll, beforeEach, afterAll, describe, it, expect } from 'bun:test'
import { initTestContext, getTestContext } from '../helpers'
import type { App } from '../helpers'

let handle: App

beforeAll(async () => {
  const ctx = await initTestContext()
  await ctx.connect()
  handle = ctx.app
})

beforeEach(async () => {
  await getTestContext().clean()
})

afterAll(async () => {
  await getTestContext().close()
})

async function withWorkspaceAndUser() {
  const ctx = getTestContext()
  const { cookies } = await ctx.signup(handle, `${Math.random().toString(36).slice(2)}@test.dev`, 'Passw0rd123!')
  const list = await ctx.req(handle, cookies, 'GET', '/api/workspaces')
  const wsId = list.json.data[0]._id as string
  const wallets = await ctx.req(handle, cookies, 'GET', `/api/workspaces/${wsId}/wallets`)
  const walletId = wallets.json.data[0]._id as string
  return { ctx, cookies, wsId, walletId }
}

describe('analytics API', () => {
  it('dashboard aggregates income and expense for the month', async () => {
    const { ctx, cookies, wsId, walletId } = await withWorkspaceAndUser()
    await ctx.req(handle, cookies, 'POST', `/api/workspaces/${wsId}/transactions`, { walletId, amount: 1000, type: 'income' })
    await ctx.req(handle, cookies, 'POST', `/api/workspaces/${wsId}/transactions`, { walletId, amount: 300, type: 'expense' })
    await ctx.req(handle, cookies, 'POST', `/api/workspaces/${wsId}/transactions`, { walletId, amount: 50, type: 'expense' })

    const dash = await ctx.req(handle, cookies, 'GET', `/api/workspaces/${wsId}/dashboard`)
    expect(dash.status).toBe(200)
    expect(dash.json.data.incomeMinor).toBe(100000)
    expect(dash.json.data.expenseMinor).toBe(35000)
    expect(dash.json.data.month).toBe(new Date().toISOString().slice(0, 7))
  })

  it('category breakdown only counts the requested category', async () => {
    const { ctx, cookies, wsId, walletId } = await withWorkspaceAndUser()
    const { UserService } = await import('@/modules/users/service')
    const list = await ctx.req(handle, cookies, 'GET', '/api/workspaces')
    const userId = list.json.data[0].createdBy as string
    await new UserService().completeOnboarding(userId, { baseCurrency: 'USD' })
    const dash = await ctx.req(handle, cookies, 'GET', `/api/workspaces/${wsId}/dashboard`)
    expect(dash.status).toBe(200)
  })

  it('trend covers the requested month count', async () => {
    const { ctx, cookies, wsId } = await withWorkspaceAndUser()
    const trend = await ctx.req(handle, cookies, 'GET', `/api/workspaces/${wsId}/analytics/trend?months=12`)
    expect(trend.status).toBe(200)
    expect(trend.json.data.length).toBeGreaterThanOrEqual(3)
  })

  it('exports CSV of transactions', async () => {
    const { ctx, cookies, wsId, walletId } = await withWorkspaceAndUser()
    await ctx.req(handle, cookies, 'POST', `/api/workspaces/${wsId}/transactions`, { walletId, amount: 10, type: 'expense' })
    const csv = await ctx.req(handle, cookies, 'GET', `/api/workspaces/${wsId}/analytics/export?from=2026-01-01&to=2026-12-31`)
    expect(csv.status).toBe(200)
    const text = typeof csv.json === 'string' ? csv.json : JSON.stringify(csv.json)
    expect(text).toContain('expense')
  })

  it('snapshot recompute keeps dashboard fast-path correct', async () => {
    const { ctx, cookies, wsId, walletId } = await withWorkspaceAndUser()
    await ctx.req(handle, cookies, 'POST', `/api/workspaces/${wsId}/transactions`, { walletId, amount: 250, type: 'income' })
    const { AnalyticsService } = await import('@/modules/analytics/service')
    const month = new Date().toISOString().slice(0, 7)
    await new AnalyticsService().recompute(wsId, month)
    const dash = await ctx.req(handle, cookies, 'GET', `/api/workspaces/${wsId}/dashboard`)
    expect(dash.json.data.incomeMinor).toBe(25000)
  })
})