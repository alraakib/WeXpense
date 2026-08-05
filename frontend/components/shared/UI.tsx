'use client'

import { Paper, Text } from '@mantine/core'

export function StatCard({
  label,
  value,
  sub,
  color = 'dark'
}: {
  label: string
  value: string
  sub?: string
  color?: string
}) {
  return (
    <Paper withBorder shadow="sm" p="md" radius="md">
      <Text size="xs" tt="uppercase" c="dimmed" fw={600}>
        {label}
      </Text>
      <Text fw={700} size="xl" c={color}>
        {value}
      </Text>
      {sub && (
        <Text size="xs" c="dimmed">
          {sub}
        </Text>
      )}
    </Paper>
  )
}

export function EmptyState({ icon, title, hint }: { icon: React.ReactNode; title: string; hint?: string }) {
  return (
    <Paper withBorder shadow="sm" p="xl" radius="md" ta="center">
      <div style={{ opacity: 0.5, display: 'flex', justifyContent: 'center', marginBottom: 8 }}>{icon}</div>
      <Text fw={600}>{title}</Text>
      {hint && (
        <Text size="sm" c="dimmed">
          {hint}
        </Text>
      )}
    </Paper>
  )
}