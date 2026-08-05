import { RecurringService } from '@/modules/recurring/service'
import { BudgetService } from '@/modules/budgets/service'
import { ConfigService } from '@/modules/config/service'

const recurring = new RecurringService()
const budgets = new BudgetService()
const config = new ConfigService()

export function startCronJobs() {
  const hourly = async () => {
    await recurring.processDueRules().catch((err) => console.error('[cron] recurring failed', err))
  }

  const every6h = async () => {
    await budgets.checkAll().catch((err) => console.error('[cron] budgets failed', err))
    await recurring.sendUpcomingReminders().catch((err) => console.error('[cron] reminders failed', err))
  }

  const daily = async () => {
    await config.refreshRates().catch((err) => console.error('[cron] rates failed', err))
  }

  hourly()
  setInterval(hourly, 60 * 60 * 1000)

  every6h()
  setInterval(every6h, 6 * 60 * 60 * 1000)

  daily()
  setInterval(daily, 24 * 60 * 60 * 1000)
}
