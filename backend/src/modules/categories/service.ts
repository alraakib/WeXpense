import { badRequest, notFound } from '@/shared/errors'
import { CategoryRepo } from './repository'
import { Category, CreateCategoryInput, UpdateCategoryInput } from './interfaces'
import { AuditService } from '@/modules/audit/service'
import { BillingService } from '@/modules/billing/service'

export class CategoryService {
  constructor(
    private repo = new CategoryRepo(),
    private billing = new BillingService(),
    private audit = new AuditService()
  ) {}

  async create(workspaceId: string, userId: string, input: CreateCategoryInput): Promise<Category> {
    const tier = await this.billing.getTier(userId)
    const limits = await this.billing.limits(tier)
    if (!limits.customCategories) throw badRequest('Custom categories require the Pro plan', 'TIER_PRO_REQUIRED')
    const parent = input.parentId ? await this.repo.findByIdWorkspace(input.parentId, workspaceId) : null
    if (input.parentId && !parent) throw notFound('Parent category not found')
    const category = await this.repo.insert({
      workspaceId,
      name: input.name,
      icon: input.icon,
      color: input.color,
      parentId: parent?._id ?? null,
      isDefault: false,
      order: 1000,
      createdBy: userId,
      archivedAt: null
    })
    await this.audit.log(workspaceId, userId, 'category.created', 'category', category._id, { name: category.name })
    return category
  }

  async list(workspaceId: string): Promise<Category[]> {
    return this.repo.list(workspaceId)
  }

  async update(workspaceId: string, userId: string, categoryId: string, input: UpdateCategoryInput): Promise<Category> {
    const category = await this.repo.findByIdWorkspace(categoryId, workspaceId)
    if (!category) throw notFound('Category not found')
    let parentId = category.parentId
    if (input.parentId !== undefined) {
      if (input.parentId === null) {
        parentId = null
      } else {
        if (input.parentId === categoryId) throw badRequest('Category cannot be its own parent')
        const parent = await this.repo.findByIdWorkspace(input.parentId, workspaceId)
        if (!parent) throw notFound('Parent category not found')
        parentId = parent._id
      }
    }
    const updated = await this.repo.update(categoryId, workspaceId, {
      name: input.name ?? category.name,
      icon: input.icon ?? category.icon,
      color: input.color ?? category.color,
      parentId
    })
    await this.audit.log(workspaceId, userId, 'category.updated', 'category', categoryId, { name: updated?.name })
    return updated as Category
  }

  async archive(workspaceId: string, userId: string, categoryId: string): Promise<void> {
    const category = await this.repo.findByIdWorkspace(categoryId, workspaceId)
    if (!category) throw notFound('Category not found')
    await this.repo.archive(categoryId, workspaceId)
    await this.audit.log(workspaceId, userId, 'category.archived', 'category', categoryId)
  }
}
