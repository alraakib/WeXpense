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
  const ctx = getTestContext()
  await ctx.clean()
})

afterAll(async () => {
  await getTestContext().close()
})

describe('workspaces API', () => {
  it('auto-provisions a personal workspace with a wallet on signup', async () => {
    const ctx = getTestContext()
    const { cookies, userId } = await ctx.signup(handle, 'user1@test.dev', 'Passw0rd123!')
    expect(userId.length).toBeGreaterThan(0)
    expect(cookies).toContain('better-auth.session_token=')

    const list = await ctx.req(handle, cookies, 'GET', '/api/workspaces')
    expect(list.status).toBe(200)
    expect(list.json.success).toBe(true)
    const ws = list.json.data[0]
    expect(ws.type).toBe('personal')
    expect(ws.role).toBe('owner')
    expect(ws.memberCount).toBe(1)

    const wallets = await ctx.req(handle, cookies, 'GET', `/api/workspaces/${ws._id}/wallets`)
    expect(wallets.json.data.length).toBe(1)
    expect(wallets.json.data[0].name).toBe('Cash')
  })

  it('rejects unauthenticated access', async () => {
    const ctx = getTestContext()
    const res = await ctx.req(handle, null, 'GET', '/api/workspaces')
    expect(res.status).toBe(401)
  })

  it('creates a named workspace after upgrading to Pro', async () => {
    const ctx = getTestContext()
    const { cookies, userId } = await ctx.signup(handle, 'user2@test.dev', 'Passw0rd123!')
    await ctx.req(handle, null, 'POST', '/api/billing/webhook', {
      type: 'local.tier.updated',
      data: { userId, tier: 'pro' }
    })
    const created = await ctx.req(handle, cookies, 'POST', '/api/workspaces', {
      name: 'Family Budget',
      type: 'personal'
    })
    expect(created.status).toBe(200)
    expect(created.json.data.name).toBe('Family Budget')
    expect(created.json.data.type).toBe('personal')
  })

  it('blocks shared workspaces on the hobby tier', async () => {
    const ctx = getTestContext()
    const { cookies } = await ctx.signup(handle, 'user3@test.dev', 'Passw0rd123!')
    const res = await ctx.req(handle, cookies, 'POST', '/api/workspaces', {
      name: 'Team',
      type: 'shared'
    })
    expect(res.status).toBe(400)
    expect(JSON.stringify(res.json)).toMatch(/Team plan/i)
  })

  it('respects the hobby workspace limit of 1', async () => {
    const ctx = getTestContext()
    const { cookies } = await ctx.signup(handle, 'user4@test.dev', 'Passw0rd123!')
    const second = await ctx.req(handle, cookies, 'POST', '/api/workspaces', { name: 'Second', type: 'personal' })
    expect(second.status).toBe(400)
    expect(JSON.stringify(second.json)).toMatch(/plan allows 1 workspace/i)
  })

  it('rejects invalid workspace names', async () => {
    const ctx = getTestContext()
    const { cookies } = await ctx.signup(handle, 'user5@test.dev', 'Passw0rd123!')
    const res = await ctx.req(handle, cookies, 'POST', '/api/workspaces', { name: '', type: 'personal' })
    expect(res.status).toBe(422)
  })
})