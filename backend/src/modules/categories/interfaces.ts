export interface Category {
  _id: string
  workspaceId: string
  name: string
  icon?: string
  color?: string
  parentId?: string | null
  isDefault: boolean
  order: number
  createdBy: string
  archivedAt?: Date | null
  createdAt: Date
}

export interface CreateCategoryInput {
  name: string
  icon?: string
  color?: string
  parentId?: string | null
}

export interface UpdateCategoryInput {
  name?: string
  icon?: string
  color?: string
  parentId?: string | null
}
