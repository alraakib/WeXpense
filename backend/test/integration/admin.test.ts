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

async function asAdmin() {
  const ctx = getTestContext()
  const { cookies, userId } = await ctx.signup(handle, 'superadmin@test.dev', 'SuperAdmin123!', 'Root')
  const db = (await import('@/shared/db/mongo')).getDb()
  await db.collection('users').updateOne({ email: 'superadmin@test.dev' }, { $set: { role: 'super_admin' } })
  return { ctx, cookies, userId }
}

describe('admin & feature flags', () => {
  it('super admins can set and list feature flags', async () => {
    const { ctx, cookies, userId } = await asAdmin()
    const list = await ctx.req(handle, cookies, 'GET', '/api/workspaces')
    const wsId = list.json.data[0]._id as string

    const set = await ctx.req(handle, cookies, 'PUT', `/api/admin/flags/beta.ai-receipts?workspaceId=${wsId}`, {
      enabled: true
    })
    expect(set.status).toBe(200)
    expect(set.json.data.enabled).toBe(true)

    const flags = await ctx.req(handle, cookies, 'GET', `/api/admin/flags?workspaceId=${wsId}`)
    expect(flags.json.data.length).toBe(1)
    expect(flags.json.data[0].key).toBe('beta.ai-receipts')

    const read = await ctx.req(handle, cookies, 'GET', `/api/flags/beta.ai-receipts?workspaceId=${wsId}`)
    expect(read.json.data.enabled).toBe(true)
  })

  it('admins can update global config and it persists', async () => {
    const { ctx, cookies } = await asAdmin()
    const res = await ctx.req(handle, cookies, 'PUT', '/api/admin/config', {
      appName: 'WeXpense Test'
    })
    expect(res.status).toBe(200)
    expect(res.json.data.appName).toBe('WeXpense Test')
    const config = await ctx.req(handle, cookies, 'GET', '/api/config')
    expect(config.json.data.appName).toBe('WeXpense Test')
  })

  it('non-admins cannot access admin routes', async () => {
    const ctx = getTestContext()
    const { cookies } = await ctx.signup(handle, 'plain@test.dev', 'Passw0rd123!')
    const res = await ctx.req(handle, cookies, 'GET', '/api/admin/flags?workspaceId=ws_1')
    expect(res.status).toBe(403)
  })
})