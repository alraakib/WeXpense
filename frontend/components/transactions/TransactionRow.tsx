'use client'

import { Badge, Group, Text, ThemeIcon } from '@mantine/core'
import { IconArrowDownRight, IconArrowUpRight, IconArrowsRightLeft } from '@tabler/icons-react'
import type { Transaction } from '@/lib/types'
import { fmtMoney } from '@/lib/money'

export default function TransactionRow({ txn }: { txn: Transaction }) {
  const icon =
    txn.type === 'income' ? (
      <IconArrowUpRight size={16} color="var(--mantine-color-green-6)" />
    ) : txn.type === 'transfer' ? (
      <IconArrowsRightLeft size={16} />
    ) : (
      <IconArrowDownRight size={16} color="var(--mantine-color-red-6)" />
    )

  const title = txn.category?.name ?? txn.notes ?? (txn.type === 'transfer' ? 'Transfer' : 'Transaction')

  return (
    <Group justify="space-between" wrap="nowrap" gap="sm">
      <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
        <ThemeIcon variant="light" size="sm">
          {icon}
        </ThemeIcon>
        <div style={{ minWidth: 0 }}>
          <Text size="sm" fw={500} truncate>
            {title}
          </Text>
          <Text size="xs" c="dimmed" truncate>
            {txn.walletName ?? ''} · {txn.date}
          </Text>
        </div>
      </Group>
      <Group gap={4} wrap="nowrap">
        {txn.type === 'expense' && <Badge size="xs" color="gray" variant="light">expense</Badge>}
        <Text size="sm" fw={600} c={txn.type === 'income' ? 'green' : txn.type === 'expense' ? 'red' : undefined} w={90} ta="right" truncate>
          {txn.type === 'income' ? '+' : txn.type === 'expense' ? '−' : ''}
          {fmtMoney(txn.amountMinor, txn.walletCurrency ?? txn.currency)}
        </Text>
      </Group>
    </Group>
  )
}