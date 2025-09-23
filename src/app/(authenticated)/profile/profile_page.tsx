"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getClientSupabase } from '@/lib/supabase-browser';
import { useToast } from '@/hooks/useToast';
import { profileApi } from '@/lib/profile_api';
import type { Session } from '@supabase/supabase-js';
import type {
  UserProfile,
  ConnectedAccount,
  NotificationSettings,
  UserActivity
} from '@/types/profile';

import UnifiedNavbar from '@/components/navigation/UnifiedNavbar';
import ProfileDetailsCard from '@/components/profile/ProfileDetailsCard';
import SubscriptionCard from '@/components/profile/SubscriptionCard';
import ConnectedAccounts from '@/components/profile/ConnectedAccounts';
import SecurityCard from '@/components/profile/SecurityCard';
import NotificationsCard from '@/components/profile/NotificationsCard';
import ActivityOverview from '@/components/profile/ActivityOverview';
import DangerZone from '@/components/profile/DangerZone';
import PasswordChangeModal from '@/components/profile/PasswordChangeModal';

const ProfileSkeleton = () => (
  <div className="animate-pulse space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

type InitialProfileData = {
  profile: UserProfile;
  connectedAccounts: ConnectedAccount[];
  notificationSettings: NotificationSettings;
  userActivity: UserActivity;
};

type ClientProfileProps = {
  session: Session;
  initialData?: InitialProfileData;
};

export default function ProfilePage({ session, initialData }: ClientProfileProps) {
  const router = useRouter();
  const supabase = getClientSupabase();
  const { addToast } = useToast();

  const defaultProfile: UserProfile = {
    id: session.user.id,
    email: session.user.email || undefined,
    full_name: session.user.email ? session.user.email.split('@')[0] : undefined,
    subscription_status: 'free',
    role: 'user'
  };
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(initialData?.profile ?? defaultProfile);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>(initialData?.connectedAccounts ?? []);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(initialData?.notificationSettings ?? { newsletter_enabled: true });
  const [userActivity, setUserActivity] = useState<UserActivity | null>(initialData?.userActivity ?? { prompts_created: 0, prompts_used: 0 });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Load or refresh profile data on mount
  useEffect(() => {
    let mounted = true;

    const loadProfileData = async () => {
      try {
        const user = session.user;

        // Fetch all profile data using the unified API
        const response = await profileApi.getAllProfileData(user.id);
        if (response.error || !response.data) {
          throw response.error || new Error('Failed to load profile data');
        }

        if (!mounted) return;

        const { profile, connectedAccounts, notificationSettings, userActivity } = response.data;
        setProfile(profile);
        setConnectedAccounts(connectedAccounts);
        setNotificationSettings(notificationSettings);
        setUserActivity(userActivity);

      } catch (err) {
        console.error('Error loading profile data:', err);
        if (mounted) {
          // Fallback only if no initial server data
          const user = session.user;
          setProfile({
            id: user.id,
            email: user.email || undefined,
            full_name: user.email ? user.email.split('@')[0] : undefined,
            subscription_status: 'free',
            role: 'user'
          });
          setConnectedAccounts([]);
          setNotificationSettings({ newsletter_enabled: true });
          setUserActivity({ prompts_created: 0, prompts_used: 0 });
          addToast({ type: 'info', title: 'Limited profile', message: 'Showing basic profile while data loads or is unavailable.' });
        }
      } finally {
        // keep rendering without blocking UI
      }
    };

    // Refresh in background without blocking UI
    void loadProfileData();
    return () => { mounted = false; };
  }, [addToast, router, supabase, session.user.id]);

  // Profile update handler
  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    const response = await profileApi.updateProfile(profile.id, updates);
    if (!response.error && response.data) {
      setProfile(response.data);
      addToast({ type: 'success', title: 'Success', message: 'Profile updated successfully.' });
    } else {
      addToast({ type: 'error', title: 'Update Failed', message: response.error?.message || 'Failed to update profile.' });
    }
  };

  // Avatar change handler with file picker
  const handleAvatarChange = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      // Optimistic UI update
      const tempUrl = URL.createObjectURL(file);
      setProfile(prev => prev ? { ...prev, avatar_url: tempUrl } : prev);
      
      const uploadResponse = await profileApi.uploadAvatar(profile.id, file);
      if (uploadResponse.error || !uploadResponse.data) {
        // Revert optimistic update on error
        setProfile(prev => prev ? { ...prev, avatar_url: profile.avatar_url } : prev);
        addToast({ type: 'error', title: 'Upload Failed', message: uploadResponse.error?.message || 'Failed to upload image' });
        URL.revokeObjectURL(tempUrl);
        return;
      }
      
      const updateResponse = await profileApi.updateProfile(profile.id, { avatar_url: uploadResponse.data });
      if (!updateResponse.error && updateResponse.data) {
        setProfile(updateResponse.data);
        addToast({ type: 'success', title: 'Success', message: 'Avatar updated successfully.' });
      }
      URL.revokeObjectURL(tempUrl);
    };
    input.click();
  };

  // Avatar removal handler
  const handleAvatarRemove = async () => {
    const removeResponse = await profileApi.removeAvatar(profile.id);
    if (!removeResponse.error) {
      const updateResponse = await profileApi.updateProfile(profile.id, { avatar_url: undefined });
      if (!updateResponse.error && updateResponse.data) {
        setProfile(updateResponse.data);
        addToast({ type: 'success', title: 'Success', message: 'Avatar removed successfully.' });
      }
    } else {
      addToast({ type: 'error', title: 'Remove Failed', message: removeResponse.error?.message || 'Failed to remove avatar' });
    }
  };

  // Google account connection toggle
  const handleGoogleToggle = async (connected: boolean) => {
    const response = await profileApi.updateConnectedAccount(profile.id, 'google', connected);
    if (!response.error && response.data) {
      setConnectedAccounts(prev => {
        const existing = prev.find(acc => acc.provider === 'google');
        if (existing) return prev.map(acc => acc.provider === 'google' ? response.data! : acc);
        return [...prev, response.data!];
      });
      addToast({ 
        type: 'success', 
        title: connected ? 'Google Connected' : 'Google Disconnected', 
        message: `Your Google account has been ${connected ? 'connected' : 'disconnected'} successfully.`
      });
    } else {
      addToast({ type: 'error', title: 'Connection Failed', message: response.error?.message || 'Failed to update connection' });
    }
  };

  // Password change modal handlers
  const handlePasswordChange = () => setShowPasswordModal(true);

  const handlePasswordConfirm = async (newPassword: string) => {
    setIsUpdatingPassword(true);
    const response = await profileApi.updatePassword(newPassword);
    if (!response.error) {
      addToast({ type: 'success', title: 'Password Updated', message: 'Your password has been updated successfully' });
      setShowPasswordModal(false);
    } else {
      addToast({ type: 'error', title: 'Update Failed', message: response.error?.message || 'Failed to update password' });
    }
    setIsUpdatingPassword(false);
  };

  // Two-factor authentication toggle (stub)
  const handleTwoFactorToggle = () => {
    addToast({ type: 'info', title: 'Coming Soon', message: 'Two-factor authentication will be available soon' });
  };

  // Newsletter preferences toggle
  const handleNewsletterToggle = async (enabled: boolean) => {
    if (!notificationSettings) return;
    
    const response = await profileApi.updateNotificationSettings(profile.id, { newsletter_enabled: enabled });
    if (!response.error && response.data) {
      setNotificationSettings(response.data);
      addToast({ type: 'success', title: 'Settings Updated', message: 'Your notification preferences have been updated successfully' });
    } else {
      addToast({ type: 'error', title: 'Update Failed', message: response.error?.message || 'Failed to update notification preferences.' });
    }
  };

  // Account deletion handler
  const handleDeleteAccount = async () => {
    // Confirmation dialog
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data.'
    );
    if (!confirmed) return;

    const response = await profileApi.deleteAccount(profile.id);
    if (!response.error) {
      addToast({ type: 'success', title: 'Account Deleted', message: 'Your account has been deleted successfully' });
      window.location.href = '/';
    } else {
      addToast({ type: 'error', title: 'Deletion Failed', message: response.error?.message || 'Failed to delete account' });
    }
  };

  // Always render page using available data; cards will update as data loads

  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedNavbar />
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="mt-2 text-gray-600">Manage your account settings and preferences</p>
        </div>

        {/* Profile Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <ProfileDetailsCard
              name={profile.full_name || (profile.email ? profile.email.split('@')[0] : 'User')}
              email={profile.email ?? ''}
              avatarUrl={profile.avatar_url}
              onNameChange={(name) => handleUpdateProfile({ full_name: name })}
              onAvatarChange={handleAvatarChange}
              onAvatarRemove={handleAvatarRemove}
            />

            <SubscriptionCard 
              subscription={profile.subscription_status === 'premium' ? 'Pro' : 'Free'} 
              role={profile.role ?? 'user'} 
            />

            <ConnectedAccounts 
              googleConnected={connectedAccounts.find(acc => acc.provider === 'google')?.connected || false} 
              onGoogleToggle={handleGoogleToggle} 
            />

            <SecurityCard 
              twoFactorEnabled={false} 
              onPasswordChange={handlePasswordChange} 
              onTwoFactorToggle={handleTwoFactorToggle} 
            />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <NotificationsCard 
              newsletterEnabled={notificationSettings?.newsletter_enabled || false} 
              onNewsletterToggle={handleNewsletterToggle} 
            />

            <ActivityOverview 
              promptsCreated={userActivity?.prompts_created || 0} 
              promptsUsed={userActivity?.prompts_used || 0} 
            />

            <DangerZone onDeleteAccount={handleDeleteAccount} />
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      <PasswordChangeModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onConfirm={handlePasswordConfirm}
        isLoading={isUpdatingPassword}
      />
    </div>
  );
}