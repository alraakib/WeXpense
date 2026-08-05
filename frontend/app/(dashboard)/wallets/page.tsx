'use client'

import {
  Button,
  Card,
  Group,
  LoadingOverlay,
  Menu,
  Modal,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Tooltip
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { useQueryClient } from '@tanstack/react-query'
import { IconDots, IconPlus, IconTrash, IconWallet } from '@tabler/icons-react'
import { useState } from 'react'
import { walletsApi } from '@/lib/endpoints'
import { useAppStore } from '@/lib/store'
import { useWallets } from '@/lib/hooks'
import { invalidateRefreshKeys } from '@/lib/hooks'
import { fmtMoney } from '@/lib/money'
import { EmptyState } from '@/components/shared/UI'

const CURRENCIES = ['USD', 'EUR', 'GBP', 'BDT', 'INR', 'JPY', 'CAD', 'AUD', 'SGD', 'AED', 'BTC', 'ETH']

export default function WalletsPage() {
  const workspace = useAppStore((s) => s.workspace)
  const wsId = workspace?._id
  const qc = useQueryClient()
  const [opened, { open, close }] = useDisclosure(false)
  const [saving, setSaving] = useState(false)
  const { data: wallets, isLoading } = useWallets(wsId)

  const form = useForm<{ name: string; currency: string; initialBalance: number | undefined }>({
    initialValues: { name: '', currency: 'USD', initialBalance: undefined }
  })

  const create = async (values: typeof form.values) => {
    if (!wsId) return
    setSaving(true)
    try {
      await walletsApi.create(wsId, {
        name: values.name,
        currency: values.currency,
        initialBalance: values.initialBalance ?? 0
      })
      notifications.show({ color: 'green', message: 'Wallet created' })
      invalidateRefreshKeys(qc, wsId)
      close()
      form.reset()
    } catch (e) {
      notifications.show({ color: 'red', message: (e as Error).message })
    } finally {
      setSaving(false)
    }
  }

  const archive = async (id: string) => {
    if (!wsId) return
    await walletsApi.archive(wsId, id)
    notifications.show({ message: 'Wallet archived' })
    invalidateRefreshKeys(qc, wsId)
  }

  return (
    <Stack pos="relative">
      <LoadingOverlay visible={isLoading} overlayProps={{ blur: 1 }} />
      <Group justify="space-between">
        <Text fw={700} size="xl">
          Wallets
        </Text>
        <Button leftSection={<IconPlus size={16} />} onClick={open} disabled={!wsId}>
          New wallet
        </Button>
      </Group>

      {wallets?.length ? (
        <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }}>
          {wallets.map((w) => {
            const spentPct = w.balanceMinor === 0 ? 100 : Math.max(0, Math.min(1, w.balanceMinor / Math.max(1, w.initialBalanceMinor)))
            return (
              <Card key={w._id} withBorder shadow="sm" radius="md" p="lg">
                <Group justify="space-between" mb="xs">
                  <Group>
                    <Text fw={600}>{w.name}</Text>
                    <Text size="xs" c="dimmed">
                      {w.currency}
                    </Text>
                  </Group>
                  <Menu position="bottom-end" withinPortal>
                    <Menu.Target>
                      <Button variant="subtle" size="compact-sm" px={4}>
                        <IconDots size={16} />
                      </Button>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item color="error" leftSection={<IconTrash size={14} />} onClick={() => archive(w._id)}>
                        Archive
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Group>
                <Text fw={700} size="xl">
                  {fmtMoney(w.balanceMinor, w.currency)}
                </Text>
                <Text size="xs" c="dimmed" mb="xs">
                  {w.equivalentMinor != null && `≈ ${fmtMoney(w.equivalentMinor, w.equivalentCurrency ?? workspace?.baseCurrency ?? 'USD')}`}
                  {w.heldMinor > 0 && ` · ${fmtMoney(w.heldMinor, w.currency)} on hold`}
                </Text>
                <Paper
                  withBorder
                  p="xs"
                  radius="md"
                  bg="light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-6))"
                >
                  <Group justify="space-between" mb={4}>
                    <Text size="xs" c="dimmed">
                      Used
                    </Text>
                    <Text size="xs" fw={600}>
                      {(spentPct * 100).toFixed(0)}%
                    </Text>
                  </Group>
                  <div
                    style={{
                      height: 6,
                      borderRadius: 99,
                      background: 'light-dark(var(--mantine-color-gray-2), var(--mantine-color-dark-5))',
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${spentPct * 100}%`,
                        background: 'var(--mantine-color-primary-5)',
                        borderRadius: 99
                      }}
                    />
                  </div>
                </Paper>
              </Card>
            )
          })}
        </SimpleGrid>
      ) : (
        <EmptyState icon={<IconWallet size={40} />} title="No wallets yet" hint="Create a wallet to start tracking money." />
      )}

      <Modal opened={opened} onClose={close} title="New wallet" centered>
        <form onSubmit={form.onSubmit(create)}>
          <Stack>
            <TextInput label="Name" placeholder="e.g. Cash, Savings" required {...form.getInputProps('name')} />
            <Select
              label="Currency"
              data={CURRENCIES}
              searchable
              required
              {...form.getInputProps('currency')}
            />
            <TextInput
              label="Initial balance (optional)"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...form.getInputProps('initialBalance')}
            />
            <Button type="submit" loading={saving}>
              Create wallet
            </Button>
          </Stack>
        </form>
      </Modal>
    </Stack>
  )
}