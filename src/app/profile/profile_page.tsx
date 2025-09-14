"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useToast } from '@/hooks/useToast';
import { profileApi } from '@/lib/profileApi';
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

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { addToast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null);
  const [userActivity, setUserActivity] = useState<UserActivity | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Load all profile data on component mount
  useEffect(() => {
    let mounted = true;

    const loadProfileData = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
          addToast({ type: 'error', title: 'Authentication Error', message: 'Please sign in to view your profile.' });
          router.push('/login');
          return;
        }

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
          addToast({ type: 'error', title: 'Error', message: 'Could not load profile data. Please try again.' });
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadProfileData();
    return () => { mounted = false; };
  }, [addToast, router, supabase]);

  // Profile update handler
  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    if (!profile) return;
    
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
    if (!profile) return;
    
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
    if (!profile) return;
    
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
    if (!profile) return;
    
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
    if (!profile || !notificationSettings) return;
    
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
    if (!profile) return;
    
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

  // Loading state
  if (isLoading || !profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UnifiedNavbar />
        <div className="container mx-auto px-4 py-8">
          <ProfileSkeleton />
        </div>
      </div>
    );
  }

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
              name={profile.full_name || profile.email.split('@')[0]}
              email={profile.email}
              avatarUrl={profile.avatar_url}
              onNameChange={(name) => handleUpdateProfile({ full_name: name })}
              onAvatarChange={handleAvatarChange}
              onAvatarRemove={handleAvatarRemove}
            />

            <SubscriptionCard 
              subscription={profile.subscription_status === 'premium' ? 'Pro' : 'Free'} 
              role={profile.role} 
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