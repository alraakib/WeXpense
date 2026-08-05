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

describe('recurring expenses', () => {
  it('creates a monthly rule', async () => {
    const { ctx, cookies, wsId, walletId } = await withWorkspaceAndUser()
    const res = await ctx.req(handle, cookies, 'POST', `/api/workspaces/${wsId}/recurring`, {
      walletId,
      amount: 120,
      frequency: 'monthly',
      firstDueDate: '2026-09-01',
      notes: 'rent'
    })
    expect(res.status).toBe(200)
    expect(res.json.data.frequency).toBe('monthly')
    expect(res.json.data.active).toBe(true)
    expect(res.json.data.amountMinor).toBe(12000)
  })

  it('processes due rules into transactions and advances the schedule', async () => {
    const { ctx, cookies, wsId, walletId } = await withWorkspaceAndUser()
    const past = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
    const created = await ctx.req(handle, cookies, 'POST', `/api/workspaces/${wsId}/recurring`, {
      walletId,
      amount: 50,
      frequency: 'monthly',
      firstDueDate: past,
      notes: 'subscription'
    })
    expect(created.status).toBe(200)
    const ruleId = created.json.data._id as string

    const { RecurringService } = await import('@/modules/recurring/service')
    const processed = await new RecurringService().processDueRules()
    expect(processed).toBeGreaterThanOrEqual(1)

    const txns = await ctx.req(handle, cookies, 'GET', `/api/workspaces/${wsId}/transactions`)
    const due = txns.json.rows.find((t: any) => (t.notes ?? '').includes('subscription'))
    expect(due).toBeDefined()
    expect(due.amountMinor).toBe(5000)
    expect(due.type).toBe('expense')

    const rules = await ctx.req(handle, cookies, 'GET', `/api/workspaces/${wsId}/recurring`)
    const rule = rules.json.data.find((r: any) => r._id === ruleId)
    expect(rule).toBeDefined()
    expect(rule.nextDueDate).not.toBe(past)
  })

  it('does not double-process the same rule', async () => {
    const { ctx, cookies, wsId, walletId } = await withWorkspaceAndUser()
    const past = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
    await ctx.req(handle, cookies, 'POST', `/api/workspaces/${wsId}/recurring`, {
      walletId,
      amount: 10,
      frequency: 'daily',
      firstDueDate: past
    })
    const { RecurringService } = await import('@/modules/recurring/service')
    const svc = new RecurringService()
    await svc.processDueRules()
    await svc.processDueRules()
    const txns = await ctx.req(handle, cookies, 'GET', `/api/workspaces/${wsId}/transactions`)
    expect(txns.json.total).toBe(1)
  })

  it('deactivates a rule', async () => {
    const { ctx, cookies, wsId, walletId } = await withWorkspaceAndUser()
    const created = await ctx.req(handle, cookies, 'POST', `/api/workspaces/${wsId}/recurring`, {
      walletId,
      amount: 10,
      frequency: 'weekly',
      firstDueDate: '2026-12-01'
    })
    const ruleId = created.json.data._id as string
    const updated = await ctx.req(handle, cookies, 'PATCH', `/api/workspaces/${wsId}/recurring/${ruleId}`, {
      active: false
    })
    expect(updated.status).toBe(200)
    expect(updated.json.data.active).toBe(false)
  })
})