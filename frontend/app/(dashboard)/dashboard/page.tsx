'use client'

import {
  Badge,
  Group,
  Paper,
  Progress,
  SimpleGrid,
  Skeleton,
  Stack,
  Table,
  Text
} from '@mantine/core'
import { useAppStore } from '@/lib/store'
import { useDashboard } from '@/lib/hooks'
import { StatCard } from '@/components/shared/UI'
import { fmtMoney, monthKey } from '@/lib/money'

export default function DashboardPage() {
  const workspace = useAppStore((s) => s.workspace)
  const wsId = workspace?._id
  const month = monthKey()
  const { data: dash, isLoading } = useDashboard(wsId, month)

  if (isLoading) return <Skeleton height={240} radius="md" />

  const income = dash?.incomeMinor ?? 0
  const expense = dash?.expenseMinor ?? 0
  const savings = dash?.savingsMinor ?? 0
  const balance = dash?.balanceMinor ?? 0
  const total = income > 0 ? income : 1

  return (
    <Stack gap="lg">
      <SimpleGrid cols={{ base: 2, lg: 4 }}>
        <StatCard
          label="Balance"
          value={dash ? fmtMoney(balance, dash.baseCurrency) : '-'}
        />
        <StatCard
          label="Income"
          value={dash ? fmtMoney(income, dash.baseCurrency) : '-'}
          sub="this month"
          color="success"
          trend={{ value: `${((income / total) * 100).toFixed(0)}%`, positive: true }}
        />
        <StatCard
          label="Expenses"
          value={dash ? fmtMoney(expense, dash.baseCurrency) : '-'}
          sub="this month"
          color="error"
        />
        <StatCard
          label="Saved"
          value={dash ? fmtMoney(savings, dash.baseCurrency) : '-'}
          sub="goal contributions"
          color="success"
        />
      </SimpleGrid>

      {dash && (
        <SimpleGrid cols={{ base: 1, lg: 2 }}>
          <Paper p="lg" radius="md">
            <Group justify="space-between" mb="md">
              <Text fw={600} size="lg">
                Spending by category
              </Text>
            </Group>
            {dash.byCategory.length ? (
              <Stack gap="sm">
                {dash.byCategory.map((b) => {
                  const pct = expense > 0 ? (b.amountMinor / expense) * 100 : 0
                  return (
                    <Stack key={b.categoryId} gap={4}>
                      <Group justify="space-between">
                        <Text size="sm" fw={500}>
                          {b.category?.name ?? 'Other'}
                        </Text>
                        <Group gap="sm">
                          <Text size="sm" fw={600}>
                            {fmtMoney(b.amountMinor, dash.baseCurrency)}
                          </Text>
                          <Badge size="sm" variant="light" color="gray">
                            {pct.toFixed(0)}%
                          </Badge>
                        </Group>
                      </Group>
                      <Progress
                        value={pct}
                        size="xs"
                        radius="xl"
                        color={pct > 50 ? 'error' : pct > 25 ? 'warning' : 'success'}
                      />
                    </Stack>
                  )
                })}
              </Stack>
            ) : (
              <Text size="sm" c="dimmed">
                No spending this month
              </Text>
            )}
          </Paper>

          <Paper p="lg" radius="md">
            <Group justify="space-between" mb="md">
              <Text fw={600} size="lg">
                Recent transactions
              </Text>
            </Group>
            {dash.recentTransactions?.length ? (
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Category</Table.Th>
                    <Table.Th ta="right">Amount</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {dash.recentTransactions.slice(0, 8).map((t) => (
                    <Table.Tr key={t._id}>
                      <Table.Td>
                        <Text size="sm">{t.categoryId ?? 'Uncategorized'}</Text>
                      </Table.Td>
                      <Table.Td ta="right">
                        <Text
                          size="sm"
                          fw={600}
                          c={t.type === 'expense' ? 'error' : t.type === 'income' ? 'success' : 'dimmed'}
                        >
                          {t.type === 'expense' ? '-' : t.type === 'income' ? '+' : ''}{fmtMoney(t.amountMinor, dash.baseCurrency)}
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            ) : (
              <Text size="sm" c="dimmed">
                No transactions yet. Press ⌘K to add your first one.
              </Text>
            )}
          </Paper>
        </SimpleGrid>
      )}
    </Stack>
  )
}