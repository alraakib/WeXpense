import { describe, it, expect } from 'bun:test'
import { toMinor, fromMinor, convertMinor, formatMoney, decimals, CURRENCY_CODES } from '../money'
import { AppError } from '@/shared/errors'

describe('money', () => {
  it('converts major to minor with 2 decimals', () => {
    expect(toMinor(10.5, 'USD')).toBe(1050)
    expect(toMinor(0.01, 'USD')).toBe(1)
    expect(toMinor(1000, 'USD')).toBe(100000)
  })

  it('handles zero-decimal currencies', () => {
    expect(toMinor(100, 'JPY')).toBe(100)
    expect(toMinor(1.5, 'JPY')).toBe(2)
    expect(decimals('BTC')).toBe(8)
  })

  it('rounds to nearest minor unit', () => {
    expect(toMinor(0.005, 'USD')).toBe(1)
    expect(toMinor(10.999, 'USD')).toBe(1100)
  })

  it('rejects negative and non-finite amounts', () => {
    let threw = false
    try {
      toMinor(-5, 'USD')
    } catch {
      threw = true
    }
    expect(threw).toBe(true)
    expect(() => toMinor(Number.NaN, 'USD')).toThrow(AppError)
  })

  it('fromMinor reverses toMinor', () => {
    expect(fromMinor(1050, 'USD')).toBe(10.5)
    expect(toMinor(fromMinor(1234, 'USD'), 'USD')).toBe(1234)
  })

  it('convertMinor converts across currencies via USD', () => {
    const rates = { USD: 1, EUR: 0.85, BDT: 110 }
    expect(convertMinor(100, 'USD', 'USD', rates)).toBe(100)
    const eur = convertMinor(10000, 'USD', 'EUR', rates)
    expect(fromMinor(eur, 'EUR')).toBeCloseTo(85, 0)
    const bdt = convertMinor(10000, 'USD', 'BDT', rates)
    expect(fromMinor(bdt, 'BDT')).toBeCloseTo(11000, 0)
  })

  it('throws when a rate is missing', () => {
    expect(() => convertMinor(100, 'USD', 'XYZ', { USD: 1 })).toThrow(AppError)
  })

  it('supports the core currency set', () => {
    for (const code of CURRENCY_CODES) {
      expect(decimals(code)).toBeGreaterThanOrEqual(0)
    }
  })

  it('formatMoney renders locale-aware string', () => {
    expect(formatMoney(1050, 'USD', 'en-US')).toContain('10.50')
    expect(formatMoney(100000, 'JPY', 'en-US')).toContain('100,000')
  })
})