'use client'

import {
  Button,
  Card,
  Group,
  LoadingOverlay,
  Menu,
  Modal,
  NumberInput,
  Progress,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { useQueryClient } from '@tanstack/react-query'
import { IconDots, IconPlus, IconTarget, IconTrash, IconTrophy } from '@tabler/icons-react'
import { useState } from 'react'
import { goalsApi } from '@/lib/endpoints'
import { useAppStore } from '@/lib/store'
import { useGoals, useWallets } from '@/lib/hooks'
import { invalidateRefreshKeys } from '@/lib/hooks'
import { fmtMoney } from '@/lib/money'
import { EmptyState } from '@/components/shared/UI'

const CURRENCIES = ['USD', 'EUR', 'GBP', 'BDT', 'INR', 'JPY', 'CAD', 'AUD', 'SGD', 'AED', 'BTC', 'ETH']

export default function GoalsPage() {
  const workspace = useAppStore((s) => s.workspace)
  const wsId = workspace?._id
  const qc = useQueryClient()
  const [opened, { open, close }] = useDisclosure(false)
  const [saving, setSaving] = useState(false)
  const { data: goals, isLoading } = useGoals(wsId)
  const walletQuery = useWallets(wsId)

  const [contribute, setContribute] = useState<{ goalId: string; name: string } | null>(null)
  const [completeId, setCompleteId] = useState<string | null>(null)
  const [amount, setAmount] = useState<number | undefined>(10)
  const [walletId, setWalletId] = useState<string | null>(null)

  const createForm = useForm<{ name: string; target: number | undefined; currency: string; targetDate: string }>({
    initialValues: { name: '', target: undefined, currency: workspace?.baseCurrency ?? 'USD', targetDate: '' }
  })

  const create = async (values: typeof createForm.values) => {
    if (!wsId) return
    setSaving(true)
    try {
      await goalsApi.create(wsId, {
        name: values.name,
        target: values.target ?? 0,
        currency: values.currency,
        targetDate: values.targetDate || undefined
      })
      notifications.show({ color: 'green', message: 'Goal created' })
      invalidateRefreshKeys(qc, wsId)
      close()
      createForm.reset()
    } catch (e) {
      notifications.show({ color: 'red', message: (e as Error).message })
    } finally {
      setSaving(false)
    }
  }

  const contributeNow = async () => {
    if (!wsId || !contribute || !walletId) return
    try {
      await goalsApi.contribute(wsId, contribute.goalId, { walletId, amount: amount ?? 0 })
      notifications.show({ color: 'green', message: 'Contribution added' })
      invalidateRefreshKeys(qc, wsId)
      setContribute(null)
    } catch (e) {
      notifications.show({ color: 'red', message: (e as Error).message })
    }
  }

  const complete = async () => {
    if (!wsId || !completeId) return
    try {
      await goalsApi.complete(wsId, completeId)
      notifications.show({ color: 'green', message: 'Goal completed!' })
      invalidateRefreshKeys(qc, wsId)
      setCompleteId(null)
    } catch (e) {
      notifications.show({ color: 'red', message: (e as Error).message })
    }
  }

  const archive = async (id: string) => {
    if (!wsId) return
    await goalsApi.del(wsId, id)
    notifications.show({ message: 'Goal archived' })
    invalidateRefreshKeys(qc, wsId)
  }

  return (
    <Stack pos="relative">
      <LoadingOverlay visible={isLoading} overlayProps={{ blur: 1 }} />
      <Group justify="space-between">
        <Text fw={700} size="xl">
          Savings goals
        </Text>
        <Button leftSection={<IconPlus size={16} />} onClick={open} disabled={!wsId}>
          New goal
        </Button>
      </Group>

      {goals?.length ? (
        <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }}>
          {goals.map((g) => {
            const pct = Math.min(100, g.progressPercent ?? 0)
            const complete = g.status === 'complete'
            return (
              <Card key={g._id} withBorder shadow="sm" radius="md" p="lg">
                <Group justify="space-between" mb="xs">
                  <Group>
                    {complete ? <IconTrophy size={18} color="var(--mantine-color-warning-4)" /> : <IconTarget size={18} />}
                    <Text fw={600}>{g.name}</Text>
                  </Group>
                  <Menu position="bottom-end" withinPortal>
                    <Menu.Target>
                      <Button variant="subtle" size="compact-sm" px={4}>
                        <IconDots size={16} />
                      </Button>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item onClick={() => setContribute({ goalId: g._id, name: g.name })} disabled={complete}>
                        Contribute
                      </Menu.Item>
                      {!complete && (
                        <Menu.Item onClick={() => setCompleteId(g._id)} disabled={pct < 100}>
                          Mark complete
                        </Menu.Item>
                      )}
                      <Menu.Item color="error" leftSection={<IconTrash size={14} />} onClick={() => archive(g._id)}>
                        Archive
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Group>
                <Text fw={700} size="xl">
                  {fmtMoney(g.savedMinor ?? 0, g.currency)}
                  <Text component="span" size="sm" c="dimmed" fw={400}>
                    {' '}
                    / {fmtMoney(g.targetMinor, g.currency)}
                  </Text>
                </Text>
                <Group justify="space-between" mt="sm" mb={6}>
                  <Text size="xs" c="dimmed">
                    {pct.toFixed(0)}%
                  </Text>
                  {g.daysLeft != null && (
                    <Text size="xs" c="dimmed">
                      {g.daysLeft} days left
                    </Text>
                  )}
                </Group>
                <Progress value={pct} color={pct >= 100 ? 'success' : 'primary'} radius="xl" size="sm" />
                <Text size="xs" c="dimmed" mt="sm">
                  {complete ? 'Completed' : `Saved ${g.contributions?.length ?? 0} contribution(s)`}
                </Text>
              </Card>
            )
          })}
        </SimpleGrid>
      ) : (
        <EmptyState icon={<IconTarget size={40} />} title="No goals yet" hint="Set a target and track your progress over time." />
      )}

      <Modal opened={opened} onClose={close} title="New goal" centered>
        <form onSubmit={createForm.onSubmit(create)}>
          <Stack>
            <TextInput label="Goal name" placeholder="e.g. Emergency fund" required {...createForm.getInputProps('name')} />
            <NumberInput label="Target amount" min={1} required {...createForm.getInputProps('target')} />
            <Select
              label="Currency"
              data={CURRENCIES}
              searchable
              required
              {...createForm.getInputProps('currency')}
            />
            <TextInput label="Target date (optional)" type="date" {...createForm.getInputProps('targetDate')} />
            <Button type="submit" loading={saving}>
              Create goal
            </Button>
          </Stack>
        </form>
      </Modal>

      <Modal opened={!!contribute} onClose={() => setContribute(null)} title={`Contribute to ${contribute?.name ?? ''}`} centered>
        <Stack>
          <Select
            label="From wallet"
            placeholder="Select wallet"
            data={(walletQuery.data ?? []).map((w) => ({ value: w._id, label: `${w.name} (${w.currency})` }))}
            searchable
            value={walletId}
            onChange={setWalletId}
          />
          <NumberInput label="Amount" min={0.01} value={amount} onChange={(v) => setAmount(v as number)} />
          <Button onClick={contributeNow}>Add contribution</Button>
        </Stack>
      </Modal>

      <Modal opened={!!completeId} onClose={() => setCompleteId(null)} title="Complete goal" centered>
        <Text size="sm" mb="lg">
          This moves the held money to expenses and locks the goal as complete.
        </Text>
        <Group justify="flex-end">
          <Button color="success" onClick={complete}>
            Complete goal
          </Button>
        </Group>
      </Modal>
    </Stack>
  )
}