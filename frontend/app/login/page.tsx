'use client'

import { Anchor, Box, Button, Group, Paper, PasswordInput, Text, TextInput, Title } from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { authApi } from '@/lib/endpoints'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const form = useForm({
    initialValues: { email: '', password: '' },
    validate: {
      email: (v) => (/^\S+@\S+\.\S+$/.test(v) ? null : 'Enter a valid email'),
      password: (v) => (v.length >= 8 ? null : 'Password must be at least 8 characters')
    }
  })

  const submit = async (values: typeof form.values) => {
    setLoading(true)
    try {
      const res = await authApi.signin(values.email, values.password)
      if (res?.token) localStorage.setItem('ws-token', res.token)
      notifications.show({ color: 'green', title: 'Welcome back', message: 'Signed in successfully' })
      router.push('/dashboard')
    } catch (e) {
      notifications.show({ color: 'red', title: 'Sign in failed', message: (e as Error).message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box maw={420} mx="auto" pt={80}>
      <Title order={1} size="h2" mb={4}>
        Welcome back
      </Title>
      <Text c="dimmed" mb="lg">
        Sign in to WeXpense to manage your money.
      </Text>
      <Paper withBorder shadow="sm" p="lg" radius="md">
        <form onSubmit={form.onSubmit(submit)}>
          <TextInput label="Email" placeholder="you@example.com" {...form.getInputProps('email')} mb="sm" />
          <PasswordInput label="Password" placeholder="Your password" {...form.getInputProps('password')} mb="lg" />
          <Group justify="space-between">
            <Anchor component={Link} href="/signup" size="sm">
              No account? Sign up
            </Anchor>
            <Button type="submit" loading={loading}>
              Sign in
            </Button>
          </Group>
        </form>
      </Paper>
    </Box>
  )
}