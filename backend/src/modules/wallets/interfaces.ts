export interface Wallet {
  _id: string
  workspaceId: string
  name: string
  currency: string
  initialBalanceMinor: number
  balanceMinor: number
  heldMinor: number
  icon?: string
  color?: string
  createdBy: string
  archivedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface CreateWalletInput {
  name: string
  currency: string
  initialBalance?: number
  icon?: string
  color?: string
}

export interface UpdateWalletInput {
  name?: string
  icon?: string
  color?: string
}

export interface WalletWithEquivalent extends Wallet {
  equivalentMinor: number
  equivalentCurrency: string
}
