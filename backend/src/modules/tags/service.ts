import { badRequest, notFound } from '@/shared/errors'
import { TagRepo } from './repository'
import { Tag, CreateTagInput } from './interfaces'
import { WorkspaceRepo } from '@/modules/workspaces/repository'
import { AuditService } from '@/modules/audit/service'

export class TagService {
  constructor(
    private repo = new TagRepo(),
    private workspaces = new WorkspaceRepo(),
    private audit = new AuditService()
  ) {}

  private async assertActive(userId: string, workspaceId: string) {
    const membership = await this.workspaces.findMembership(userId, workspaceId)
    if (!membership || membership.status !== 'active') throw badRequest('Not a member of this workspace', 'NOT_MEMBER')
    return membership
  }

  async create(userId: string, workspaceId: string, input: CreateTagInput): Promise<Tag> {
    await this.assertActive(userId, workspaceId)
    const existing = await this.repo.list(workspaceId)
    if (existing.some((t) => t.name.toLowerCase() === input.name.toLowerCase())) {
      throw badRequest('A tag with this name already exists', 'DUPLICATE_TAG')
    }
    const tag = await this.repo.insert({ workspaceId, name: input.name, color: input.color, createdBy: userId })
    await this.audit.log(workspaceId, userId, 'tag.created', 'tag', tag._id, { name: tag.name })
    return tag
  }

  async list(userId: string, workspaceId: string): Promise<Tag[]> {
    await this.assertActive(userId, workspaceId)
    return this.repo.list(workspaceId)
  }

  async update(userId: string, workspaceId: string, tagId: string, input: Partial<CreateTagInput>): Promise<Tag> {
    await this.assertActive(userId, workspaceId)
    const tag = await this.repo.findByIdWorkspace(tagId, workspaceId)
    if (!tag) throw notFound('Tag not found')
    const updated = await this.repo.update(tagId, workspaceId, {
      name: input.name ?? tag.name,
      color: input.color ?? tag.color
    })
    await this.audit.log(workspaceId, userId, 'tag.updated', 'tag', tagId, { name: input.name })
    return updated as Tag
  }

  async delete(userId: string, workspaceId: string, tagId: string): Promise<void> {
    await this.assertActive(userId, workspaceId)
    const tag = await this.repo.findByIdWorkspace(tagId, workspaceId)
    if (!tag) throw notFound('Tag not found')
    await this.repo.delete(tagId, workspaceId)
    await this.audit.log(workspaceId, userId, 'tag.deleted', 'tag', tagId, { name: tag.name })
  }
}
