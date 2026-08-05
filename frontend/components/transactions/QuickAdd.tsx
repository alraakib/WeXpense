'use client'

import { Button, Input, Modal, NumberInput, Select, SegmentedControl, Stack, TextInput, Textarea } from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { transactionsApi } from '@/lib/endpoints'
import { useQuickAdd, useAppStore } from '@/lib/store'
import { useCategories, useWallets } from '@/lib/hooks'
import { invalidateRefreshKeys } from '@/lib/hooks'

export default function QuickAdd() {
  const { open, setOpen, defaultType } = useQuickAdd()
  const workspace = useAppStore((s) => s.workspace)
  const wsId = workspace?._id
  const walletQuery = useWallets(wsId)
  const categoryQuery = useCategories(wsId)
  const qc = useQueryClient()
  const [saving, setSaving] = useState(false)

  const wallets = walletQuery.data ?? []
  const categories = categoryQuery.data ?? []

  const form = useForm({
    initialValues: {
      type: 'expense',
      amount: undefined as number | undefined,
      walletId: '',
      transferToWalletId: '',
      categoryId: '',
      date: new Date().toISOString().slice(0, 10),
      notes: ''
    }
  })

  useEffect(() => {
    if (open) form.setFieldValue('type', defaultType ?? 'expense')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const submit = async (values: typeof form.values) => {
    if (!wsId) return
    setSaving(true)
    try {
      await transactionsApi.create(wsId, {
        type: values.type,
        amount: values.amount ?? 0,
        walletId: values.walletId,
        transferToWalletId: values.type === 'transfer' ? values.transferToWalletId || undefined : undefined,
        categoryId: values.categoryId || undefined,
        date: values.date,
        notes: values.notes || undefined
      })
      notifications.show({ color: 'green', message: `${values.type === 'income' ? 'Income' : 'Expense'} added` })
      invalidateRefreshKeys(qc, wsId)
      setOpen(false)
      form.reset()
    } catch (e) {
      notifications.show({ color: 'red', message: (e as Error).message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal opened={open} onClose={() => setOpen(false)} title="Add transaction" centered>
      <form onSubmit={form.onSubmit(submit)}>
        <Stack>
          <SegmentedControl
            fullWidth
            data={[
              { label: 'Expense', value: 'expense' },
              { label: 'Income', value: 'income' },
              { label: 'Transfer', value: 'transfer' }
            ]}
            {...form.getInputProps('type')}
          />
          <NumberInput
            label="Amount"
            placeholder="0.00"
            min={0}
            decimalScale={2}
            {...form.getInputProps('amount')}
          />
          <Select
            label="Wallet"
            placeholder="Select wallet"
            data={wallets.map((w) => ({ value: w._id, label: `${w.name} (${w.currency})` }))}
            searchable
            {...form.getInputProps('walletId')}
          />
          {form.values.type === 'transfer' && (
            <Select
              label="To wallet"
              placeholder="Select destination wallet"
              data={wallets
                .filter((w) => w._id !== form.values.walletId)
                .map((w) => ({ value: w._id, label: `${w.name} (${w.currency})` }))}
              searchable
              {...form.getInputProps('transferToWalletId')}
            />
          )}
          {form.values.type !== 'transfer' && (
            <Select
              label="Category"
              placeholder="Optional"
              clearable
              data={categories.map((c) => ({ value: c._id, label: c.name }))}
              searchable
              {...form.getInputProps('categoryId')}
            />
          )}
          <Input.Wrapper label="Date">
            <Input type="date" {...form.getInputProps('date')} />
          </Input.Wrapper>
          <Textarea label="Notes" placeholder="Optional note" autosize minRows={2} {...form.getInputProps('notes')} />
          <Button type="submit" loading={saving}>
            Save
          </Button>
        </Stack>
      </form>
    </Modal>
  )
}