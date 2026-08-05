'use client'

import {
  ActionIcon,
  AppShell,
  Avatar,
  Badge,
  Burger,
  Group,
  Indicator,
  Menu,
  NavLink,
  ScrollArea,
  Text,
  Tooltip,
  UnstyledButton,
  useComputedColorScheme,
  useMantineColorScheme
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { Spotlight, spotlight } from '@mantine/spotlight'
import { useQuery } from '@tanstack/react-query'
import {
  IconArrowLeftRight,
  IconBell,
  IconChartPie,
  IconCreditCard,
  IconHome,
  IconLogout,
  IconMoon,
  IconPlus,
  IconRepeat,
  IconSettings,
  IconSun,
  IconTarget,
  IconUsers,
  IconWallet,
  IconBolt
} from '@tabler/icons-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { authApi, notificationsApi, usersApi, workspacesApi } from '@/lib/endpoints'
import { useWebSocket } from '@/lib/hooks'
import { useAppStore, useQuickAdd } from '@/lib/store'
import { fmtDate } from '@/lib/money'
import QuickAdd from '@/components/transactions/QuickAdd'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: IconHome },
  { href: '/transactions', label: 'Transactions', icon: IconArrowLeftRight },
  { href: '/wallets', label: 'Wallets', icon: IconWallet },
  { href: '/goals', label: 'Goals', icon: IconTarget },
  { href: '/budgets', label: 'Budgets', icon: IconBolt },
  { href: '/recurring', label: 'Recurring', icon: IconRepeat },
  { href: '/analytics', label: 'Analytics', icon: IconChartPie },
  { href: '/workspace', label: 'Members', icon: IconUsers },
  { href: '/settings', label: 'Settings', icon: IconSettings }
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [opened, { toggle }] = useDisclosure()
  const pathname = usePathname()
  const router = useRouter()
  const { setColorScheme } = useMantineColorScheme()
  const scheme = useComputedColorScheme('light', { getInitialValueInEffect: true })

  const { user, workspace, workspaces, setUser, setWorkspace, setWorkspaces, unread, setUnread } = useAppStore()

  useEffect(() => {
    usersApi.me().then(setUser).catch(() => router.replace('/login'))
    workspacesApi
      .list()
      .then((ws) => {
        setWorkspaces(ws)
        if (!workspace && ws[0]) setWorkspace(ws[0] ?? null)
      })
      .catch(() => {})
    notificationsApi.unread().then(setUnread).catch(() => {})
  }, [router, setUser, setWorkspace, setWorkspaces, setUnread, workspace])

  useWebSocket()

  const notifQuery = useQuery({ queryKey: ['notifications'], queryFn: notificationsApi.list })

  const markRead = async (id: string) => {
    await notificationsApi.read(id)
    notificationsApi.unread().then(setUnread).catch(() => {})
    notifQuery.refetch()
  }

  const signOut = async () => {
    await authApi.signout()
    localStorage.removeItem('ws-token')
    router.replace('/login')
  }

  return (
    <AppShell
      header={{ height: 56 }}
      navbar={{ width: 240, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Text fw={700} size="lg">
              WeXpense
            </Text>
          </Group>
          <Group gap="xs">
            <Tooltip label="Quick add (⌘K)">
              <ActionIcon variant="light" onClick={() => useQuickAdd.getState().setOpen(true)}>
                <IconPlus size={18} />
              </ActionIcon>
            </Tooltip>
            <Menu position="bottom-end" width={320}>
              <Menu.Target>
                <Indicator inline size={10} offset={4} color="red" disabled={unread === 0}>
                  <ActionIcon variant="light">
                    <IconBell size={18} />
                  </ActionIcon>
                </Indicator>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>Notifications</Menu.Label>
                <ScrollArea mah={300}>
                  {notifQuery.data?.length ? (
                    notifQuery.data.map((n) => (
                      <Menu.Item key={n._id} onClick={() => markRead(n._id)} fz="sm" fw={n.read ? 400 : 600}>
                        {n.title}
                        <Text size="xs" c="dimmed" fw={400}>
                          {n.body}
                        </Text>
                        <Text size="xs" c="dimmed" fw={400}>
                          {fmtDate(n.createdAt)}
                        </Text>
                      </Menu.Item>
                    ))
                  ) : (
                    <Text px="md" py="sm" size="sm" c="dimmed">
                      No notifications
                    </Text>
                  )}
                </ScrollArea>
              </Menu.Dropdown>
            </Menu>
            <ActionIcon
              variant="light"
              onClick={() => setColorScheme(scheme === 'light' ? 'dark' : 'light')}
              aria-label="Toggle theme"
            >
              {scheme === 'light' ? <IconMoon size={18} /> : <IconSun size={18} />}
            </ActionIcon>
            <Menu position="bottom-end">
              <Menu.Target>
                <UnstyledButton>
                  <Group gap={8}>
                    <Avatar size="sm" radius="xl" color="indigo" name={user?.name ?? ''} />
                    <Text size="sm" visibleFrom="sm">
                      {user?.name ?? ''}
                    </Text>
                  </Group>
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item leftSection={<IconSettings size={16} />} component={Link} href="/settings">
                  Settings
                </Menu.Item>
                <Menu.Item leftSection={<IconCreditCard size={16} />} component={Link} href="/settings/billing">
                  Billing
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item color="red" leftSection={<IconLogout size={16} />} onClick={signOut}>
                  Sign out
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="xs">
        <Group px="xs" mb="xs">
          <Menu>
            <Menu.Target>
              <UnstyledButton w="100%">
                <Group justify="space-between" w="100%">
                  <Group gap="xs">
                    <Avatar size="sm" radius="sm" color="indigo">
                      {(workspace?.name ?? 'W').slice(0, 1)}
                    </Avatar>
                    <Text size="sm" fw={600} lineClamp={1}>
                      {workspace?.name ?? 'Select workspace'}
                    </Text>
                  </Group>
                  <Text size="xs" c="dimmed">
                    ▾
                  </Text>
                </Group>
              </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown>
              {workspaces.map((w) => (
                <Menu.Item
                  key={w._id}
                  onClick={() => setWorkspace(w)}
                  rightSection={w._id === workspace?._id ? <Badge size="xs">active</Badge> : null}
                >
                  {w.name}
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>
        </Group>
        {NAV.map(({ href, label, icon: Icon }) => (
          <NavLink
            key={href}
            component={Link}
            href={href}
            label={label}
            leftSection={<Icon size={18} />}
            active={pathname === href || pathname.startsWith(href + '/')}
            onClick={() => opened && toggle()}
          />
        ))}
      </AppShell.Navbar>

      <AppShell.Main>
        <Spotlight
          shortcut={['mod + K']}
          actions={[
            {
              id: 'quick-add',
              label: 'Add transaction',
              leftSection: <IconPlus size={18} />,
              keywords: 'add expense income transfer quick',
              onSelect: () => useQuickAdd.getState().setOpen(true)
            },
            ...NAV.map(({ href, label, icon: Icon }) => ({
              id: href,
              label,
              leftSection: <Icon size={18} />,
              onSelect: () => {
                router.push(href)
                spotlight.close()
              }
            }))
          ]}
          limit={8}
          nothingFound="Nothing found"
          searchProps={{ placeholder: 'Search or press ⌘K…' }}
        />
        <QuickAdd />
        {children}
      </AppShell.Main>
    </AppShell>
  )
}