'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Center, Loader } from '@mantine/core'
import { usersApi } from '@/lib/endpoints'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    usersApi
      .me()
      .then(() => router.replace('/dashboard'))
      .catch(() => router.replace('/login'))
  }, [router])

  return (
    <Center h="100vh">
      <Loader size="lg" />
    </Center>
  )
}