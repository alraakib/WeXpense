const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

export interface Envelope<T = unknown> {
  success: boolean
  data?: T
  error?: string
  code?: string
}

export interface Paged<T> {
  data: T[]
  total: number
  page: number
  pages: number
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message)
  }
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  let headers = (init.headers as Record<string, string> | undefined) ?? {}
  let body: BodyInit | undefined = init.body ?? undefined
  if (init.body && typeof init.body === 'object' && !(init.body instanceof FormData)) {
    headers = { 'Content-Type': 'application/json', ...headers }
    body = String(JSON.stringify(init.body))
  }
  const res = await fetch(`${API_URL}${path}`, { ...init, headers, body, credentials: 'include' })
  let json: Envelope<T> | null = null
  try {
    json = (await res.json()) as Envelope<T>
  } catch {
    /* non-json */
  }
  if (!res.ok || !json?.success) {
    throw new ApiError(json?.error ?? `Request failed (${res.status})`, res.status, json?.code)
  }
  return json.data as T
}

export const get = <T>(path: string) => api<T>(path)
export const post = <T>(path: string, body?: unknown, init?: RequestInit) =>
  api<T>(path, { ...init, method: 'POST', body: body as BodyInit })
export const put = <T>(path: string, body?: unknown) => api<T>(path, { method: 'PUT', body: body as BodyInit })
export const del = <T>(path: string) => api<T>(path, { method: 'DELETE' })

export function qs(params: Record<string, string | number | boolean | undefined | null>): string {
  const q = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&')
  return q ? `?${q}` : ''
}