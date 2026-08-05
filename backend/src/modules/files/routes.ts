import { Elysia, t } from 'elysia'
import { FileService } from './service'
import { FileUploadSchema } from './validation'
import { ok } from '@/shared/http'
import { authGroup } from '@/shared/middleware/auth'

const files = new FileService()

export const fileRoutes = new Elysia({ name: 'file-routes' })
  .use(
    authGroup()
      .post('/api/files', async ({ user, body }) => {
        const record = await files.save(user.id, body.file, body.workspaceId, body.transactionId)
        return ok({ id: record._id, name: record.name, mime: record.mime, size: record.size })
      }, { body: FileUploadSchema })
      .get('/api/files/:fileId', async ({ user, params, set }) => {
        const { data, mime } = await files.get(user.id, params.fileId)
        set.headers['Content-Type'] = mime
        set.headers['Cache-Control'] = 'private, max-age=31536000'
        return data
      }, { params: t.Object({ fileId: t.String() }) })
      .delete('/api/files/:fileId', async ({ user, params }) => {
        await files.remove(user.id, params.fileId)
        return ok({ deleted: true })
      }, { params: t.Object({ fileId: t.String() }) })
  )