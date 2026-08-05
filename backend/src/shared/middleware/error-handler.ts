import { Elysia } from 'elysia'
import { AppError } from '@/shared/errors'
import { err } from '@/shared/http'
import logger from '@/shared/utils/logger'

function validationMessage(error: unknown): string {
  const e = error as { all?: Array<{ path?: string; message?: string }>; message?: string }
  if (Array.isArray(e?.all) && e.all.length) {
    const first = e.all[0]!
    return `${first.path ?? 'field'}: ${first.message ?? 'invalid'}`
  }
  return e?.message ?? 'Invalid input'
}

export const errorHandler = new Elysia({ name: 'error-handler' }).onError(({ code, error, set }) => {
  if (error instanceof AppError) {
    set.status = error.status
    return err(error.message, error.code)
  }

  const mongo = error as { code?: number }
  if (mongo?.code === 11000) {
    set.status = 409
    return err('Duplicate value for unique field', 'DUPLICATE')
  }

  switch (code) {
    case 'VALIDATION':
      set.status = 400
      return err(validationMessage(error), 'VALIDATION')
    case 'PARSE':
      set.status = 400
      return err('Malformed request body', 'PARSE')
    case 'NOT_FOUND':
      set.status = 404
      return err('Route not found', 'NOT_FOUND')
    case 'INVALID_COOKIE_SIGNATURE':
      set.status = 401
      return err('Invalid cookie signature', 'INVALID_COOKIE')
    case 'UNKNOWN':
    default: {
      const status = (error as { status?: number }).status
      if (status && status >= 400 && status < 500) {
        set.status = status
        return err((error as Error).message, 'REQUEST')
      }
      set.status = 500
      logger.error({ err: error, code }, 'unhandled error')
      return err('Internal Server Error', 'INTERNAL')
    }
  }
})
