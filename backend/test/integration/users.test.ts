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

describe('users API', () => {
  it('reads and updates the profile', async () => {
    const ctx = getTestContext()
    const { cookies, userId } = await ctx.signup(handle, 'prof1@test.dev', 'Passw0rd123!', 'First Name')
    const me = await ctx.req(handle, cookies, 'GET', '/api/users/me')
    expect(me.json.data.id).toBe(userId)
    expect(me.json.data.name).toBe('First Name')
    expect(me.json.data.email).toBe('prof1@test.dev')

    const updated = await ctx.req(handle, cookies, 'PATCH', '/api/users/me', { name: 'Updated Name' })
    expect(updated.json.data.name).toBe('Updated Name')
  })

  it('updates settings and persists them', async () => {
    const ctx = getTestContext()
    const { cookies } = await ctx.signup(handle, 'prof2@test.dev', 'Passw0rd123!')
    const res = await ctx.req(handle, cookies, 'PATCH', '/api/users/me/settings', {
      baseCurrency: 'BDT',
      timezone: 'Asia/Dhaka',
      theme: 'dark'
    })
    expect(res.status).toBe(200)
    const settings = await ctx.req(handle, cookies, 'GET', '/api/users/me/settings')
    expect(settings.json.data.baseCurrency).toBe('BDT')
    expect(settings.json.data.timezone).toBe('Asia/Dhaka')
    expect(settings.json.data.theme).toBe('dark')
  })

  it('completes onboarding and marks it done', async () => {
    const ctx = getTestContext()
    const { cookies } = await ctx.signup(handle, 'prof3@test.dev', 'Passw0rd123!')
    const res = await ctx.req(handle, cookies, 'POST', '/api/onboarding/complete', {
      baseCurrency: 'USD',
      walletName: 'Checking',
      initialBalance: 500
    })
    expect(res.status).toBe(200)
    const settings = await ctx.req(handle, cookies, 'GET', '/api/users/me/settings')
    expect(settings.json.data.onboardingCompleted).toBe(true)
    const again = await ctx.req(handle, cookies, 'POST', '/api/onboarding/complete', { baseCurrency: 'EUR' })
    expect(again.status).toBe(200)
  })

  it('exports all user data as JSON', async () => {
    const ctx = getTestContext()
    const { cookies } = await ctx.signup(handle, 'prof4@test.dev', 'Passw0rd123!')
    const res = await ctx.req(handle, cookies, 'GET', '/api/users/export')
    expect(res.status).toBe(200)
    const data = res.json.data
    expect(data.profile).toBeDefined()
    expect(Array.isArray(data.workspaces)).toBe(true)
    expect(data.workspaces.length).toBe(1)
  })

  it('deletes the account and revokes access', async () => {
    const ctx = getTestContext()
    const { cookies } = await ctx.signup(handle, 'prof5@test.dev', 'Passw0rd123!')
    const del = await ctx.req(handle, cookies, 'DELETE', '/api/users/me')
    expect(del.json.data.deleted).toBe(true)
    const after = await ctx.req(handle, cookies, 'GET', '/api/users/me')
    expect(after.status).toBe(401)
  })

  it('marks notifications as read', async () => {
    const ctx = getTestContext()
    const { cookies } = await ctx.signup(handle, 'prof6@test.dev', 'Passw0rd123!')
    const notifs = await ctx.req(handle, cookies, 'GET', '/api/notifications')
    expect(notifs.json.total).toBeGreaterThan(0)
    const first = notifs.json.data[0]
    expect(first.read).toBe(false)
    const read = await ctx.req(handle, cookies, 'POST', `/api/notifications/${first._id}/read`)
    expect(read.status).toBe(200)
    const again = await ctx.req(handle, cookies, 'GET', '/api/notifications')
    expect(again.json.data.find((n: any) => n._id === first._id).read).toBe(true)
  })
})