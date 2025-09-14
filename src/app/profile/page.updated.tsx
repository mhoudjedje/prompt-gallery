'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useToast } from '@/hooks/useToast';
import { profileApi } from '@/lib/supabase/profile.new';
import type { 
  UserProfile, 
  ConnectedAccount, 
  NotificationSettings, 
  UserActivity,
  SupabaseResponse 
} from '@/lib/supabase/profile.new';
import ProfileDetailsCard from '@/components/profile/ProfileDetailsCard';
import SubscriptionCard from '@/components/profile/SubscriptionCard';
import ConnectedAccounts from '@/components/profile/ConnectedAccounts';
import SecurityCard from '@/components/profile/SecurityCard';
import NotificationsCard from '@/components/profile/NotificationsCard';
import ActivityOverview from '@/components/profile/ActivityOverview';
import DangerZone from '@/components/profile/DangerZone';

type UserPlan = 'Free' | 'Pro';

// Type guards
function isUserProfile(value: unknown): value is UserProfile {
  if (!value || typeof value !== 'object') return false;
  const profile = value as UserProfile;
  return (
    typeof profile.id === 'string' &&
    typeof profile.email === 'string' &&
    ['free', 'premium'].includes(profile.subscription_status) &&
    ['user', 'admin'].includes(profile.role) &&
    typeof profile.created_at === 'string'
  );
}

function isConnectedAccount(value: unknown): value is ConnectedAccount {
  if (!value || typeof value !== 'object') return false;
  const account = value as ConnectedAccount;
  return (
    typeof account.id === 'string' &&
    typeof account.user_id === 'string' &&
    typeof account.provider === 'string' &&
    typeof account.provider_id === 'string' &&
    typeof account.connected === 'boolean' &&
    typeof account.created_at === 'string' &&
    typeof account.updated_at === 'string'
  );
}

function isNotificationSettings(value: unknown): value is NotificationSettings {
  if (!value || typeof value !== 'object') return false;
  const settings = value as NotificationSettings;
  return (
    typeof settings.id === 'string' &&
    typeof settings.user_id === 'string' &&
    typeof settings.newsletter_enabled === 'boolean' &&
    typeof settings.created_at === 'string' &&
    typeof settings.updated_at === 'string'
  );
}

function isUserActivity(value: unknown): value is UserActivity {
  if (!value || typeof value !== 'object') return false;
  const activity = value as UserActivity;
  return (
    typeof activity.id === 'string' &&
    typeof activity.user_id === 'string' &&
    typeof activity.prompts_created === 'number' &&
    typeof activity.prompts_used === 'number' &&
    typeof activity.created_at === 'string' &&
    typeof activity.updated_at === 'string'
  );
}

