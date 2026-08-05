'use client'

import { Box, Button, Group, NumberInput, Select, Stack, Stepper, Text, TextInput, Title } from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { onboardingApi } from '@/lib/endpoints'

const CURRENCIES = ['USD', 'EUR', 'GBP', 'BDT', 'INR', 'JPY', 'CAD', 'AUD', 'SGD', 'AED', 'BTC', 'ETH']

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)

  const form = useForm<{
    baseCurrency: string
    walletName: string
    walletCurrency: string
    initialBalance: number | undefined
    goalName: string
    goalTarget: number | undefined
  }>({
    initialValues: {
      baseCurrency: 'USD',
      walletName: 'Cash',
      walletCurrency: 'USD',
      initialBalance: undefined,
      goalName: '',
      goalTarget: undefined
    }
  })

  const next = () => (step < 2 ? setStep(step + 1) : finish())
  const back = () => setStep(Math.max(0, step - 1))

  const finish = async () => {
    setLoading(true)
    try {
      await onboardingApi.complete({
        baseCurrency: form.values.baseCurrency,
        walletName: form.values.walletName,
        walletCurrency: form.values.walletCurrency,
        initialBalance: form.values.initialBalance ?? 0,
        goalName: form.values.goalName || undefined,
        goalTarget: form.values.goalTarget
      })
      router.push('/dashboard')
    } catch (e) {
      notifications.show({ color: 'red', message: (e as Error).message })
      setLoading(false)
    }
  }

  return (
    <Box maw={480} mx="auto" pt={60}>
      <Title order={1} size="h2" mb="lg" ta="center">
        Set up your workspace
      </Title>
      <Stepper active={step} onStepClick={setStep} allowNextStepsSelect={false}>
        <Stepper.Step label="Currency">
          <Select
            label="Base currency"
            description="Used for your workspace totals"
            data={CURRENCIES}
            searchable
            mt="lg"
            {...form.getInputProps('baseCurrency')}
          />
        </Stepper.Step>
        <Stepper.Step label="Wallet">
          <Stack mt="lg">
            <TextInput label="Wallet name" {...form.getInputProps('walletName')} />
            <Select label="Wallet currency" data={CURRENCIES} searchable {...form.getInputProps('walletCurrency')} />
            <NumberInput
              label="Starting balance (optional)"
              min={0}
              {...form.getInputProps('initialBalance')}
            />
          </Stack>
        </Stepper.Step>
        <Stepper.Step label="Goal">
          <Stack mt="lg">
            <Text size="sm" c="dimmed">
              Optional: create your first savings goal.
            </Text>
            <TextInput label="Goal name" placeholder="e.g. Vacation" {...form.getInputProps('goalName')} />
            <NumberInput label="Target amount" min={1} {...form.getInputProps('goalTarget')} />
          </Stack>
        </Stepper.Step>
        <Stepper.Completed>
          <Text mt="lg" ta="center">
            You're all set. Welcome aboard!
          </Text>
        </Stepper.Completed>
      </Stepper>

      <Group justify="space-between" mt="xl">
        <Button variant="subtle" onClick={back} disabled={step === 0}>
          Back
        </Button>
        <Button onClick={next} loading={loading}>
          {step === 2 ? 'Finish' : 'Next'}
        </Button>
      </Group>
    </Box>
  )
}