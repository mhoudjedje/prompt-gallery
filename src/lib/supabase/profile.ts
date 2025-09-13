import { supabase } from './supabase';

// Types for profile data
export interface UserProfile {
  id: string;
  email: string;
  subscription_status: 'free' | 'premium';
  role: 'user' | 'admin';
  full_name?: string;
  avatar_url?: string;
  created_at: string;
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

// Profile API functions
export const profileApi = {
  // Fetch user profile
  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  },

  // Update profile
  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', userId);

      if (error) {
        console.error('Error updating profile:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  },

  // Upload avatar to Supabase Storage
  async uploadAvatar(userId: string, file: File): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading avatar:', uploadError);
        return null;
      }

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return null;
    }
  },

  // Delete avatar from Supabase Storage
  async deleteAvatar(avatarUrl: string): Promise<boolean> {
    try {
      const fileName = avatarUrl.split('/').pop();
      if (!fileName) return false;

      const { error } = await supabase.storage
        .from('avatars')
        .remove([`avatars/${fileName}`]);

      if (error) {
        console.error('Error deleting avatar:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting avatar:', error);
      return false;
    }
  },

  // Get connected accounts
  async getConnectedAccounts(userId: string): Promise<ConnectedAccount[]> {
    try {
      const { data, error } = await supabase
        .from('connected_accounts')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching connected accounts:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching connected accounts:', error);
      return [];
    }
  },

  // Update connected account status
  async updateConnectedAccount(
    userId: string, 
    provider: string, 
    connected: boolean
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('connected_accounts')
        .upsert({
          user_id: userId,
          provider,
          connected,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error updating connected account:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating connected account:', error);
      return false;
    }
  },

  // Get notification settings
  async getNotificationSettings(userId: string): Promise<NotificationSettings | null> {
    try {
      const { data, error } = await supabase
        .from('notifications_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching notification settings:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      return null;
    }
  },

  // Update notification settings
  async updateNotificationSettings(
    userId: string, 
    settings: Partial<NotificationSettings>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications_settings')
        .upsert({
          user_id: userId,
          ...settings,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error updating notification settings:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating notification settings:', error);
      return false;
    }
  },

  // Get user activity
  async getUserActivity(userId: string): Promise<UserActivity | null> {
    try {
      const { data, error } = await supabase
        .from('user_activity')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user activity:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user activity:', error);
      return null;
    }
  },

  // Update password
  async updatePassword(newPassword: string): Promise<boolean> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('Error updating password:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating password:', error);
      return false;
    }
  },

  // Delete user account
  async deleteAccount(userId: string): Promise<boolean> {
    try {
      // Delete from user_profiles table (this should cascade to other tables)
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId);

      if (error) {
        console.error('Error deleting account:', error);
        return false;
      }

      // Sign out the user
      await supabase.auth.signOut();

      return true;
    } catch (error) {
      console.error('Error deleting account:', error);
      return false;
    }
  }
};
