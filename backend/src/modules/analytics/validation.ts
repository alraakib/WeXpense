import { t } from 'elysia'

export const DashboardQuerySchema = t.Object({
  month: t.Optional(t.String({ pattern: '^\\d{4}-\\d{2}$' })),
  period: t.Optional(t.Union([t.Literal('month'), t.Literal('year')]))
})

export const TrendQuerySchema = t.Object({
  months: t.Optional(t.String({ pattern: '^\\d+$' }))
})

export const ExportQuerySchema = t.Object({
  from: t.Optional(t.String({ pattern: '^\\d{4}-\\d{2}-\\d{2}$' })),
  to: t.Optional(t.String({ pattern: '^\\d{4}-\\d{2}-\\d{2}$' }))
})
