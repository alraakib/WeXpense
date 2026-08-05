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
  return { ctx, cookies, wsId }
}

describe('wallets API', () => {
  it('creates a wallet with minor-unit balance math', async () => {
    const { ctx, cookies, wsId } = await withWorkspaceAndUser()
    const res = await ctx.req(handle, cookies, 'POST', `/api/workspaces/${wsId}/wallets`, {
      name: 'Savings',
      currency: 'USD',
      initialBalance: 250.5
    })
    expect(res.status).toBe(200)
    expect(res.json.data.initialBalanceMinor).toBe(25050)
    expect(res.json.data.balanceMinor).toBe(25050)
    expect(res.json.data.name).toBe('Savings')
  })

  it('enforces the hobby limit of 2 wallets', async () => {
    const { ctx, cookies, wsId } = await withWorkspaceAndUser()
    await ctx.req(handle, cookies, 'POST', `/api/workspaces/${wsId}/wallets`, { name: 'A', currency: 'USD' })
    await ctx.req(handle, cookies, 'POST', `/api/workspaces/${wsId}/wallets`, { name: 'B', currency: 'USD' })
    const third = await ctx.req(handle, cookies, 'POST', `/api/workspaces/${wsId}/wallets`, { name: 'C', currency: 'USD' })
    expect(third.status).toBe(400)
    expect(JSON.stringify(third.json)).toMatch(/plan allows 2 wallet/i)
  })

  it('lists and fetches a wallet with converted equivalent', async () => {
    const { ctx, cookies, wsId } = await withWorkspaceAndUser()
    const created = await ctx.req(handle, cookies, 'POST', `/api/workspaces/${wsId}/wallets`, {
      name: 'EUR Wallet',
      currency: 'EUR',
      initialBalance: 100
    })
    const wId = created.json.data._id as string
    const fetched = await ctx.req(handle, cookies, 'GET', `/api/workspaces/${wsId}/wallets/${wId}`)
    expect(fetched.json.data.currency).toBe('EUR')
    expect(fetched.json.data.balanceMinor).toBe(10000)
    expect(fetched.json.data.equivalentMinor).toBeGreaterThan(0)
  })

  it('archives wallets', async () => {
    const { ctx, cookies, wsId } = await withWorkspaceAndUser()
    const created = await ctx.req(handle, cookies, 'POST', `/api/workspaces/${wsId}/wallets`, { name: 'Archive me', currency: 'USD' })
    const wId = created.json.data._id as string
    const archived = await ctx.req(handle, cookies, 'DELETE', `/api/workspaces/${wsId}/wallets/${wId}`)
    expect(archived.status).toBe(200)
    expect(archived.json.data.archived).toBe(true)
    const list = await ctx.req(handle, cookies, 'GET', `/api/workspaces/${wsId}/wallets`)
    expect(list.json.data.some((w: any) => w._id === wId)).toBe(false)
    const gone = await ctx.req(handle, cookies, 'GET', `/api/workspaces/${wsId}/wallets/${wId}`)
    expect(gone.status).toBe(404)
  })

  it('does not allow cross-workspace access', async () => {
    const { cookies } = await withWorkspaceAndUser()
    const other = await withWorkspaceAndUser()
    const res = await ctx2req(handle, cookies, other.wsId)
    expect(res.status).toBe(403)
  })
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ctx2req(handle: any, cookies: string, wsId: string) {
  return getTestContext().req(handle, cookies, 'GET', `/api/workspaces/${wsId}/wallets`)
}