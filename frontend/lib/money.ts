export function toMinor(amount: number, currency: string): number {
  const exp = exponent(currency)
  return Math.round(amount * 10 ** exp)
}

export function fromMinor(minor: number, currency: string): number {
  const exp = exponent(currency)
  return minor / 10 ** exp
}

function exponent(currency: string): number {
  return currency === 'BTC' || currency === 'ETH' ? 8 : 2
}

export function fmtMoney(minor: number, currency: string, locale = 'en-US'): string {
  const amount = fromMinor(minor, currency)
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: exponent(currency)
  }).format(amount)
}

export function fmtAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: exponent(currency)
  }).format(amount)
}

export const fmtDate = (iso: string | Date | undefined | null) =>
  !iso ? '-' : new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(iso))

export const monthKey = (d = new Date()): string => {
  const iso = d.toISOString()
  return iso.slice(0, 7)
}