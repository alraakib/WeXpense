import { t } from 'elysia'

const SplitSchema = t.Object({
  userId: t.String(),
  amount: t.Number({ minimum: 0.01 })
})

export const CreateTransactionSchema = t.Object({
  type: t.Union([t.Literal('income'), t.Literal('expense'), t.Literal('transfer')]),
  amount: t.Number({ minimum: 0.01, maximum: 999_999_999_999 }),
  walletId: t.String(),
  transferToWalletId: t.Optional(t.String()),
  categoryId: t.Optional(t.String()),
  tags: t.Optional(t.Array(t.String())),
  date: t.Optional(t.String({ pattern: '^\\d{4}-\\d{2}-\\d{2}$' })),
  notes: t.Optional(t.String({ maxLength: 500 })),
  paidBy: t.Optional(t.String()),
  splitWith: t.Optional(t.Array(SplitSchema)),
  receiptFileId: t.Optional(t.String())
})

export const UpdateTransactionSchema = t.Partial(
  t.Object({
    type: t.Union([t.Literal('income'), t.Literal('expense'), t.Literal('transfer')]),
    amount: t.Number({ minimum: 0.01, maximum: 999_999_999_999 }),
    walletId: t.String(),
    transferToWalletId: t.Null(),
    categoryId: t.Null(),
    tags: t.Array(t.String()),
    date: t.String({ pattern: '^\\d{4}-\\d{2}-\\d{2}$' }),
    notes: t.Null(),
    paidBy: t.String(),
    splitWith: t.Array(SplitSchema),
    receiptFileId: t.Null()
  })
)

export const ListTransactionsSchema = t.Object({
  page: t.Optional(t.String()),
  limit: t.Optional(t.String()),
  type: t.Optional(t.Union([t.Literal('income'), t.Literal('expense'), t.Literal('transfer')])),
  walletId: t.Optional(t.String()),
  categoryId: t.Optional(t.String()),
  tag: t.Optional(t.String()),
  dateFrom: t.Optional(t.String({ pattern: '^\\d{4}-\\d{2}-\\d{2}$' })),
  dateTo: t.Optional(t.String({ pattern: '^\\d{4}-\\d{2}-\\d{2}$' })),
  search: t.Optional(t.String({ maxLength: 100 })),
  paidBy: t.Optional(t.String())
})
