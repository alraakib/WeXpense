export function toUtcDate(input: Date | string): Date {
  const d = typeof input === 'string' ? new Date(input) : new Date(input.getTime())
  if (Number.isNaN(d.getTime())) throw new Error('Invalid date')
  return d
}

export function dateKey(input: Date | string): string {
  const d = toUtcDate(input)
  return d.toISOString().slice(0, 10)
}

export function monthKey(input: Date | string): string {
  return dateKey(input).slice(0, 7)
}

export function startOfMonthUtc(month: string): Date {
  const [y, m] = month.split('-').map(Number)
  return new Date(Date.UTC(y as number, (m as number) - 1, 1))
}

export function endOfMonthUtc(month: string): Date {
  const [y, m] = month.split('-').map(Number)
  return new Date(Date.UTC(y as number, m as number, 0, 23, 59, 59, 999))
}

export function currentMonth(): string {
  return monthKey(new Date())
}

export function addDaysUtc(date: Date, days: number): Date {
  const d = new Date(date.getTime())
  d.setUTCDate(d.getUTCDate() + days)
  return d
}

export function addMonthsUtc(date: Date, months: number): Date {
  const d = new Date(date.getTime())
  const day = d.getUTCDate()
  d.setUTCDate(1)
  d.setUTCMonth(d.getUTCMonth() + months)
  const lastDay = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate()
  d.setUTCDate(Math.min(day, lastDay))
  return d
}

export function addPeriod(frequency: 'daily' | 'weekly' | 'monthly', from: Date): Date {
  switch (frequency) {
    case 'daily':
      return addDaysUtc(from, 1)
    case 'weekly':
      return addDaysUtc(from, 7)
    case 'monthly':
      return addMonthsUtc(from, 1)
  }
}

export function parseDateOrNow(input?: string | Date): Date {
  if (input === undefined || input === '') return new Date()
  return toUtcDate(input)
}

export function toDateInput(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export function periodRange(period: 'monthly' | 'yearly', month: string): { from: Date; to: Date } {
  const [y, m] = month.split('-').map(Number)
  if (period === 'monthly') {
    return { from: startOfMonthUtc(month), to: endOfMonthUtc(month) }
  }
  return {
    from: new Date(Date.UTC(y as number, 0, 1)),
    to: new Date(Date.UTC(y as number, 11, 31, 23, 59, 59, 999))
  }
}
