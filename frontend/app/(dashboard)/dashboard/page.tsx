'use client'

import { Card, Group, Paper, Progress, SimpleGrid, Skeleton, Stack, Text, ThemeIcon } from '@mantine/core'
import { IconTrendingDown, IconTrendingUp, IconWallet, IconPigMoney } from '@tabler/icons-react'
import { useAppStore } from '@/lib/store'
import { useDashboard } from '@/lib/hooks'
import { StatCard } from '@/components/shared/UI'
import { fmtMoney, monthKey } from '@/lib/money'
import TransactionRow from '@/components/transactions/TransactionRow'

export default function DashboardPage() {
  const workspace = useAppStore((s) => s.workspace)
  const wsId = workspace?._id
  const month = monthKey()
  const { data: dash, isLoading } = useDashboard(wsId, month)

  if (isLoading) return <Skeleton height={240} radius="md" />

  return (
    <Stack>
      <Text fw={700} size="xl">
        Dashboard
      </Text>
      <SimpleGrid cols={{ base: 2, lg: 4 }}>
        <StatCard
          label="Balance"
          value={dash ? fmtMoney(dash.balanceMinor, dash.baseCurrency) : '-'}
          color="indigo"
        />
        <StatCard
          label="Income"
          value={dash ? fmtMoney(dash.incomeMinor, dash.baseCurrency) : '-'}
          color="green"
          sub="this month"
        />
        <StatCard
          label="Expenses"
          value={dash ? fmtMoney(dash.expenseMinor, dash.baseCurrency) : '-'}
          color="red"
          sub="this month"
        />
        <StatCard
          label="Saved"
          value={dash ? fmtMoney(dash.savingsMinor, dash.baseCurrency) : '-'}
          color="teal"
          sub="goal contributions"
        />
      </SimpleGrid>

      {dash && (
        <SimpleGrid cols={{ base: 1, lg: 3 }}>
          <Paper withBorder p="md" radius="md">
            <Group justify="space-between" mb="sm">
              <Text fw={600}>Spending by category</Text>
              <ThemeIcon variant="light" size="sm">
                <IconTrendingUp size={16} />
              </ThemeIcon>
            </Group>
            <Stack gap="xs">
              {(dash.byCategory.length ? dash.byCategory : []).map((b) => {
                const pct = dash.expenseMinor > 0 ? (b.amountMinor / dash.expenseMinor) * 100 : 0
                return (
                  <Group key={b.categoryId} justify="space-between">
                    <Text size="sm">{b.category?.name ?? 'Other'}</Text>
                    <Group gap="xs">
                      <Text size="sm" fw={600}>
                        {fmtMoney(b.amountMinor, dash.baseCurrency)}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {pct.toFixed(0)}%
                      </Text>
                    </Group>
                  </Group>
                )
              })}
              {!dash.byCategory.length && (
                <Text size="sm" c="dimmed">
                  No spending this month
                </Text>
              )}
            </Stack>
          </Paper>

          <Paper withBorder p="md" radius="md">
            <Text fw={600} mb="sm">
              Recent activity
            </Text>
            <Stack gap={4}>
              {(dash.recentTransactions ?? []).slice(0, 6).map((t) => (
                <TransactionRow key={t._id} txn={t} />
              ))}
              {!dash.recentTransactions?.length && (
                <Text size="sm" c="dimmed">
                  No transactions yet. Press ⌘K to add your first one.
                </Text>
              )}
            </Stack>
          </Paper>

          <Paper withBorder p="md" radius="md">
            <Group justify="space-between" mb="sm">
              <Text fw={600}>Wallets</Text>
              <IconWallet size={16} />
            </Group>
            <Stack gap="xs">
              {(dash.byWallet ?? []).map((w) => (
                <Group key={w.walletId} justify="space-between">
                  <Text size="sm">{w.walletName ?? 'Wallet'}</Text>
                  <Text size="sm" fw={600}>
                    {fmtMoney(w.amountMinor, dash.baseCurrency)}
                  </Text>
                </Group>
              ))}
              {!dash.byWallet?.length && (
                <Text size="sm" c="dimmed">
                  No wallets yet
                </Text>
              )}
            </Stack>
          </Paper>
        </SimpleGrid>
      )}
    </Stack>
  )
}