export class AppError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export const badRequest = (message: string, code?: string) => new AppError(400, message, code)
export const unauthorized = (message = 'Unauthorized') => new AppError(401, message, 'UNAUTHORIZED')
export const forbidden = (message = 'Forbidden') => new AppError(403, message, 'FORBIDDEN')
export const notFound = (message = 'Not found') => new AppError(404, message, 'NOT_FOUND')
export const conflict = (message: string) => new AppError(409, message, 'CONFLICT')
export const tooMany = (message = 'Rate limit exceeded') => new AppError(429, message, 'RATE_LIMITED')
