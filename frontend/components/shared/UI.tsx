'use client'

import { Group, Paper, Stack, Text } from '@mantine/core'
import { IconTrendingDown, IconTrendingUp } from '@tabler/icons-react'

export function StatCard({
  label,
  value,
  sub,
  color = 'primary',
  trend
}: {
  label: string
  value: string
  sub?: string
  color?: string
  trend?: { value: string; positive: boolean }
}) {
  const trendColor = trend?.positive ? 'success' : 'error'
  const TrendIcon = trend?.positive ? IconTrendingUp : IconTrendingDown

  return (
    <Paper p="lg" radius="md">
      <Stack gap={4}>
        <Text size="sm" c="dimmed" fw={500}>
          {label}
        </Text>
        <Group gap="xs" align="baseline">
          <Text fw={700} size="xl" c={color}>
            {value}
          </Text>
          {trend && (
            <Group gap={2} c={trendColor}>
              <TrendIcon size={14} />
              <Text size="xs" fw={600}>
                {trend.value}
              </Text>
            </Group>
          )}
        </Group>
        {sub && (
          <Text size="xs" c="dimmed">
            {sub}
          </Text>
        )}
      </Stack>
    </Paper>
  )
}

export function EmptyState({ icon, title, hint }: { icon: React.ReactNode; title: string; hint?: string }) {
  return (
    <Paper p="xl" radius="md" ta="center">
      <div style={{ opacity: 0.4, display: 'flex', justifyContent: 'center', marginBottom: 12 }}>{icon}</div>
      <Text fw={600}>{title}</Text>
      {hint && (
        <Text size="sm" c="dimmed" mt={4}>
          {hint}
        </Text>
      )}
    </Paper>
  )
}
