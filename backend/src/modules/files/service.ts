import { mkdir, writeFile, unlink, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { getEnv } from '@/env'
import { notFound } from '@/shared/errors'
import { id } from '@/shared/utils/ids'
import { FileRepo } from './repository'
import { FileRecord } from './interfaces'

export class FileService {
  constructor(private repo = new FileRepo()) {}

  async save(userId: string, file: File, workspaceId?: string, transactionId?: string): Promise<FileRecord> {
    const dir = getEnv().UPLOAD_DIR
    await mkdir(dir, { recursive: true })
    const ext = file.name.includes('.') ? file.name.split('.').pop() : ''
    const fileId = id('file')
    const fileName = `${fileId}.${ext ?? 'bin'}`
    const bytes = Buffer.from(await file.arrayBuffer())
    await writeFile(join(dir, fileName), bytes)
    const record = await this.repo.insert({
      ownerId: userId,
      workspaceId,
      transactionId,
      name: file.name,
      mime: file.type,
      size: bytes.length,
      path: join(dir, fileName)
    })
    return record
  }

  async get(userId: string, fileId: string): Promise<{ record: FileRecord; data: Buffer; mime: string }> {
    const record = await this.repo.findByIdOwner(fileId, userId)
    if (!record) throw notFound('File not found')
    const data = await stat(record.path).then(() => true).catch(() => false)
    if (!data) throw notFound('File missing from storage')
    const buf = Buffer.from(await Bun.file(record.path).arrayBuffer())
    return { record, data: buf, mime: record.mime }
  }

  async remove(userId: string, fileId: string): Promise<void> {
    const record = await this.repo.findByIdOwner(fileId, userId)
    if (!record) throw notFound('File not found')
    await unlink(record.path).catch(() => {})
    await this.repo.delete(fileId)
  }
}
