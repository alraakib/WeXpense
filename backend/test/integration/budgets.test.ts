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

async function withProUser(upgrade = true) {
  const ctx = getTestContext()
  const { cookies, userId } = await ctx.signup(handle, `${Math.random().toString(36).slice(2)}@test.dev`, 'Passw0rd123!')
  const list = await ctx.req(handle, cookies, 'GET', '/api/workspaces')
  const wsId = list.json.data[0]._id as string
  const wallets = await ctx.req(handle, cookies, 'GET', `/api/workspaces/${wsId}/wallets`)
  const walletId = wallets.json.data[0]._id as string
  if (upgrade) {
    const upgrade = await ctx.req(handle, null, 'POST', '/api/billing/webhook', {
      type: 'local.tier.updated',
      data: { userId, tier: 'pro' }
    })
    expect(upgrade.status).toBe(200)
  }
  return { ctx, cookies, wsId, walletId }
}

describe('categories & budgets API', () => {
  it('blocks custom categories on the hobby tier', async () => {
    const { ctx, cookies, wsId } = await withProUser(false)
    const res = await ctx.req(handle, cookies, 'POST', `/api/workspaces/${wsId}/categories`, {
      name: 'Custom',
      color: '#FF5733'
    })
    expect(res.status).toBe(400)
    expect(JSON.stringify(res.json)).toMatch(/Pro plan/i)
  })

  it('creates categories and budgets on Pro', async () => {
    const { ctx, cookies, wsId } = await withProUser()
    const cat = await ctx.req(handle, cookies, 'POST', `/api/workspaces/${wsId}/categories`, {
      name: 'Food',
      color: '#FF5733'
    })
    expect(cat.status).toBe(200)
    const catId = cat.json.data._id as string

    const child = await ctx.req(handle, cookies, 'POST', `/api/workspaces/${wsId}/categories`, {
      name: 'Groceries',
      color: '#FF5733',
      parentId: catId
    })
    expect(child.status).toBe(200)
    expect(child.json.data.parentId).toBe(catId)

    const budget = await ctx.req(handle, cookies, 'POST', `/api/workspaces/${wsId}/budgets`, {
      categoryId: catId,
      amount: 100,
      currency: 'USD',
      period: 'monthly'
    })
    expect(budget.status).toBe(200)
    expect(budget.json.data.amountMinor).toBe(10000)
    expect(budget.json.data.categoryId).toBe(catId)
  })

  it('alerts at 80% and 100% thresholds', async () => {
    const { ctx, cookies, wsId, walletId } = await withProUser()
    const cat = await ctx.req(handle, cookies, 'POST', `/api/workspaces/${wsId}/categories`, { name: 'Food', color: '#FF5733' })
    const catId = cat.json.data._id as string
    const budget = await ctx.req(handle, cookies, 'POST', `/api/workspaces/${wsId}/budgets`, {
      categoryId: catId,
      amount: 100,
      currency: 'USD',
      period: 'monthly'
    })
    const budgetId = budget.json.data._id as string

    for (const amt of [80, 20]) {
      await ctx.req(handle, cookies, 'POST', `/api/workspaces/${wsId}/transactions`, {
        walletId,
        categoryId: catId,
        amount: amt,
        type: 'expense'
      })
    }
    const { BudgetService } = await import('@/modules/budgets/service')
    const alerted = await new BudgetService().checkAll()
    expect(alerted).toBeGreaterThanOrEqual(1)

    const notifs = await ctx.req(handle, cookies, 'GET', '/api/notifications')
    const budgetNotifs = notifs.json.data.filter((n: any) => n.type === 'budget_alert')
    expect(budgetNotifs.length).toBeGreaterThanOrEqual(1)
    const latest = budgetNotifs[0].data as { budgetId: string; percentage: number }
    expect(latest.budgetId).toBe(budgetId)
    expect(latest.percentage).toBeGreaterThanOrEqual(80)
  })
})