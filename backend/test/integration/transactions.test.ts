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

describe('transactions API', () => {
  it('expense decreases wallet balance', async () => {
    const { ctx, cookies, wsId, walletId } = await withWorkspaceAndUser()
    const res = await ctx.req(handle, cookies, 'POST', `/api/workspaces/${wsId}/transactions`, {
      walletId,
      amount: 25.5,
      type: 'expense',
      notes: 'dinner'
    })
    expect(res.status).toBe(200)
    expect(res.json.data.amountMinor).toBe(2550)
    expect(res.json.data.currency).toBe('USD')
    const wallet = await ctx.req(handle, cookies, 'GET', `/api/workspaces/${wsId}/wallets/${walletId}`)
    expect(wallet.json.data.balanceMinor).toBe(-2550)
  })

  it('income increases wallet balance', async () => {
    const { ctx, cookies, wsId, walletId } = await withWorkspaceAndUser()
    await ctx.req(handle, cookies, 'POST', `/api/workspaces/${wsId}/transactions`, {
      walletId,
      amount: 1000,
      type: 'income',
      notes: 'salary'
    })
    const wallet = await ctx.req(handle, cookies, 'GET', `/api/workspaces/${wsId}/wallets/${walletId}`)
    expect(wallet.json.data.balanceMinor).toBe(100000)
  })

  it('transfer moves funds between wallets atomically', async () => {
    const { ctx, cookies, wsId, walletId } = await withWorkspaceAndUser()
    const second = await ctx.req(handle, cookies, 'POST', `/api/workspaces/${wsId}/wallets`, { name: 'B', currency: 'USD' })
    const toId = second.json.data._id as string
    await ctx.req(handle, cookies, 'POST', `/api/workspaces/${wsId}/transactions`, {
      walletId,
      amount: 500,
      type: 'income'
    })
    const transfer = await ctx.req(handle, cookies, 'POST', `/api/workspaces/${wsId}/transactions`, {
      walletId,
      transferToWalletId: toId,
      amount: 200,
      type: 'transfer'
    })
    expect(transfer.status).toBe(200)
    expect(transfer.json.data.type).toBe('transfer')
    const fromWallet = await ctx.req(handle, cookies, 'GET', `/api/workspaces/${wsId}/wallets/${walletId}`)
    const toWallet = await ctx.req(handle, cookies, 'GET', `/api/workspaces/${wsId}/wallets/${toId}`)
    expect(fromWallet.json.data.balanceMinor).toBe(30000)
    expect(toWallet.json.data.balanceMinor).toBe(20000)
  })

  it('transfer without sufficient funds is rejected', async () => {
    const { ctx, cookies, wsId, walletId } = await withWorkspaceAndUser()
    const second = await ctx.req(handle, cookies, 'POST', `/api/workspaces/${wsId}/wallets`, { name: 'B', currency: 'USD' })
    const res = await ctx.req(handle, cookies, 'POST', `/api/workspaces/${wsId}/transactions`, {
      walletId,
      transferToWalletId: second.json.data._id,
      amount: 10,
      type: 'transfer'
    })
    expect(res.status).toBe(400)
  })

  it('lists with pagination and filters', async () => {
    const { ctx, cookies, wsId, walletId } = await withWorkspaceAndUser()
    for (let i = 0; i < 5; i++) {
      await ctx.req(handle, cookies, 'POST', `/api/workspaces/${wsId}/transactions`, {
        walletId,
        amount: 10 + i,
        type: i % 2 === 0 ? 'income' : 'expense',
        notes: `tx-${i}`
      })
    }
    const page1 = await ctx.req(handle, cookies, 'GET', `/api/workspaces/${wsId}/transactions?limit=2&page=1`)
    expect(page1.json.rows.length).toBe(2)
    expect(page1.json.total).toBe(5)
    expect(page1.json.pages).toBe(3)
    const incomeOnly = await ctx.req(handle, cookies, 'GET', `/api/workspaces/${wsId}/transactions?type=income`)
    expect(incomeOnly.json.total).toBe(3)
  })

  it('deleting a transaction restores the balance', async () => {
    const { ctx, cookies, wsId, walletId } = await withWorkspaceAndUser()
    const created = await ctx.req(handle, cookies, 'POST', `/api/workspaces/${wsId}/transactions`, {
      walletId,
      amount: 30,
      type: 'expense'
    })
    const txId = created.json.data._id as string
    await ctx.req(handle, cookies, 'DELETE', `/api/workspaces/${wsId}/transactions/${txId}`)
    const wallet = await ctx.req(handle, cookies, 'GET', `/api/workspaces/${wsId}/wallets/${walletId}`)
    expect(wallet.json.data.balanceMinor).toBe(0)
  })

  it('updating amount adjusts the balance', async () => {
    const { ctx, cookies, wsId, walletId } = await withWorkspaceAndUser()
    const created = await ctx.req(handle, cookies, 'POST', `/api/workspaces/${wsId}/transactions`, {
      walletId,
      amount: 10,
      type: 'expense'
    })
    const txId = created.json.data._id as string
    const updated = await ctx.req(handle, cookies, 'PATCH', `/api/workspaces/${wsId}/transactions/${txId}`, { amount: 40 })
    expect(updated.status).toBe(200)
    expect(updated.json.data.amountMinor).toBe(4000)
    const wallet = await ctx.req(handle, cookies, 'GET', `/api/workspaces/${wsId}/wallets/${walletId}`)
    expect(wallet.json.data.balanceMinor).toBe(-4000)
  })

  it('rejects a transaction in another workspace', async () => {
    const { ctx, cookies, wsId, walletId } = await withWorkspaceAndUser()
    const other = await withWorkspaceAndUser()
    const res = await ctx.req(handle, cookies, 'POST', `/api/workspaces/${other.wsId}/transactions`, {
      walletId,
      amount: 5,
      type: 'expense'
    })
    expect(res.status).toBe(403)
  })
})