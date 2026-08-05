import { NotificationRepo } from './repository'
import { AppNotification, NotificationPrefs, NotificationType, DEFAULT_PREFS, prefsGateFor } from './interfaces'
import { publish } from '@/shared/realtime'

export interface NotificationPrefsProvider {
  getPrefs(userId: string): Promise<NotificationPrefs>
}

export class DefaultPrefsProvider implements NotificationPrefsProvider {
  async getPrefs(): Promise<NotificationPrefs> {
    return DEFAULT_PREFS
  }
}

export class NotificationService {
  constructor(
    private repo = new NotificationRepo(),
    private prefs: NotificationPrefsProvider = new DefaultPrefsProvider()
  ) {}

  async create(
    userId: string,
    type: NotificationType,
    title: string,
    body: string,
    data?: Record<string, unknown>
  ): Promise<AppNotification | null> {
    const prefs = await this.prefs.getPrefs(userId)
    if (!prefs[prefsGateFor(type)]) return null
    const notification = await this.repo.insert({ userId, type, title, body, data, read: false })
    await publish(`user:${userId}`, {
      type: 'notification:new',
      payload: notification,
      timestamp: Date.now()
    })
    return notification
  }

  async list(userId: string, page: number, limit: number, unreadOnly: boolean) {
    return this.repo.list(userId, page, limit, unreadOnly)
  }

  async unreadCount(userId: string): Promise<number> {
    return this.repo.unreadCount(userId)
  }

  async markRead(userId: string, notificationId: string): Promise<boolean> {
    return this.repo.markRead(userId, notificationId)
  }

  async markAllRead(userId: string): Promise<void> {
    await this.repo.markAllRead(userId)
  }
}