const ProfilePage = () => {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { addToast } = useToast();

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [plan, setPlan] = useState<UserPlan>('Free');
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null);
  const [userActivity, setUserActivity] = useState<UserActivity | null>(null);

  // Load user data on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          console.error('Error fetching user:', error?.message);
          addToast({
            type: 'error',
            title: 'Authentication Error',
            message: 'Please sign in to view your profile.'
          });
          router.push('/login');
          return;
        }

        const userId = user.id;

        // Fetch all profile data in parallel
        const responses = await Promise.all([
          profileApi.getProfile(userId),
          profileApi.getConnectedAccounts(userId),
          profileApi.getNotificationSettings(userId),
          profileApi.getUserActivity(userId)
        ]);

        // Handle all responses
        const [profileRes, accountsRes, settingsRes, activityRes] = responses;

        // Profile data
        if (profileRes.error) throw profileRes.error;
        if (!profileRes.data || !isUserProfile(profileRes.data)) {
          throw new Error('Invalid profile data structure');
        }
        const profileData = profileRes.data;

        // Connected accounts
        if (accountsRes.error) throw accountsRes.error;
        if (!accountsRes.data) throw new Error('Failed to load connected accounts');
        const accountsData = accountsRes.data;
        if (!accountsData.every(isConnectedAccount)) {
          throw new Error('Invalid connected accounts data structure');
        }

        // Notification settings
        if (settingsRes.error) throw settingsRes.error;
        if (!settingsRes.data) throw new Error('Failed to load notification settings');
        const settingsData = settingsRes.data;
        if (!isNotificationSettings(settingsData)) {
          throw new Error('Invalid notification settings structure');
        }

        // User activity
        if (activityRes.error) throw activityRes.error;
        if (!activityRes.data) throw new Error('Failed to load user activity');
        const activityData = activityRes.data;
        if (!isUserActivity(activityData)) {
          throw new Error('Invalid user activity structure');
        }

        // Update state with validated data
        setProfile(profileData);
        setPlan(profileData.subscription_status === 'premium' ? 'Pro' : 'Free');
        setConnectedAccounts(accountsData);
        setNotificationSettings(settingsData);
        setUserActivity(activityData);

      } catch (error) {
        console.error('Error loading profile data:', error);
        addToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to load profile data. Please try again.'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [router, supabase, addToast]);

  // Handlers
  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!profile?.id) return;

      const response = await profileApi.updateProfile(profile.id, updates);
      if (response.error) throw response.error;
      if (!response.data) throw new Error('Failed to update profile');

      setProfile(response.data);
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Profile updated successfully.'
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to update profile. Please try again.'
      });
    }
  };

  const handleAvatarChange = async () => {
    // TODO: Implement avatar change logic
  };

  const handleAvatarRemove = async () => {
    // TODO: Implement avatar removal logic
  };

  const handlePasswordChange = async (newPassword: string) => {
    try {
      const response = await profileApi.updatePassword(newPassword);
      if (response.error) throw response.error;

      addToast({
        type: 'success',
        title: 'Success',
        message: 'Password updated successfully.'
      });
    } catch (error) {
      console.error('Error updating password:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to update password. Please try again.'
      });
    }
  };

  const handleNotificationUpdate = async (updates: Partial<NotificationSettings>) => {
    try {
      if (!profile?.id) return;

      const response = await profileApi.updateNotificationSettings(profile.id, updates);
      if (response.error) throw response.error;
      if (!response.data) throw new Error('Failed to update notification settings');

      setNotificationSettings(response.data);
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Notification settings updated successfully.'
      });
    } catch (error) {
      console.error('Error updating notification settings:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to update notification settings. Please try again.'
      });
    }
  };

  const handleConnectAccount = async (provider: string) => {
    try {
      if (!profile?.id) return;

      const response = await profileApi.updateConnectedAccount(profile.id, provider, true);
      if (response.error) throw response.error;
      if (!response.data) throw new Error('Failed to connect account');

      setConnectedAccounts(prev => [...prev, response.data]);
      addToast({
        type: 'success',
        title: 'Success',
        message: `${provider} account connected successfully.`
      });
    } catch (error) {
      console.error('Error connecting account:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to connect account. Please try again.'
      });
    }
  };

  const handleDisconnectAccount = async (provider: string) => {
    try {
      if (!profile?.id) return;

      const response = await profileApi.updateConnectedAccount(profile.id, provider, false);
      if (response.error) throw response.error;

      setConnectedAccounts(prev => prev.filter(acc => acc.provider !== provider));
      addToast({
        type: 'success',
        title: 'Success',
        message: `${provider} account disconnected successfully.`
      });
    } catch (error) {
      console.error('Error disconnecting account:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to disconnect account. Please try again.'
      });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      if (!profile?.id) return;

      const response = await profileApi.deleteAccount(profile.id);
      if (response.error) throw response.error;

      router.push('/');
      addToast({
        type: 'success',
        title: 'Account Deleted',
        message: 'Your account has been successfully deleted.'
      });
    } catch (error) {
      console.error('Error deleting account:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete account. Please try again.'
      });
    }
  };

  if (isLoading || !profile || !notificationSettings) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <ProfileDetailsCard
            name={profile.full_name || ''}
            email={profile.email}
            avatarUrl={profile.avatar_url}
            onNameChange={(name) => handleUpdateProfile({ full_name: name })}
            onAvatarChange={handleAvatarChange}
            onAvatarRemove={handleAvatarRemove}
          />
          <SecurityCard
            onUpdatePassword={handlePasswordChange}
          />
          <ConnectedAccounts
            items={connectedAccounts}
            onAdd={handleConnectAccount}
            onRemove={handleDisconnectAccount}
          />
        </div>
        <div className="space-y-6">
          <SubscriptionCard
            currentPlan={plan}
          />
          <NotificationsCard
            enabled={notificationSettings.newsletter_enabled}
            onToggle={(enabled) => handleNotificationUpdate({ newsletter_enabled: enabled })}
          />
          <ActivityOverview
            data={userActivity}
          />
          <DangerZone
            onDeleteAccount={handleDeleteAccount}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;