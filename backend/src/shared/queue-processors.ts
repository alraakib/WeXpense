import { registerProcessor } from '@/shared/queue'
import { UserService } from '@/modules/users/service'
import { AnalyticsService } from '@/modules/analytics/service'
import { getMailer } from '@/shared/mailer'

const users = new UserService()
const analytics = new AnalyticsService()

export function registerQueueProcessors(): void {
  registerProcessor('provision.user', async (payload) => {
    const { userId, email, name } = payload as { userId: string; email: string; name: string }
    await users.provisionNewUser(userId, email, name)
  })

  registerProcessor('email.send', async (payload) => {
    const { to, subject, html } = payload as { to: string; subject: string; html: string }
    await getMailer().send({ to, subject, html })
  })

  registerProcessor('snapshot.recompute', async (payload) => {
    const { workspaceId, month } = payload as { workspaceId: string; month: string }
    await analytics.recompute(workspaceId, month)
  })
}
