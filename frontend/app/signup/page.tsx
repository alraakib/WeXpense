'use client'

import { Anchor, Box, Button, Group, Paper, PasswordInput, Text, TextInput, Title } from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { authApi } from '@/lib/endpoints'

export default function SignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const form = useForm({
    initialValues: { name: '', email: '', password: '' },
    validate: {
      name: (v) => (v.trim().length >= 2 ? null : 'Enter your name'),
      email: (v) => (/^\S+@\S+\.\S+$/.test(v) ? null : 'Enter a valid email'),
      password: (v) => (v.length >= 8 ? null : 'Password must be at least 8 characters')
    }
  })

  const submit = async (values: typeof form.values) => {
    setLoading(true)
    try {
      const res = await authApi.signup(values.email, values.password, values.name)
      if (res?.token) localStorage.setItem('ws-token', res.token)
      notifications.show({ color: 'green', title: 'Account created', message: 'Welcome to WeXpense!' })
      router.push('/onboarding')
    } catch (e) {
      notifications.show({ color: 'red', title: 'Sign up failed', message: (e as Error).message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box maw={420} mx="auto" pt={80}>
      <Title order={1} size="h2" mb={4}>
        Create your account
      </Title>
      <Text c="dimmed" mb="lg">
        Start tracking budgets, savings, and shared expenses in minutes.
      </Text>
      <Paper withBorder shadow="sm" p="lg" radius="md">
        <form onSubmit={form.onSubmit(submit)}>
          <TextInput label="Name" placeholder="Ada Lovelace" {...form.getInputProps('name')} mb="sm" />
          <TextInput label="Email" placeholder="you@example.com" {...form.getInputProps('email')} mb="sm" />
          <PasswordInput label="Password" placeholder="At least 8 characters" {...form.getInputProps('password')} mb="lg" />
          <Group justify="space-between">
            <Anchor component={Link} href="/login" size="sm">
              Already have an account? Sign in
            </Anchor>
            <Button type="submit" loading={loading}>
              Create account
            </Button>
          </Group>
        </form>
      </Paper>
    </Box>
  )
}