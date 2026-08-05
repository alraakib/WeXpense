export interface Tag {
  _id: string
  workspaceId: string
  name: string
  color?: string
  createdBy: string
  createdAt: Date
}

export interface CreateTagInput {
  name: string
  color?: string
}
