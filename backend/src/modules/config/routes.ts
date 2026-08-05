import { Elysia } from 'elysia'
import { ConfigService } from './service'
import { UpdateConfigSchema } from './validation'
import { ok } from '@/shared/http'
import { adminGroup } from '@/shared/middleware/auth'

const configService = new ConfigService()

export const configRoutes = new Elysia({ name: 'config-routes' })
  .get('/api/config', async () => ok(await configService.getConfig()))
  .use(
    adminGroup()
      .put('/api/admin/config', async ({ body }) => ok(await configService.updateConfig(body)), { body: UpdateConfigSchema })
      .post('/api/admin/config/refresh-rates', async () => ok(await configService.refreshRates()))
  )