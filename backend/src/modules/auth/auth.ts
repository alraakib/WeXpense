import { betterAuth } from 'better-auth'
import { admin, bearer, createAccessControl } from 'better-auth/plugins'
import { mongodbAdapter } from 'better-auth/adapters/mongodb'
import { getDb } from '@/shared/db/mongo'
import { enqueue } from '@/shared/queue'
import { getEnv } from '@/env'
import { getMailer } from '@/shared/mailer'

let cachedAuth: ReturnType<typeof createAuth> | null = null

const ac = createAccessControl({
  user: ['create', 'list', 'set-role', 'ban', 'impersonate', 'impersonate-admins', 'delete', 'set-password', 'set-email', 'get', 'update'],
  session: ['list', 'revoke', 'delete']
})

const roles = {
  super_admin: ac.newRole({
    user: ['create', 'list', 'set-role', 'ban', 'impersonate', 'impersonate-admins', 'delete', 'set-password', 'set-email', 'get', 'update'],
    session: ['list', 'revoke', 'delete']
  }),
  admin: ac.newRole({
    user: ['create', 'list', 'set-role', 'ban', 'impersonate', 'delete', 'set-password', 'set-email', 'get', 'update'],
    session: ['list', 'revoke', 'delete']
  }),
  user: ac.newRole({ user: [], session: [] })
}

function createAuth() {
  const env = getEnv()
  return betterAuth({
    appName: 'WeXpense',
    basePath: '/api/auth',
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    database: mongodbAdapter(getDb(), { usePlural: true, transaction: false }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      maxPasswordLength: 72,
      autoSignIn: true,
      sendResetPassword: async ({ user, url }) => {
        await enqueue({
          name: 'email.send',
          payload: {
            to: user.email,
            subject: 'Reset your WeXpense password',
            html: `<p>Hi ${user.name},</p><p>Reset your password here: <a href="${url}">${url}</a></p><p>This link expires in 1 hour.</p>`
          }
        })
      }
    },
    emailVerification: {
      sendOnSignUp: false,
      sendVerificationEmail: async ({ user, url }) => {
        await enqueue({
          name: 'email.send',
          payload: {
            to: user.email,
            subject: 'Verify your WeXpense email',
            html: `<p>Hi ${user.name},</p><p>Verify your email here: <a href="${url}">${url}</a></p>`
          }
        })
      }
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24
    },
    plugins: [
      admin({
        defaultRole: 'user',
        adminRoles: ['admin', 'super_admin'],
        roles
      }),
      bearer()
    ],
    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            await enqueue({
              name: 'provision.user',
              payload: { userId: user.id, email: user.email, name: user.name }
            })
          }
        }
      }
    },
    trustedOrigins: [env.APP_URL, env.BETTER_AUTH_URL]
  })
}

export function getAuth() {
  if (!cachedAuth) cachedAuth = createAuth()
  return cachedAuth
}

export const auth = getAuth()
