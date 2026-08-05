import { describe, it, expect } from 'bun:test'
import {
  dateKey,
  monthKey,
  addDaysUtc,
  addMonthsUtc,
  addPeriod,
  startOfMonthUtc,
  endOfMonthUtc,
  currentMonth,
  parseDateOrNow
} from '../dates'

describe('dates', () => {
  it('dateKey produces YYYY-MM-DD in UTC', () => {
    expect(dateKey('2026-08-05T23:59:59Z')).toBe('2026-08-05')
    expect(dateKey(new Date('2026-01-31T00:00:00Z'))).toBe('2026-01-31')
  })

  it('monthKey slices year-month', () => {
    expect(monthKey('2026-08-05')).toBe('2026-08')
    expect(currentMonth()).toBe(new Date().toISOString().slice(0, 7))
  })

  it('addDaysUtc crosses month boundaries', () => {
    expect(dateKey(addDaysUtc(new Date('2026-01-31T00:00:00Z'), 1))).toBe('2026-02-01')
    expect(dateKey(addDaysUtc(new Date('2026-12-31T00:00:00Z'), 1))).toBe('2027-01-01')
  })

  it('addMonthsUtc clamps to last day of target month', () => {
    expect(dateKey(addMonthsUtc(new Date('2026-01-31T00:00:00Z'), 1))).toBe('2026-02-28')
    expect(dateKey(addMonthsUtc(new Date('2026-05-31T00:00:00Z'), 1))).toBe('2026-06-30')
    expect(dateKey(addMonthsUtc(new Date('2026-01-15T00:00:00Z'), 1))).toBe('2026-02-15')
  })

  it('addPeriod advances by daily/weekly/monthly', () => {
    expect(dateKey(addPeriod('daily', new Date('2026-08-05T00:00:00Z')))).toBe('2026-08-06')
    expect(dateKey(addPeriod('weekly', new Date('2026-08-05T00:00:00Z')))).toBe('2026-08-12')
    expect(dateKey(addPeriod('monthly', new Date('2026-01-31T00:00:00Z')))).toBe('2026-02-28')
  })

  it('startOfMonthUtc and endOfMonthUtc bound the month', () => {
    expect(startOfMonthUtc('2026-02').toISOString()).toBe('2026-02-01T00:00:00.000Z')
    expect(endOfMonthUtc('2026-02').toISOString()).toBe('2026-02-28T23:59:59.999Z')
  })

  it('parseDateOrNow falls back to now on empty input', () => {
    expect(parseDateOrNow()).toBeInstanceOf(Date)
    expect(parseDateOrNow('')).toBeInstanceOf(Date)
  })

  it('rejects invalid dates', () => {
    let threw = false
    try {
      dateKey('not-a-date')
    } catch {
      threw = true
    }
    expect(threw).toBe(true)
  })
})