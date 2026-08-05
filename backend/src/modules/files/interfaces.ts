export interface FileRecord {
  _id: string
  ownerId: string
  workspaceId?: string
  transactionId?: string
  name: string
  mime: string
  size: number
  path: string
  createdAt: Date
}
