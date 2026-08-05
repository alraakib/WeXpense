export const ok = <T>(data: T) => ({ success: true as const, data })

export function paged<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): { success: true; data: T[]; total: number; page: number; pages: number } {
  return {
    success: true,
    data,
    total,
    page,
    pages: Math.max(1, Math.ceil(total / Math.max(1, limit)))
  }
}

export const err = (message: string, code?: string) => ({ success: false as const, error: message, code })

export function parsePagination(query: Record<string, unknown>) {
  const page = Math.max(1, Number(query.page) || 1)
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20))
  return { page, limit, skip: (page - 1) * limit }
}
