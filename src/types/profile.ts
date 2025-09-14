export interface UserProfile {
  id: string
  email?: string
  full_name?: string
  avatar_url?: string
  subscription_status?: 'free' | 'premium' | string
  role?: string
}

export interface ConnectedAccount {
  provider: string
  connected: boolean
  id?: string
}

export interface NotificationSettings {
  newsletter_enabled?: boolean
}

export interface UserActivity {
  prompts_created?: number
  prompts_used?: number
}

export type { UserProfile as Profile }
export type ApiResponse<T> = { data?: T | null; error?: { message?: string } | null }

export interface ProfileData {
  profile: UserProfile
  connectedAccounts: ConnectedAccount[]
  notificationSettings: NotificationSettings
  userActivity: UserActivity
}
