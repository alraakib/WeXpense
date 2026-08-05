'use client'

import {
  Avatar,
  Badge,
  Button,
  Card,
  Group,
  Modal,
  Paper,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Tooltip
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { IconUsers } from '@tabler/icons-react'
import { useState } from 'react'
import { workspacesApi } from '@/lib/endpoints'
import { useAppStore } from '@/lib/store'
import { fmtDate } from '@/lib/money'
import { EmptyState } from '@/components/shared/UI'

const ROLE_LABEL: Record<string, string> = {
  owner: 'Owner',
  admin: 'Admin',
  contributor: 'Contributor',
  viewer: 'Viewer'
}

export default function WorkspacePage() {
  const workspace = useAppStore((s) => s.workspace)
  const wsId = workspace?._id
  const canManage = workspace?.role === 'owner' || workspace?.role === 'admin'
  const qc = useQueryClient()

  const { data: members } = useQuery({
    queryKey: ['members', wsId],
    queryFn: () => workspacesApi.members(wsId!),
    enabled: !!wsId
  })

  const [inviteOpen, { open: openInvite, close: closeInvite }] = useDisclosure(false)
  const [linkOpen, { open: openLink, close: closeLink }] = useDisclosure(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<string>('contributor')
  const [link, setLink] = useState('')
  const [saving, setSaving] = useState(false)

  const invite = async () => {
    if (!wsId) return
    setSaving(true)
    try {
      await workspacesApi.inviteEmail(wsId, { email, role })
      notifications.show({ color: 'green', message: `Invite sent to ${email}` })
      setEmail('')
      closeInvite()
    } catch (e) {
      notifications.show({ color: 'red', message: (e as Error).message })
    } finally {
      setSaving(false)
    }
  }

  const createLink = async () => {
    if (!wsId) return
    setSaving(true)
    try {
      const res = await workspacesApi.inviteLink(wsId, { role, expiresInDays: 7 })
      setLink(res.url ?? `${window.location.origin}/invite?ws=${wsId}&token=${res.token}`)
      openLink()
    } catch (e) {
      notifications.show({ color: 'red', message: (e as Error).message })
    } finally {
      setSaving(false)
    }
  }

  const approve = async (userId: string) => {
    if (!wsId) return
    await workspacesApi.approve(wsId, userId)
    qc.invalidateQueries({ queryKey: ['members'] })
  }

  const reject = async (userId: string) => {
    if (!wsId) return
    await workspacesApi.reject(wsId, userId)
    qc.invalidateQueries({ queryKey: ['members'] })
  }

  const remove = async (userId: string) => {
    if (!wsId) return
    await workspacesApi.removeMember(wsId, userId)
    qc.invalidateQueries({ queryKey: ['members'] })
  }

  const pending = (members ?? []).filter((m) => m.status === 'pending' || m.status === 'invited')

  return (
    <Stack>
      <Group justify="space-between">
        <Text fw={700} size="xl">
          Workspace
        </Text>
        {canManage && (
          <Group>
            <Button variant="light" onClick={createLink}>
              Invite link
            </Button>
            <Button onClick={openInvite}>Invite by email</Button>
          </Group>
        )}
      </Group>

      <Card withBorder shadow="sm" radius="md" p="lg">
        <Group justify="space-between">
          <Stack gap={0}>
            <Text fw={600}>{workspace?.name}</Text>
            <Text size="sm" c="dimmed">
              {workspace?.type} workspace · {workspace?.baseCurrency}
            </Text>
          </Stack>
          <Badge variant="light">{ROLE_LABEL[workspace?.role ?? ''] ?? workspace?.role}</Badge>
        </Group>
      </Card>

      {!!pending.length && (
        <Paper withBorder p="md" radius="md">
          <Text fw={600} mb="xs">
            Pending approvals ({pending.length})
          </Text>
          <Stack>
            {pending.map((m) => (
              <Group key={m._id} justify="space-between">
                <Group>
                  <Avatar size="sm" color="primary" name={m.user?.name ?? '?'} />
                  <div>
                    <Text size="sm">{m.user?.name ?? m.user?.email ?? 'Invited member'}</Text>
                    <Text size="xs" c="dimmed">
                      {m.user?.email}
                    </Text>
                  </div>
                </Group>
                {canManage && (
                  <Group>
                    <Button size="compact-sm" color="success" onClick={() => approve(m.userId)}>
                      Approve
                    </Button>
                    <Button size="compact-sm" variant="light" color="error" onClick={() => reject(m.userId)}>
                      Reject
                    </Button>
                  </Group>
                )}
              </Group>
            ))}
          </Stack>
        </Paper>
      )}

      {members?.length ? (
        <Paper withBorder radius="md">
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Member</Table.Th>
                <Table.Th>Role</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Joined</Table.Th>
                {canManage && <Table.Th />}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {members
                .filter((m) => m.status === 'active')
                .map((m) => (
                  <Table.Tr key={m._id}>
                    <Table.Td>
                      <Group>
                        <Avatar size="sm" color="primary" name={m.user?.name ?? '?'} />
                        <div>
                          <Text size="sm">{m.user?.name ?? m.user?.email}</Text>
                          <Text size="xs" c="dimmed">
                            {m.user?.email}
                          </Text>
                        </div>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="light">{ROLE_LABEL[m.role] ?? m.role}</Badge>
                    </Table.Td>
                    <Table.Td>
                      <Badge size="xs" color="success">
                        active
                      </Badge>
                    </Table.Td>
                    <Table.Td>{fmtDate(m.joinedAt)}</Table.Td>
                    {canManage && m.role !== 'owner' && (
                      <Table.Td ta="right">
                        <Tooltip label="Remove">
                          <Button size="compact-xs" variant="subtle" color="error" onClick={() => remove(m.userId)}>
                            Remove
                          </Button>
                        </Tooltip>
                      </Table.Td>
                    )}
                  </Table.Tr>
                ))}
            </Table.Tbody>
          </Table>
        </Paper>
      ) : (
        <EmptyState icon={<IconUsers size={40} />} title="No active members" hint="Invite people to collaborate." />
      )}

      <Modal opened={inviteOpen} onClose={closeInvite} title="Invite by email" centered>
        <Stack>
          <TextInput label="Email" placeholder="teammate@example.com" value={email} onChange={(e) => setEmail(e.currentTarget.value)} />
          <Select
            label="Role"
            data={[
              { value: 'admin', label: 'Admin — full control' },
              { value: 'contributor', label: 'Contributor — can edit own entries' },
              { value: 'viewer', label: 'Viewer — read only' }
            ]}
            value={role}
            onChange={(v) => setRole(v ?? 'contributor')}
          />
          <Button onClick={invite} loading={saving}>
            Send invite
          </Button>
        </Stack>
      </Modal>

      <Modal opened={linkOpen} onClose={closeLink} title="Shareable invite link" centered>
        <Stack>
          <Text size="sm" c="dimmed">
            Anyone with this link can request to join. Admins approve the request.
          </Text>
          <TextInput value={link} readOnly />
          <Button onClick={() => navigator.clipboard?.writeText(link)}>Copy link</Button>
        </Stack>
      </Modal>
    </Stack>
  )
}