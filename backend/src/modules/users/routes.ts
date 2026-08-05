import { Elysia, t } from 'elysia'
import { UserService } from './service'
import { UpdateProfileSchema, UpdateSettingsSchema, CompleteOnboardingSchema } from './validation'
import { ok } from '@/shared/http'
import { authGroup } from '@/shared/middleware/auth'

const users = new UserService()

export const userRoutes = new Elysia({ name: 'user-routes' })
  .use(
    authGroup()
      .get('/api/users/me', async ({ user }) => ok(await users.getProfile(user.id)))
      .patch('/api/users/me', async ({ user, body }) => ok(await users.updateProfile(user.id, body)), {
        body: UpdateProfileSchema
      })
      .get('/api/users/me/settings', async ({ user }) => ok(await users.getSettings(user.id)))
      .patch('/api/users/me/settings', async ({ user, body }) => ok(await users.updateSettings(user.id, body)), {
        body: UpdateSettingsSchema
      })
      .post('/api/onboarding/complete', async ({ user, body }) => ok(await users.completeOnboarding(user.id, body)), {
        body: CompleteOnboardingSchema
      })
      .get('/api/users/export', async ({ user }) => ok(await users.exportData(user.id)))
      .delete('/api/users/me', async ({ user }) => {
        await users.deleteAccount(user.id)
        return ok({ deleted: true })
      })
  )