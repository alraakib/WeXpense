'use client'

import {
  Button,
  Card,
  Group,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  TextInput,
  Title
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { usersApi, authApi } from '@/lib/endpoints'
import { useSettings } from '@/lib/hooks'
import { useAppStore } from '@/lib/store'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { NotificationPrefs } from '@/lib/types'

const CURRENCIES = ['USD', 'EUR', 'GBP', 'BDT', 'INR', 'JPY', 'CAD', 'AUD', 'SGD', 'AED', 'BTC', 'ETH']
const TIMEZONES = ['UTC', 'Asia/Dhaka', 'America/New_York', 'Europe/London', 'Europe/Berlin', 'Asia/Tokyo', 'Asia/Kolkata', 'Australia/Sydney']

const PREFS: Array<{ key: keyof NotificationPrefs; label: string }> = [
  { key: 'budget', label: 'Budget alerts' },
  { key: 'goal', label: 'Goal milestones' },
  { key: 'recurring', label: 'Recurring reminders' },
  { key: 'invite', label: 'Workspace invites' },
  { key: 'billing', label: 'Billing updates' },
  { key: 'system', label: 'System announcements' }
]

export default function SettingsPage() {
  const qc = useQueryClient()
  const router = useRouter()
  const user = useAppStore((s) => s.user)
  const { data: settings, isLoading } = useSettings()
  const [saving, setSaving] = useState(false)

  const form = useForm<{
    baseCurrency: string
    timezone: string
    theme: 'light' | 'dark' | 'system'
    prefs: NotificationPrefs
  }>({
    initialValues: {
      baseCurrency: 'USD',
      timezone: 'UTC',
      theme: 'system',
      prefs: { budget: true, goal: true, recurring: true, invite: true, billing: true, system: true }
    }
  })

  const save = async (values: typeof form.values) => {
    setSaving(true)
    try {
      await usersApi.updateSettings({
        baseCurrency: values.baseCurrency,
        timezone: values.timezone,
        theme: values.theme,
        notificationPrefs: values.prefs
      })
      notifications.show({ color: 'green', message: 'Settings saved' })
      qc.invalidateQueries({ queryKey: ['settings'] })
    } catch (e) {
      notifications.show({ color: 'red', message: (e as Error).message })
    } finally {
      setSaving(false)
    }
  }

  const signOut = async () => {
    await authApi.signout()
    localStorage.removeItem('ws-token')
    router.replace('/login')
  }

  useEffect(() => {
    if (settings) {
      form.setValues({
        baseCurrency: settings.baseCurrency,
        timezone: settings.timezone,
        theme: settings.theme,
        prefs: settings.notificationPrefs
      })
    }
  }, [settings])

  return (
    <Stack maw={640}>
      <Title order={2}>Settings</Title>

      <Card withBorder shadow="sm" radius="md" p="lg">
        <Text fw={600} mb="xs">
          Profile
        </Text>
        <Group>
          <div style={{ flex: 1 }}>
            <Text size="sm">{user?.name}</Text>
            <Text size="sm" c="dimmed">
              {user?.email}
            </Text>
          </div>
          <Button variant="light" component={Link} href="/settings/billing">
            Manage billing
          </Button>
        </Group>
      </Card>

      <Paper withBorder p="lg" radius="md">
        <Text fw={600} mb="md">
          Preferences
        </Text>
        <form onSubmit={form.onSubmit(save)}>
          <Stack>
            <Select
              label="Base currency"
              data={CURRENCIES}
              searchable
              {...form.getInputProps('baseCurrency')}
            />
            <Select label="Timezone" data={TIMEZONES} searchable {...form.getInputProps('timezone')} />
            <Select
              label="Theme"
              data={[
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
                { value: 'system', label: 'System' }
              ]}
              {...form.getInputProps('theme')}
            />
            <Stack gap="xs" mt="sm">
              <Text size="sm" fw={600}>
                Notifications
              </Text>
              {PREFS.map((p) => (
                <Switch
                  key={p.key}
                  label={p.label}
                  {...form.getInputProps(`prefs.${p.key}`, { type: 'checkbox' })}
                />
              ))}
            </Stack>
            <Button type="submit" loading={saving} style={{ alignSelf: 'flex-start' }}>
              Save settings
            </Button>
          </Stack>
        </form>
      </Paper>

      <Card withBorder shadow="sm" radius="md" p="lg" c="red">
        <Text fw={600}>Sign out</Text>
        <Text size="sm" c="dimmed" mb="sm">
          End your session on this device.
        </Text>
        <Button color="red" variant="light" onClick={signOut}>
          Sign out
        </Button>
      </Card>
    </Stack>
  )
}