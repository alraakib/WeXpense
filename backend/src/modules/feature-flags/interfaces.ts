export interface FeatureFlag {
  _id: string
  key: string
  workspaceId: string
  enabled: boolean
  updatedAt: Date
}
