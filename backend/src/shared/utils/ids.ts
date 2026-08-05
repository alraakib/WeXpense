import { randomUUID, randomBytes } from 'node:crypto'

export const id = (prefix: string) => `${prefix}_${randomUUID()}`
export const token = () => randomBytes(32).toString('base64url')
export const nowIso = () => new Date().toISOString()
