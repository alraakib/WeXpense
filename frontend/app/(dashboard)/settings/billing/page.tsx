'use client'

import { Badge, Button, Card, Group, SimpleGrid, Stack, Text, Title, List } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { billingApi } from '@/lib/endpoints'
import { usePlan } from '@/lib/hooks'

const TIERS = [
  {
    id: 'hobby',
    name: 'Hobby',
    price: 'Free',
    features: ['1 workspace', '2 wallets', 'Basic reporting']
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$5/mo',
    highlight: true,
    features: ['5 workspaces', 'Unlimited wallets', 'Custom categories', 'Advanced goal tracking']
  },
  {
    id: 'team',
    name: 'Team',
    price: '$12/mo',
    features: ['Shared workspaces', 'Roles & approvals', 'Invite members', 'Audit log']
  }
]

export default function BillingPage() {
  const { data: plan } = usePlan()
  const qc = useQueryClient()
  const [loading, setLoading] = useState<string | null>(null)

  const upgrade = async (tier: string) => {
    if (tier === plan?.tier) return
    setLoading(tier)
    try {
      const res = await billingApi.checkout(tier)
      if (res?.url) window.location.href = res.url
    } catch (e) {
      notifications.show({ color: 'red', message: (e as Error).message })
    } finally {
      setLoading(null)
    }
  }

  const portal = async () => {
    try {
      const res = await billingApi.portal()
      if (res?.url) window.location.href = res.url
    } catch (e) {
      notifications.show({ color: 'red', message: (e as Error).message })
    }
  }

  return (
    <Stack maw={860}>
      <Group justify="space-between">
        <Title order={2}>Billing</Title>
        {plan?.active && plan.tier !== 'hobby' && (
          <Button variant="light" onClick={portal}>
            Manage subscription
          </Button>
        )}
      </Group>
      <Text size="sm" c="dimmed">
        Current plan:{' '}
        <Badge variant="light">
          {plan ? plan.tier : 'loading…'}
        </Badge>
      </Text>

      <SimpleGrid cols={{ base: 1, md: 3 }}>
        {TIERS.map((t) => {
          const current = plan?.tier === t.id
          return (
            <Card
              key={t.id}
              withBorder
              shadow={t.highlight ? 'md' : 'sm'}
              radius="md"
              p="lg"
              style={t.highlight ? { borderColor: 'var(--mantine-color-primary-4)' } : undefined}
            >
              <Group justify="space-between" mb="xs">
                <Text fw={600} size="lg">
                  {t.name}
                </Text>
                {current && (
                  <Badge color="success" variant="light">
                    Current
                  </Badge>
                )}
              </Group>
              <Text size="xl" fw={700} mb="md">
                {t.price}
              </Text>
              <List size="sm" spacing="xs" mb="lg">
                {t.features.map((f) => (
                  <List.Item key={f}>{f}</List.Item>
                ))}
              </List>
              <Button
                fullWidth
                variant={t.highlight ? 'filled' : 'light'}
                disabled={current}
                loading={loading === t.id}
                onClick={() => upgrade(t.id)}
              >
                {current ? 'Current plan' : t.id === 'hobby' ? 'Downgrade to free' : `Upgrade to ${t.name}`}
              </Button>
            </Card>
          )
        })}
      </SimpleGrid>
      <Button variant="subtle" onClick={() => qc.invalidateQueries({ queryKey: ['plan'] })} style={{ alignSelf: 'flex-start' }}>
        Refresh plan
      </Button>
    </Stack>
  )
}