'use client'

import {
  Badge,
  Button,
  Card,
  Group,
  LoadingOverlay,
  Modal,
  NumberInput,
  Select,
  Stack,
  Switch,
  Table,
  Text,
  TextInput,
  Tooltip,
  ActionIcon
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { useQueryClient } from '@tanstack/react-query'
import { IconCheck, IconPlus, IconRepeat, IconTrash } from '@tabler/icons-react'
import { useState } from 'react'
import { recurringApi } from '@/lib/endpoints'
import { useAppStore } from '@/lib/store'
import { useRecurring, useWallets, useCategories } from '@/lib/hooks'
import { invalidateRefreshKeys } from '@/lib/hooks'
import { fmtMoney, fmtDate } from '@/lib/money'
import { EmptyState } from '@/components/shared/UI'

export default function RecurringPage() {
  const workspace = useAppStore((s) => s.workspace)
  const wsId = workspace?._id
  const qc = useQueryClient()
  const [opened, { open, close }] = useDisclosure(false)
  const [saving, setSaving] = useState(false)
  const { data: rules, isLoading } = useRecurring(wsId)
  const walletQuery = useWallets(wsId)
  const categoryQuery = useCategories(wsId)

  const form = useForm<{
    walletId: string
    categoryId: string
    amount: number | undefined
    frequency: 'daily' | 'weekly' | 'monthly'
    firstDueDate: string
    notes: string
    active: boolean
  }>({
    initialValues: {
      walletId: '',
      categoryId: '',
      amount: undefined,
      frequency: 'monthly',
      firstDueDate: new Date().toISOString().slice(0, 10),
      notes: '',
      active: true
    }
  })

  const create = async (values: typeof form.values) => {
    if (!wsId) return
    setSaving(true)
    try {
      await recurringApi.create(wsId, {
        walletId: values.walletId,
        amount: values.amount ?? 0,
        frequency: values.frequency,
        firstDueDate: values.firstDueDate,
        notes: values.notes || undefined,
        categoryId: values.categoryId || undefined,
        active: values.active
      })
      notifications.show({ color: 'green', message: 'Recurring expense created' })
      invalidateRefreshKeys(qc, wsId)
      close()
      form.reset()
    } catch (e) {
      notifications.show({ color: 'red', message: (e as Error).message })
    } finally {
      setSaving(false)
    }
  }

  const markPaid = async (id: string) => {
    if (!wsId) return
    await recurringApi.paid(wsId, id)
    notifications.show({ color: 'green', message: 'Marked as paid' })
    invalidateRefreshKeys(qc, wsId)
  }

  const remove = async (id: string) => {
    if (!wsId) return
    await recurringApi.del(wsId, id)
    notifications.show({ message: 'Rule deleted' })
    invalidateRefreshKeys(qc, wsId)
  }

  return (
    <Stack pos="relative">
      <LoadingOverlay visible={isLoading} overlayProps={{ blur: 1 }} />
      <Group justify="space-between">
        <Text fw={700} size="xl">
          Recurring expenses
        </Text>
        <Button leftSection={<IconPlus size={16} />} onClick={open} disabled={!wsId}>
          New rule
        </Button>
      </Group>

      {rules?.length ? (
        <Card withBorder shadow="sm" radius="md" p={0}>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Rule</Table.Th>
                <Table.Th>Frequency</Table.Th>
                <Table.Th>Next due</Table.Th>
                <Table.Th ta="right">Amount</Table.Th>
                <Table.Th ta="center">Status</Table.Th>
                <Table.Th ta="right">Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rules.map((r) => (
                <Table.Tr key={r._id}>
                  <Table.Td>
                    <Text size="sm" fw={500}>
                      {r.notes ?? 'Recurring expense'}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {r.walletName ?? ''}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" tt="capitalize">
                      {r.frequency}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Text size="sm">{fmtDate(r.nextDueDate)}</Text>
                      {r.isUpcoming && <Badge size="xs" color="orange">soon</Badge>}
                    </Group>
                  </Table.Td>
                  <Table.Td ta="right">
                    <Text fw={600}>{fmtMoney(r.amountMinor, r.currency)}</Text>
                  </Table.Td>
                  <Table.Td ta="center">
                    <Badge size="xs" color={r.active ? 'green' : 'gray'} variant="light">
                      {r.active ? 'active' : 'inactive'}
                    </Badge>
                  </Table.Td>
                  <Table.Td ta="right">
                    <Group gap={4} justify="flex-end">
                      <Tooltip label="Mark paid">
                        <ActionIcon color="green" variant="subtle" onClick={() => markPaid(r._id)}>
                          <IconCheck size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Delete">
                        <ActionIcon color="red" variant="subtle" onClick={() => remove(r._id)}>
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Card>
      ) : (
        <EmptyState icon={<IconRepeat size={40} />} title="No recurring rules" hint="Automate rent, subscriptions, and other regular payments." />
      )}

      <Modal opened={opened} onClose={close} title="New recurring rule" centered>
        <form onSubmit={form.onSubmit(create)}>
          <Stack>
            <Select
              label="Wallet"
              data={(walletQuery.data ?? []).map((w) => ({ value: w._id, label: w.name }))}
              searchable
              required
              {...form.getInputProps('walletId')}
            />
            <Select
              label="Category (optional)"
              placeholder="Optional"
              data={(categoryQuery.data ?? []).map((c) => ({ value: c._id, label: c.name }))}
              searchable
              clearable
              {...form.getInputProps('categoryId')}
            />
            <NumberInput label="Amount" min={0.01} required {...form.getInputProps('amount')} />
            <Select
              label="Frequency"
              data={[
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'monthly', label: 'Monthly' }
              ]}
              {...form.getInputProps('frequency')}
            />
            <TextInput label="First due date" type="date" {...form.getInputProps('firstDueDate')} />
            <TextInput label="Notes" placeholder="e.g. Netflix" {...form.getInputProps('notes')} />
            <Switch label="Active" {...form.getInputProps('active', { type: 'checkbox' })} />
            <Button type="submit" loading={saving}>
              Create rule
            </Button>
          </Stack>
        </form>
      </Modal>
    </Stack>
  )
}