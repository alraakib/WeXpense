'use client'

import { Group, Paper, Select, SimpleGrid, Stack, Text } from '@mantine/core'
import { IconChartPie } from '@tabler/icons-react'
import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip as ReTooltip,
  XAxis,
  YAxis
} from 'recharts'
import { useAppStore } from '@/lib/store'
import { useDashboard } from '@/lib/hooks'
import { fmtMoney, monthKey } from '@/lib/money'
import { EmptyState } from '@/components/shared/UI'
import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '@/lib/endpoints'
import type { TrendPoint } from '@/lib/types'

function useTrend(wsId?: string, months = 6) {
  return useQuery({ queryKey: ['trend', wsId], queryFn: () => analyticsApi.trend(wsId!, months), enabled: !!wsId })
}

export default function AnalyticsPage() {
  const workspace = useAppStore((s) => s.workspace)
  const wsId = workspace?._id
  const [month, setMonth] = useState<string | null>(null)

  const monthOptions = useMemo(() => {
    const out: Array<{ value: string; label: string }> = []
    for (let i = 0; i < 6; i++) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      const key = d.toISOString().slice(0, 7)
      out.push({ value: key, label: d.toLocaleString('en-US', { month: 'long', year: 'numeric' }) })
    }
    return out
  }, [])

  const { data: dash } = useDashboard(wsId, month ?? monthKey())
  const { data: trend } = useTrend(wsId)

  const chartData = useMemo(
    () =>
      (trend ?? []).map((t) => ({
        name: t.month,
        Income: t.incomeMinor,
        Expenses: t.expenseMinor
      })),
    [trend]
  )

  const categoryData = useMemo(
    () =>
      (dash?.byCategory ?? []).map((b) => ({
        name: b.category?.name ?? 'Other',
        amount: b.amountMinor,
        pct: (dash?.expenseMinor ?? 0) > 0 ? (b.amountMinor / (dash?.expenseMinor ?? 1)) * 100 : 0
      })),
    [dash]
  )

  const hasData = (dash?.incomeMinor ?? 0) + (dash?.expenseMinor ?? 0) > 0

  return (
    <Stack>
      <Group justify="space-between">
        <Text fw={700} size="xl">
          Analytics
        </Text>
        <Select
          placeholder="Month"
          clearable
          data={monthOptions}
          value={month}
          onChange={setMonth}
          w={200}
        />
      </Group>

      {!hasData && !trend?.length ? (
        <EmptyState icon={<IconChartPie size={40} />} title="Nothing to chart yet" hint="Add a few transactions and come back." />
      ) : (
        <SimpleGrid cols={{ base: 1, lg: 2 }}>
          <Paper withBorder p="md" radius="md">
            <Text fw={600} mb="md">
              Income vs expenses
            </Text>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <ReTooltip formatter={(v: number) => fmtMoney(v, dash?.baseCurrency ?? 'USD')} />
                <Legend />
                <Bar dataKey="Income" fill="var(--mantine-color-green-5)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expenses" fill="var(--mantine-color-red-5)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>

          <Paper withBorder p="md" radius="md">
            <Text fw={600} mb="md">
              Spending by category
            </Text>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={categoryData} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" fontSize={12} />
                <YAxis type="category" dataKey="name" width={110} fontSize={12} />
                <ReTooltip formatter={(v: number) => fmtMoney(v, dash?.baseCurrency ?? 'USD')} />
                <Bar dataKey="amount" name="Spent" fill="var(--mantine-color-indigo-5)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>

          <Paper withBorder p="md" radius="md">
            <Text fw={600} mb="md">
              Category breakdown
            </Text>
            <Stack gap="xs">
              {categoryData.map((c) => (
                <Group key={c.name} justify="space-between">
                  <Text size="sm" style={{ flex: 1 }}>
                    {c.name}
                  </Text>
                  <div style={{ flex: 2, height: 8, borderRadius: 99, background: 'var(--mantine-color-gray-2)', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${c.pct}%`,
                        background: 'var(--mantine-color-indigo-5)',
                        borderRadius: 99
                      }}
                    />
                  </div>
                  <Text size="sm" fw={600} w={90} ta="right">
                    {fmtMoney(c.amount, dash?.baseCurrency ?? 'USD')}
                  </Text>
                </Group>
              ))}
            </Stack>
          </Paper>
        </SimpleGrid>
      )}
    </Stack>
  )
}