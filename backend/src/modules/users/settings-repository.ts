import { getDb } from '@/shared/db/mongo'
import { id } from '@/shared/utils/ids'
import { UserSettings, NotificationPrefs } from './interfaces'

const DEFAULT_NOTIFY: NotificationPrefs = {
  budget: true,
  goal: true,
  recurring: true,
  invite: true,
  billing: true,
  system: true
}

export class SettingsRepo {
  private coll() {
    return getDb().collection<UserSettings>('user_settings')
  }

  async findByUserId(userId: string): Promise<UserSettings | null> {
    return this.coll().findOne({ userId })
  }

  async ensure(userId: string): Promise<UserSettings> {
    const existing = await this.findByUserId(userId)
    if (existing) return existing
    const doc: UserSettings = {
      _id: id('set'),
      userId,
      baseCurrency: 'USD',
      theme: 'system',
      timezone: 'UTC',
      onboardingCompleted: false,
      notifyEmail: { ...DEFAULT_NOTIFY },
      notifyPush: { ...DEFAULT_NOTIFY },
      createdAt: new Date(),
      updatedAt: new Date()
    }
    await this.coll().insertOne(doc)
    return doc
  }

  async update(userId: string, patch: Partial<UserSettings>): Promise<UserSettings> {
    await this.ensure(userId)
    await this.coll().updateOne({ userId }, { $set: { ...patch, updatedAt: new Date() } })
    return this.findByUserId(userId) as Promise<UserSettings>
  }
}
