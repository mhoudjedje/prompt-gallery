'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { profileApi, UserProfile, ConnectedAccount, NotificationSettings, UserActivity } from '@/lib/supabase/profile';
import { useToast } from '@/hooks/useToast';
import ProfileDetailsCard from '@/components/profile/ProfileDetailsCard';
import SubscriptionCard from '@/components/profile/SubscriptionCard';
import ConnectedAccounts from '@/components/profile/ConnectedAccounts';
import SecurityCard from '@/components/profile/SecurityCard';
import NotificationsCard from '@/components/profile/NotificationsCard';
import ActivityOverview from '@/components/profile/ActivityOverview';
import DangerZone from '@/components/profile/DangerZone';
import PasswordChangeModal from '@/components/profile/PasswordChangeModal';

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null);
  const [userActivity, setUserActivity] = useState<UserActivity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const { addToast, ToastContainer } = useToast();

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          console.error('Error fetching user:', error);
          addToast({
            type: 'error',
            title: 'Authentication Error',
            message: 'Please log in to view your profile'
          });
          setIsLoading(false);
          return;
        }
        
        if (!user) {
          addToast({
            type: 'error',
            title: 'Not Authenticated',
            message: 'Please log in to view your profile'
          });
          setIsLoading(false);
          return;
        }

        setUser(user);

        // Load all profile data in parallel
        const [
          profileData,
          connectedAccountsData,
          notificationSettingsData,
          userActivityData
        ] = await Promise.all([
          profileApi.getProfile(user.id),
          profileApi.getConnectedAccounts(user.id),
          profileApi.getNotificationSettings(user.id),
          profileApi.getUserActivity(user.id)
        ]);

        setProfile(profileData);
        setConnectedAccounts(connectedAccountsData);
        setNotificationSettings(notificationSettingsData);
        setUserActivity(userActivityData);

      } catch (error) {
        console.error('Error loading profile data:', error);
        addToast({
          type: 'error',
          title: 'Error Loading Profile',
          message: 'Failed to load your profile data. Please try again.'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, [addToast]);

  const handleNameChange = async (newName: string) => {
    if (!user || !profile) return;

    try {
      const success = await profileApi.updateProfile(user.id, { full_name: newName });
      if (success) {
        setProfile(prev => prev ? { ...prev, full_name: newName } : null);
        addToast({
          type: 'success',
          title: 'Profile Updated',
          message: 'Your name has been updated successfully'
        });
      } else {
        addToast({
          type: 'error',
          title: 'Update Failed',
          message: 'Failed to update your name. Please try again.'
        });
      }
    } catch (error) {
      console.error('Error updating name:', error);
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update your name. Please try again.'
      });
    }
  };

  const handleAvatarChange = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !user) return;

      try {
        const avatarUrl = await profileApi.uploadAvatar(user.id, file);
        if (avatarUrl) {
          const success = await profileApi.updateProfile(user.id, { avatar_url: avatarUrl });
          if (success) {
            setProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : null);
            addToast({
              type: 'success',
              title: 'Avatar Updated',
              message: 'Your profile picture has been updated successfully'
            });
          } else {
            addToast({
              type: 'error',
              title: 'Upload Failed',
              message: 'Failed to update your profile picture. Please try again.'
            });
          }
        } else {
          addToast({
            type: 'error',
            title: 'Upload Failed',
            message: 'Failed to upload your profile picture. Please try again.'
          });
        }
      } catch (error) {
        console.error('Error uploading avatar:', error);
        addToast({
          type: 'error',
          title: 'Upload Failed',
          message: 'Failed to upload your profile picture. Please try again.'
        });
      }
    };
    input.click();
  };

  const handleAvatarRemove = async () => {
    if (!user || !profile?.avatar_url) return;

    try {
      const success = await profileApi.updateProfile(user.id, { avatar_url: undefined });
      if (success) {
        setProfile(prev => prev ? { ...prev, avatar_url: undefined } : null);
        addToast({
          type: 'success',
          title: 'Avatar Removed',
          message: 'Your profile picture has been removed successfully'
        });
      } else {
        addToast({
          type: 'error',
          title: 'Remove Failed',
          message: 'Failed to remove your profile picture. Please try again.'
        });
      }
    } catch (error) {
      console.error('Error removing avatar:', error);
      addToast({
        type: 'error',
        title: 'Remove Failed',
        message: 'Failed to remove your profile picture. Please try again.'
      });
    }
  };

  const handleGoogleToggle = async (connected: boolean) => {
    if (!user) return;

    try {
      const success = await profileApi.updateConnectedAccount(user.id, 'google', connected);
      if (success) {
        setConnectedAccounts(prev => {
          const existing = prev.find(acc => acc.provider === 'google');
          if (existing) {
            return prev.map(acc => 
              acc.provider === 'google' ? { ...acc, connected } : acc
            );
          } else {
            return [...prev, {
              id: '',
              user_id: user.id,
              provider: 'google',
              provider_id: '',
              connected,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }];
          }
        });
        addToast({
          type: 'success',
          title: connected ? 'Google Connected' : 'Google Disconnected',
          message: `Your Google account has been ${connected ? 'connected' : 'disconnected'} successfully`
        });
      } else {
        addToast({
          type: 'error',
          title: 'Connection Failed',
          message: `Failed to ${connected ? 'connect' : 'disconnect'} your Google account. Please try again.`
        });
      }
    } catch (error) {
      console.error('Error toggling Google connection:', error);
      addToast({
        type: 'error',
        title: 'Connection Failed',
        message: `Failed to ${connected ? 'connect' : 'disconnect'} your Google account. Please try again.`
      });
    }
  };

  const handlePasswordChange = () => {
    setShowPasswordModal(true);
  };

  const handlePasswordConfirm = async (newPassword: string) => {
    if (!user) return;

    setIsUpdatingPassword(true);
    try {
      const success = await profileApi.updatePassword(newPassword);
      if (success) {
        addToast({
          type: 'success',
          title: 'Password Updated',
          message: 'Your password has been updated successfully'
        });
        setShowPasswordModal(false);
      } else {
        addToast({
          type: 'error',
          title: 'Update Failed',
          message: 'Failed to update your password. Please try again.'
        });
      }
    } catch (error) {
      console.error('Error updating password:', error);
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update your password. Please try again.'
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleTwoFactorToggle = async () => {
    // Stub for now - 2FA implementation would go here
    addToast({
      type: 'info',
      title: 'Coming Soon',
      message: 'Two-factor authentication will be available soon'
    });
  };

  const handleNewsletterToggle = async (enabled: boolean) => {
    if (!user) return;

    try {
      const success = await profileApi.updateNotificationSettings(user.id, { newsletter_enabled: enabled });
      if (success) {
        setNotificationSettings(prev => prev ? { ...prev, newsletter_enabled: enabled } : null);
        addToast({
          type: 'success',
          title: 'Settings Updated',
          message: 'Your notification preferences have been updated successfully'
        });
      } else {
        addToast({
          type: 'error',
          title: 'Update Failed',
          message: 'Failed to update your notification preferences. Please try again.'
        });
      }
    } catch (error) {
      console.error('Error updating notification settings:', error);
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update your notification preferences. Please try again.'
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    try {
      const success = await profileApi.deleteAccount(user.id);
      if (success) {
        addToast({
          type: 'success',
          title: 'Account Deleted',
          message: 'Your account has been deleted successfully'
        });
        // Redirect to home page or login
        window.location.href = '/';
      } else {
        addToast({
          type: 'error',
          title: 'Deletion Failed',
          message: 'Failed to delete your account. Please try again.'
        });
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      addToast({
        type: 'error',
        title: 'Deletion Failed',
        message: 'Failed to delete your account. Please try again.'
      });
    }
  };

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="mt-2 text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Profile Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <ProfileDetailsCard
              name={profile.full_name || profile.email?.split('@')[0] || 'User'}
              email={profile.email}
              avatarUrl={profile.avatar_url}
              onNameChange={handleNameChange}
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
              twoFactorEnabled={false} // Stub for now
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

            <DangerZone
              onDeleteAccount={handleDeleteAccount}
            />
          </div>
        </div>
      </div>
      <ToastContainer />
      <PasswordChangeModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onConfirm={handlePasswordConfirm}
        isLoading={isUpdatingPassword}
      />
    </div>
  );
}
