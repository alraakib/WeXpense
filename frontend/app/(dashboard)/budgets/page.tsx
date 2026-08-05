'use client'

import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  LoadingOverlay,
  Modal,
  NumberInput,
  Progress,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  Tooltip
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { useQueryClient } from '@tanstack/react-query'
import { IconPlus, IconTrash, IconBolt } from '@tabler/icons-react'
import { useState } from 'react'
import { budgetsApi } from '@/lib/endpoints'
import { useAppStore } from '@/lib/store'
import { useBudgets, useCategories } from '@/lib/hooks'
import { invalidateRefreshKeys } from '@/lib/hooks'
import { fmtMoney } from '@/lib/money'
import { EmptyState } from '@/components/shared/UI'

export default function BudgetsPage() {
  const workspace = useAppStore((s) => s.workspace)
  const wsId = workspace?._id
  const qc = useQueryClient()
  const [opened, { open, close }] = useDisclosure(false)
  const [saving, setSaving] = useState(false)
  const { data: budgets, isLoading } = useBudgets(wsId)
  const categoryQuery = useCategories(wsId)

  const form = useForm<{
    categoryId: string
    amount: number | undefined
    period: 'monthly' | 'yearly'
    rollover: boolean
  }>({
    initialValues: { categoryId: '', amount: undefined, period: 'monthly', rollover: false }
  })

  const create = async (values: typeof form.values) => {
    if (!wsId) return
    setSaving(true)
    try {
      await budgetsApi.create(wsId, {
        categoryId: values.categoryId,
        amount: values.amount ?? 0,
        currency: workspace?.baseCurrency ?? 'USD',
        period: values.period,
        rollover: values.rollover
      })
      notifications.show({ color: 'green', message: 'Budget created' })
      invalidateRefreshKeys(qc, wsId)
      close()
      form.reset()
    } catch (e) {
      notifications.show({ color: 'red', message: (e as Error).message })
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: string) => {
    if (!wsId) return
    await budgetsApi.del(wsId, id)
    notifications.show({ message: 'Budget removed' })
    invalidateRefreshKeys(qc, wsId)
  }

  return (
    <Stack pos="relative">
      <LoadingOverlay visible={isLoading} overlayProps={{ blur: 1 }} />
      <Group justify="space-between">
        <Text fw={700} size="xl">
          Budgets
        </Text>
        <Button leftSection={<IconPlus size={16} />} onClick={open} disabled={!wsId}>
          New budget
        </Button>
      </Group>

      {budgets?.length ? (
        <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }}>
          {budgets.map((b) => {
            const pct = Math.min(100, b.percent ?? 0)
            const over = (b.percent ?? 0) > 100
            return (
              <Card key={b._id} withBorder shadow="sm" radius="md" p="lg">
                <Group justify="space-between" mb="xs">
                  <Group>
                    <Text fw={600}>{b.category?.name ?? 'Budget'}</Text>
                    <Badge size="xs" variant="light">
                      {b.period}
                    </Badge>
                  </Group>
                  <ActionIcon color="error" variant="subtle" onClick={() => remove(b._id)}>
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
                <Group justify="space-between" mb={6}>
                  <Text fw={700} size="lg" c={over ? 'error' : undefined}>
                    {fmtMoney(b.spendMinor ?? 0, b.currency)}
                  </Text>
                  <Text size="sm" c="dimmed">
                    / {fmtMoney(b.amountMinor, b.currency)}
                  </Text>
                </Group>
                <Progress value={pct} color={over ? 'error' : pct >= 80 ? 'warning' : 'success'} radius="xl" size="sm" />
                <Text size="xs" c="dimmed" mt="sm">
                  {b.remainingMinor != null && b.remainingMinor >= 0
                    ? `${fmtMoney(b.remainingMinor, b.currency)} remaining`
                    : 'Over budget'}
                </Text>
              </Card>
            )
          })}
        </SimpleGrid>
      ) : (
        <EmptyState icon={<IconBolt size={40} />} title="No budgets yet" hint="Set a spending limit per category and get alerted at 80%." />
      )}

      <Modal opened={opened} onClose={close} title="New budget" centered>
        <form onSubmit={form.onSubmit(create)}>
          <Stack>
            <Select
              label="Category"
              placeholder="Select category"
              data={(categoryQuery.data ?? []).map((c) => ({ value: c._id, label: c.name }))}
              searchable
              required
              {...form.getInputProps('categoryId')}
            />
            <NumberInput label="Monthly limit" min={1} required {...form.getInputProps('amount')} />
            <Select
              label="Period"
              data={[
                { value: 'monthly', label: 'Monthly' },
                { value: 'yearly', label: 'Yearly' }
              ]}
              {...form.getInputProps('period')}
            />
            <Switch label="Roll over unused budget" {...form.getInputProps('rollover', { type: 'checkbox' })} />
            <Button type="submit" loading={saving}>
              Create budget
            </Button>
          </Stack>
        </form>
      </Modal>
    </Stack>
  )
}