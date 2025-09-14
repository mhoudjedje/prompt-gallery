import { supabase } from '../supabase';

// Supabase response type
export type SupabaseResponse<T> = {
  data: T | null;
  error: Error | null;
};

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
  async getProfile(userId: string): Promise<SupabaseResponse<UserProfile>> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error fetching profile:', error);
      return { data: null, error: error as Error };
    }
  },

  // Update profile
  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<SupabaseResponse<UserProfile>> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { data: null, error: error as Error };
    }
  },

  // Upload avatar to Supabase Storage
  async uploadAvatar(userId: string, file: File): Promise<SupabaseResponse<{ url: string }>> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading avatar:', uploadError);
        return { data: null, error: uploadError };
      }

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return { data: { url: data.publicUrl }, error: null };
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return { data: null, error: error as Error };
    }
  },

  // Delete avatar from Supabase Storage
  async deleteAvatar(avatarUrl: string): Promise<SupabaseResponse<void>> {
    try {
      const fileName = avatarUrl.split('/').pop();
      if (!fileName) {
        return { data: null, error: new Error('Invalid avatar URL') };
      }

      const { error } = await supabase.storage
        .from('avatars')
        .remove([`avatars/${fileName}`]);

      return { data: error ? null : undefined, error };
    } catch (error) {
      console.error('Error deleting avatar:', error);
      return { data: null, error: error as Error };
    }
  },

  // Get connected accounts
  async getConnectedAccounts(userId: string): Promise<SupabaseResponse<ConnectedAccount[]>> {
    try {
      const { data, error } = await supabase
        .from('connected_accounts')
        .select('*')
        .eq('user_id', userId);

      return { data: data || [], error };
    } catch (error) {
      console.error('Error fetching connected accounts:', error);
      return { data: [], error: error as Error };
    }
  },

  // Update connected account
  async updateConnectedAccount(
    userId: string,
    provider: string,
    connected: boolean
  ): Promise<SupabaseResponse<ConnectedAccount>> {
    try {
      const { data, error } = await supabase
        .from('connected_accounts')
        .upsert({
          user_id: userId,
          provider,
          connected,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error updating connected account:', error);
      return { data: null, error: error as Error };
    }
  },

  // Get notification settings
  async getNotificationSettings(userId: string): Promise<SupabaseResponse<NotificationSettings>> {
    try {
      const { data, error } = await supabase
        .from('notifications_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      return { data: null, error: error as Error };
    }
  },

  // Update notification settings
  async updateNotificationSettings(
    userId: string, 
    settings: Partial<NotificationSettings>
  ): Promise<SupabaseResponse<NotificationSettings>> {
    try {
      const { data, error } = await supabase
        .from('notifications_settings')
        .upsert({
          user_id: userId,
          ...settings,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error updating notification settings:', error);
      return { data: null, error: error as Error };
    }
  },

  // Get user activity
  async getUserActivity(userId: string): Promise<SupabaseResponse<UserActivity>> {
    try {
      const { data, error } = await supabase
        .from('user_activity')
        .select('*')
        .eq('user_id', userId)
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error fetching user activity:', error);
      return { data: null, error: error as Error };
    }
  },

  // Update password
  async updatePassword(newPassword: string): Promise<SupabaseResponse<void>> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      return { data: error ? null : undefined, error };
    } catch (error) {
      console.error('Error updating password:', error);
      return { data: null, error: error as Error };
    }
  },

  // Delete user account
  async deleteAccount(userId: string): Promise<SupabaseResponse<void>> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId);

      if (!error) {
        await supabase.auth.signOut();
      }

      return { data: error ? null : undefined, error };
    } catch (error) {
      console.error('Error deleting account:', error);
      return { data: null, error: error as Error };
    }
  }
};