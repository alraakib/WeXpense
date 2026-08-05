import { create } from 'zustand'
import type { UserProfile, UserSettings, WorkspaceWithMeta } from './types'

interface AppState {
  user: UserProfile | null
  settings: UserSettings | null
  workspace: WorkspaceWithMeta | null
  workspaces: WorkspaceWithMeta[]
  unread: number
  setUser: (user: UserProfile | null) => void
  setSettings: (settings: UserSettings | null) => void
  setWorkspace: (ws: WorkspaceWithMeta | null) => void
  setWorkspaces: (ws: WorkspaceWithMeta[]) => void
  setUnread: (n: number) => void
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  settings: null,
  workspace: null,
  workspaces: [],
  unread: 0,
  setUser: (user) => set({ user }),
  setSettings: (settings) => set({ settings }),
  setWorkspace: (workspace) => set({ workspace }),
  setWorkspaces: (workspaces) => set({ workspaces }),
  setUnread: (unread) => set({ unread })
}))

export interface QuickAddDraft {
  open: boolean
  defaultType?: 'income' | 'expense' | 'transfer'
  setOpen: (open: boolean, defaultType?: 'income' | 'expense' | 'transfer') => void
}

export const useQuickAdd = create<QuickAddDraft>((set) => ({
  open: false,
  setOpen: (open, defaultType) => set({ open, defaultType })
}))