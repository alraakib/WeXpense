import { Elysia } from 'elysia'
import { auth } from '@/modules/auth/auth'
import { AuthUser, AuthSession } from '@/shared/types'
import { checkRateLimit } from '@/shared/db/redis'
import { forbidden, unauthorized } from '@/shared/errors'

export const authPlugin = new Elysia({ name: 'auth' }).mount(auth.handler)

export async function getSession(headers: Headers): Promise<{ user: AuthUser; session: AuthSession }> {
  const session = await auth.api.getSession({ headers })
  if (!session) throw unauthorized('Not authenticated')
  await checkRateLimit(`rl:user:${session.user.id}`, 600, 60)
  return {
    user: session.user as AuthUser,
    session: session.session as unknown as AuthSession
  }
}

export function authGroup() {
  return new Elysia().derive(async ({ request }) => getSession(request.headers))
}

export function adminGroup() {
  return new Elysia().derive(async ({ request }): Promise<{ user: AuthUser }> => {
    const { user } = await getSession(request.headers)
    if (!['admin', 'super_admin'].includes(user.role)) throw forbidden('Admin only')
    return { user }
  })
}