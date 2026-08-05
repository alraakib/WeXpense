import { t } from 'elysia'

export const FileUploadSchema = t.Object({
  file: t.File({ type: ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'], maxSize: '10m' }),
  workspaceId: t.Optional(t.String()),
  transactionId: t.Optional(t.String())
})
