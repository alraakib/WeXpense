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

async function upgrade(userId: string, tier: string) {
  const ctx = getTestContext()
  const r = await ctx.req(handle, null, 'POST', '/api/billing/webhook', {
    type: 'local.tier.updated',
    data: { userId, tier }
  })
  expect(r.status).toBe(200)
}

async function asTeam() {
  const ctx = getTestContext()
  const { cookies: adminCookies, userId: adminId } = await ctx.signup(handle, `${Math.random().toString(36).slice(2)}@test.dev`, 'Passw0rd123!')
  await upgrade(adminId, 'team')
  const adminList = await ctx.req(handle, adminCookies, 'GET', '/api/workspaces')
  const wsId = adminList.json.data[0]._id as string
  return { ctx, adminCookies, adminId, wsId }
}

describe('workspace collaboration & RBAC', () => {
  it('invites members by email on the Team tier', async () => {
    const { ctx, adminCookies, wsId } = await asTeam()
    const invite = await ctx.req(handle, adminCookies, 'POST', `/api/workspaces/${wsId}/invites`, {
      email: 'joiner@test.dev',
      role: 'viewer'
    })
    expect(invite.status).toBe(200)
    expect(invite.json.data.email).toBe('joiner@test.dev')
  })

  it('blocks invites on the Pro tier', async () => {
    const ctx = getTestContext()
    const { cookies, userId } = await ctx.signup(handle, `${Math.random().toString(36).slice(2)}@test.dev`, 'Passw0rd123!')
    await upgrade(userId, 'pro')
    const list = await ctx.req(handle, cookies, 'GET', '/api/workspaces')
    const wsId = list.json.data[0]._id as string
    const invite = await ctx.req(handle, cookies, 'POST', `/api/workspaces/${wsId}/invites`, {
      email: 'x@test.dev',
      role: 'viewer'
    })
    expect(invite.status).toBe(400)
    expect(JSON.stringify(invite.json)).toMatch(/Team plan/i)
  })

  it('links joins create pending memberships requiring approval', async () => {
    const { ctx, adminCookies, wsId } = await asTeam()
    const link = await ctx.req(handle, adminCookies, 'POST', `/api/workspaces/${wsId}/invite-link`, { role: 'viewer' })
    expect(link.status).toBe(200)
    const token = link.json.data.token as string

    const { cookies: joinCookies } = await ctx.signup(handle, 'joiner2@test.dev', 'Passw0rd123!')
    const joined = await ctx.req(handle, joinCookies, 'POST', `/api/workspaces/${wsId}/join`, { token })
    expect(joined.status).toBe(200)
    expect(joined.json.data.status).toBe('pending')

    const members = await ctx.req(handle, adminCookies, 'GET', `/api/workspaces/${wsId}/members`)
    const pending = members.json.data.find((m: any) => m.status === 'pending')
    expect(pending).toBeDefined()

    const approved = await ctx.req(handle, adminCookies, 'POST', `/api/workspaces/${wsId}/members/${pending.userId}/approve`)
    expect(approved.status).toBe(200)
    const after = await ctx.req(handle, adminCookies, 'GET', `/api/workspaces/${wsId}/members`)
    expect(after.json.data.find((m: any) => m.userId === pending.userId).status).toBe('active')
  })

  it('viewers cannot create transactions in a shared workspace', async () => {
    const { ctx, adminCookies, wsId } = await asTeam()
    const link = await ctx.req(handle, adminCookies, 'POST', `/api/workspaces/${wsId}/invite-link`, { role: 'viewer' })
    const { cookies: viewerCookies } = await ctx.signup(handle, 'viewer1@test.dev', 'Passw0rd123!')
    await ctx.req(handle, viewerCookies, 'POST', `/api/workspaces/${wsId}/join`, { token: link.json.data.token })
    const wallets = await ctx.req(handle, adminCookies, 'GET', `/api/workspaces/${wsId}/wallets`)
    const walletId = wallets.json.data[0]._id as string

    const res = await ctx.req(handle, viewerCookies, 'POST', `/api/workspaces/${wsId}/transactions`, {
      walletId,
      amount: 10,
      type: 'expense'
    })
    expect(res.status).toBe(403)
  })
})