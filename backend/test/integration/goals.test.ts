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

describe('goals API', () => {
  it('creates a goal with target in minor units', async () => {
    const { ctx, cookies, wsId } = await withWorkspaceAndUser()
    const res = await ctx.req(handle, cookies, 'POST', `/api/workspaces/${wsId}/goals`, {
      name: 'Emergency Fund',
      target: 5000,
      currency: 'USD',
      targetDate: '2027-01-01'
    })
    expect(res.status).toBe(200)
    expect(res.json.data.targetMinor).toBe(500000)
    expect(res.json.data.status).toBe('active')
    expect(res.json.data.progressPercent).toBe(0)
  })

  it('contribution holds money in the wallet and tracks progress', async () => {
    const { ctx, cookies, wsId, walletId } = await withWorkspaceAndUser()
    const goal = await ctx.req(handle, cookies, 'POST', `/api/workspaces/${wsId}/goals`, {
      name: 'Vacation',
      target: 1000,
      currency: 'USD'
    })
    const goalId = goal.json.data._id as string
    await ctx.req(handle, cookies, 'POST', `/api/workspaces/${wsId}/transactions`, { walletId, amount: 1000, type: 'income' })
    const contributed = await ctx.req(handle, cookies, 'POST', `/api/workspaces/${wsId}/goals/${goalId}/contribute`, {
      walletId,
      amount: 250
    })
    expect(contributed.status).toBe(200)
    expect(contributed.json.data.progressPercent).toBe(25)
    const wallet = await ctx.req(handle, cookies, 'GET', `/api/workspaces/${wsId}/wallets/${walletId}`)
    expect(wallet.json.data.heldMinor).toBe(25000)
    expect(wallet.json.data.balanceMinor).toBe(100000)
  })

  it('rejects over-contribution', async () => {
    const { ctx, cookies, wsId, walletId } = await withWorkspaceAndUser()
    const goal = await ctx.req(handle, cookies, 'POST', `/api/workspaces/${wsId}/goals`, {
      name: 'Too Big',
      target: 1000,
      currency: 'USD'
    })
    const goalId = goal.json.data._id as string
    const res = await ctx.req(handle, cookies, 'POST', `/api/workspaces/${wsId}/goals/${goalId}/contribute`, {
      walletId,
      amount: 500
    })
    expect(res.status).toBe(400)
    expect(JSON.stringify(res.json)).toMatch(/Insufficient/i)
  })

  it('completes the goal at 100% and converts held money to expense', async () => {
    const { ctx, cookies, wsId, walletId } = await withWorkspaceAndUser()
    const goal = await ctx.req(handle, cookies, 'POST', `/api/workspaces/${wsId}/goals`, {
      name: 'Laptop',
      target: 500,
      currency: 'USD'
    })
    const goalId = goal.json.data._id as string
    await ctx.req(handle, cookies, 'POST', `/api/workspaces/${wsId}/transactions`, { walletId, amount: 500, type: 'income' })
    const done = await ctx.req(handle, cookies, 'POST', `/api/workspaces/${wsId}/goals/${goalId}/contribute`, {
      walletId,
      amount: 500
    })
    expect(done.status).toBe(200)
    expect(done.json.data.status).toBe('complete')
    const wallet = await ctx.req(handle, cookies, 'GET', `/api/workspaces/${wsId}/wallets/${walletId}`)
    expect(wallet.json.data.heldMinor).toBe(0)
    expect(wallet.json.data.balanceMinor).toBe(0)
    const txns = await ctx.req(handle, cookies, 'GET', `/api/workspaces/${wsId}/transactions?type=expense`)
    const goalTxns = txns.json.rows.filter((t: any) => (t.notes ?? '').includes('Laptop'))
    expect(goalTxns.length).toBe(1)
    expect(goalTxns[0].amountMinor).toBe(50000)
  })

  it('emits milestone notifications at 25%', async () => {
    const { ctx, cookies, wsId, walletId } = await withWorkspaceAndUser()
    const goal = await ctx.req(handle, cookies, 'POST', `/api/workspaces/${wsId}/goals`, {
      name: 'Milestone',
      target: 1000,
      currency: 'USD'
    })
    const goalId = goal.json.data._id as string
    await ctx.req(handle, cookies, 'POST', `/api/workspaces/${wsId}/transactions`, { walletId, amount: 1000, type: 'income' })
    await ctx.req(handle, cookies, 'POST', `/api/workspaces/${wsId}/goals/${goalId}/contribute`, { walletId, amount: 250 })
    const notifs = await ctx.req(handle, cookies, 'GET', '/api/notifications')
    const milestone = notifs.json.data.find((n: any) => n.type === 'goal_milestone')
    expect(milestone).toBeDefined()
    expect(JSON.stringify(milestone.data)).toContain('25')
  })
})