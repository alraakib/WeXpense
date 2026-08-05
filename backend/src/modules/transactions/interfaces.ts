export type TransactionType = 'income' | 'expense' | 'transfer'

export interface Split {
  userId: string
  amountMinor: number
}

export interface Transaction {
  _id: string
  workspaceId: string
  walletId: string
  type: TransactionType
  amountMinor: number
  currency: string
  transferToWalletId?: string | null
  categoryId?: string | null
  tags: string[]
  date: string
  notes?: string | null
  paidBy: string
  splitWith: Split[]
  receiptFileId?: string | null
  createdBy: string
  createdAt: Date
  updatedAt: Date
  archivedAt?: Date | null
}

export interface CreateTransactionInput {
  type: TransactionType
  amount: number
  walletId: string
  transferToWalletId?: string
  categoryId?: string
  tags?: string[]
  date?: string
  notes?: string
  paidBy?: string
  splitWith?: Array<{ userId: string; amount: number }>
  receiptFileId?: string
}

export interface UpdateTransactionInput {
  type?: TransactionType
  amount?: number
  walletId?: string
  transferToWalletId?: string | null
  categoryId?: string | null
  tags?: string[]
  date?: string
  notes?: string | null
  paidBy?: string
  splitWith?: Array<{ userId: string; amount: number }>
  receiptFileId?: string | null
}

export interface TransactionFilter {
  workspaceId: string
  page: number
  limit: number
  type?: TransactionType
  walletId?: string
  categoryId?: string
  tag?: string
  dateFrom?: string
  dateTo?: string
  search?: string
  paidBy?: string
}

export interface TransactionWithMeta extends Transaction {
  category?: { id: string; name: string; icon?: string; color?: string } | null
  walletName?: string
  walletCurrency: string
  tagDetails?: Array<{ id: string; name: string; color?: string }>
  paidByName?: string | null
}
