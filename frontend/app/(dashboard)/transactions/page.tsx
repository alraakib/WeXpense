'use client'

import {
  ActionIcon,
  Button,
  Group,
  Pagination,
  Paper,
  SegmentedControl,
  Select,
  Skeleton,
  Stack,
  Table,
  Text,
  TextInput,
  Tooltip
} from '@mantine/core'
import { useDebouncedValue } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { useQueryClient } from '@tanstack/react-query'
import { IconPlus, IconSearch, IconTrash } from '@tabler/icons-react'
import { useMemo, useState } from 'react'
import { transactionsApi } from '@/lib/endpoints'
import { useAppStore, useQuickAdd } from '@/lib/store'
import { useTransactions, useWallets } from '@/lib/hooks'
import { invalidateRefreshKeys } from '@/lib/hooks'
import { fmtMoney } from '@/lib/money'

export default function TransactionsPage() {
  const workspace = useAppStore((s) => s.workspace)
  const wsId = workspace?._id
  const qc = useQueryClient()

  const [page, setPage] = useState(1)
  const [type, setType] = useState<string | undefined>()
  const [search, setSearch] = useState('')
  const [debounced] = useDebouncedValue(search, 300)
  const [walletId, setWalletId] = useState<string | null>(null)

  const { data, isLoading } = useTransactions(wsId, {
    page,
    type,
    search: debounced || undefined,
    walletId: walletId ?? undefined
  })
  const walletQuery = useWallets(wsId)

  const rows = useMemo(() => data?.data ?? [], [data])

  const remove = async (id: string) => {
    if (!wsId) return
    await transactionsApi.del(wsId, id)
    notifications.show({ message: 'Transaction deleted' })
    invalidateRefreshKeys(qc, wsId)
  }

  return (
    <Stack>
      <Group justify="space-between">
        <Text fw={700} size="xl">
          Transactions
        </Text>
        <Button leftSection={<IconPlus size={16} />} onClick={() => useQuickAdd.getState().setOpen(true)}>
          Add
        </Button>
      </Group>

      <Group>
        <TextInput
          placeholder="Search notes…"
          leftSection={<IconSearch size={16} />}
          w={240}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
        />
        <SegmentedControl
          data={[
            { label: 'All', value: '' },
            { label: 'Income', value: 'income' },
            { label: 'Expense', value: 'expense' },
            { label: 'Transfers', value: 'transfer' }
          ]}
          value={type ?? ''}
          onChange={(v) => {
            setType(v || undefined)
            setPage(1)
          }}
        />
        <Select
          placeholder="All wallets"
          clearable
          data={(walletQuery.data ?? []).map((w) => ({ value: w._id, label: w.name }))}
          value={walletId}
          onChange={setWalletId}
          w={180}
        />
      </Group>

      <Paper withBorder radius="md">
        {isLoading ? (
          <Skeleton h={220} m="md" />
        ) : (
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Date</Table.Th>
                <Table.Th>Type</Table.Th>
                <Table.Th>Description</Table.Th>
                <Table.Th>Wallet</Table.Th>
                <Table.Th ta="right">Amount</Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.map((t) => (
                <Table.Tr key={t._id}>
                  <Table.Td style={{ whiteSpace: 'nowrap' }}>{t.date}</Table.Td>
                  <Table.Td>
                    <Text size="sm" tt="capitalize" c={t.type === 'income' ? 'green' : t.type === 'expense' ? 'red' : undefined}>
                      {t.type}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{t.category?.name ?? t.notes ?? '—'}</Text>
                    {t.notes && <Text size="xs" c="dimmed">{t.category?.name ?? ''}</Text>}
                  </Table.Td>
                  <Table.Td>{t.walletName ?? '—'}</Table.Td>
                  <Table.Td ta="right">
                    <Text fw={600} c={t.type === 'income' ? 'green' : t.type === 'expense' ? 'red' : undefined}>
                      {t.type === 'income' ? '+' : t.type === 'expense' ? '−' : ''}
                      {fmtMoney(t.amountMinor, t.walletCurrency ?? t.currency)}
                    </Text>
                  </Table.Td>
                  <Table.Td ta="right">
                    <Group gap={4} justify="flex-end">
                      <Tooltip label="Delete">
                        <ActionIcon color="red" variant="subtle" onClick={() => remove(t._id)}>
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
              {!rows.length && (
                <Table.Tr>
                  <Table.Td colSpan={6} ta="center" py="xl">
                    <Text c="dimmed">No transactions match</Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        )}
      </Paper>

      <Pagination
        value={page}
        onChange={setPage}
        total={Math.max(1, data?.pages ?? 1)}
        hidden={!data || data.pages <= 1}
      />
    </Stack>
  )
}