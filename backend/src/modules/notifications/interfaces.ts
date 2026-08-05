export type NotificationType =
  | 'workspace_invite'
  | 'budget_alert'
  | 'goal_milestone'
  | 'goal_completed'
  | 'recurring_reminder'
  | 'recurring_processed'
  | 'member_joined'
  | 'member_approved'
  | 'subscription_changed'
  | 'export_ready'
  | 'welcome'
  | 'system'

export interface AppNotification {
  _id: string
  userId: string
  type: NotificationType
  title: string
  body: string
  data?: Record<string, unknown>
  read: boolean
  createdAt: Date
}

export interface NotificationPrefs {
  budget: boolean
  goal: boolean
  recurring: boolean
  invite: boolean
  billing: boolean
  system: boolean
}

export const DEFAULT_PREFS: NotificationPrefs = {
  budget: true,
  goal: true,
  recurring: true,
  invite: true,
  billing: true,
  system: true
}

export function prefsGateFor(type: NotificationType): keyof NotificationPrefs {
  switch (type) {
    case 'budget_alert':
      return 'budget'
    case 'goal_milestone':
    case 'goal_completed':
      return 'goal'
    case 'recurring_reminder':
    case 'recurring_processed':
      return 'recurring'
    case 'workspace_invite':
    case 'member_joined':
    case 'member_approved':
      return 'invite'
    case 'subscription_changed':
      return 'billing'
    default:
      return 'system'
  }
}
