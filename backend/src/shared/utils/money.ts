import { AppError } from '../errors'

export const CURRENCIES: Record<string, number> = {
  USD: 2,
  EUR: 2,
  GBP: 2,
  BDT: 2,
  INR: 2,
  JPY: 0,
  CAD: 2,
  AUD: 2,
  SGD: 2,
  AED: 2,
  BTC: 8,
  ETH: 8
}

export const CURRENCY_CODES = Object.keys(CURRENCIES)

export function decimals(currency: string): number {
  return CURRENCIES[currency] ?? 2
}

export function toMinor(amount: number, currency: string): number {
  const n = Math.round((amount + Number.EPSILON) * 10 ** decimals(currency))
  if (!Number.isFinite(n) || n < 0) throw new AppError(400, `Invalid amount for ${currency}`)
  return n
}

export function fromMinor(minor: number, currency: string): number {
  return minor / 10 ** decimals(currency)
}

export function convertMinor(
  minor: number,
  from: string,
  to: string,
  rates: Record<string, number>
): number {
  if (from === to) return minor
  const rFrom = rates[from]
  const rTo = rates[to]
  if (!rFrom || !rTo) throw new AppError(400, `No exchange rate available for ${from} -> ${to}`)
  const usd = minor / 10 ** decimals(from) / rFrom
  return Math.round(usd * rTo * 10 ** decimals(to))
}

const formatters = new Map<string, Intl.NumberFormat>()

export function formatMoney(minor: number, currency: string, locale = 'en-US'): string {
  const key = `${locale}:${currency}`
  let fmt = formatters.get(key)
  if (!fmt) {
    fmt = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol'
    })
    formatters.set(key, fmt)
  }
  return fmt.format(fromMinor(minor, currency))
}

export function roundMinor(minor: number, currency: string): number {
  return Math.round(minor)
}
