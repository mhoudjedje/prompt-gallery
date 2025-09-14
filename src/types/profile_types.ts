export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  subscription_status: 'free' | 'premium';
  role: 'user' | 'admin';
  avatar_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface ConnectedAccount {
  id: string;
  user_id: string;
  provider: string;
  provider_id: string;
  connected: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationSettings {
  id: string;
  user_id: string;
  newsletter_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserActivity {
  id: string;
  user_id: string;
  prompts_created: number;
  prompts_used: number;
  created_at: string;
  updated_at: string;
}

export interface ProfileData {
  profile: UserProfile;
  connectedAccounts: ConnectedAccount[];
  notificationSettings: NotificationSettings;
  userActivity: UserActivity;
}

export type UserPlan = 'Free' | 'Pro';

// API Response types
export interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
}

// Component prop types
export interface ProfileDetailsCardProps {
  name: string;
  email: string;
  avatarUrl?: string;
  onNameChange: (name: string) => Promise<void>;
  onAvatarChange: () => Promise<void>;
  onAvatarRemove: () => Promise<void>;
}

export interface SubscriptionCardProps {
  subscription: UserPlan;
  role: 'user' | 'admin';
}

export interface ConnectedAccountsProps {
  googleConnected: boolean;
  onGoogleToggle: (connected: boolean) => Promise<void>;
}

export interface SecurityCardProps {
  twoFactorEnabled: boolean;
  onPasswordChange: () => void;
  onTwoFactorToggle: () => void;
}

export interface NotificationsCardProps {
  newsletterEnabled: boolean;
  onNewsletterToggle: (enabled: boolean) => Promise<void>;
}

export interface ActivityOverviewProps {
  promptsCreated: number;
  promptsUsed: number;
}

export interface DangerZoneProps {
  onDeleteAccount: () => Promise<void>;
}