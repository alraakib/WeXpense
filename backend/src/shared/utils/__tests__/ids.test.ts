import { describe, it, expect } from 'bun:test'
import { id, token, nowIso } from '../ids'

describe('ids', () => {
  it('id prefixes entities', () => {
    expect(id('ws_').startsWith('ws_')).toBe(true)
    expect(id('txn_').startsWith('txn_')).toBe(true)
    expect(id('ws_')).not.toBe(id('ws_'))
  })

  it('token is url-safe and unique', () => {
    const a = token()
    const b = token()
    expect(a).not.toBe(b)
    expect(a).toMatch(/^[A-Za-z0-9_-]+$/)
    expect(a.length).toBeGreaterThanOrEqual(40)
  })

  it('nowIso is ISO timestamp', () => {
    expect(new Date(nowIso()).getTime()).not.toBeNaN()
  })
})