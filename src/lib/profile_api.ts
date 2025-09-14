import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { 
  UserProfile, 
  ConnectedAccount, 
  NotificationSettings, 
  UserActivity, 
  ProfileData,
  ApiResponse 
} from '@/types/profile';

const supabase = createClientComponentClient();

// Helper function to create API response
function createResponse<T>(data: T | null, error: Error | null = null): ApiResponse<T> {
  return { data, error };
}

export const profileApi = {
  // Fetch user profile
  async getProfile(userId: string): Promise<ApiResponse<UserProfile>> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return createResponse(data);
    } catch (error) {
      return createResponse<UserProfile>(null, error as Error);
    }
  },

  // Update user profile
  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({ 
          ...updates, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return createResponse(data);
    } catch (error) {
      return createResponse<UserProfile>(null, error as Error);
    }
  },

  // Upload avatar
  async uploadAvatar(userId: string, file: File): Promise<ApiResponse<string>> {
    try {
      // Validate file
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }
      
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/avatar.${fileExt}`;

      // Upload file
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      return createResponse(data.publicUrl);
    } catch (error) {
      return createResponse<string>(null, error as Error);
    }
  },

  // Remove avatar
  async removeAvatar(userId: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase.storage
        .from('avatars')
        .remove([`${userId}/avatar.jpg`, `${userId}/avatar.png`, `${userId}/avatar.gif`]);

      // Don't throw error if file doesn't exist, just continue
      return createResponse(true);
    } catch (error) {
      return createResponse<boolean>(null, error as Error);
    }
  },

  // Get connected accounts
  async getConnectedAccounts(userId: string): Promise<ApiResponse<ConnectedAccount[]>> {
    try {
      const { data, error } = await supabase
        .from('connected_accounts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return createResponse(data || []);
    } catch (error) {
  return createResponse<ConnectedAccount[]>(null as unknown as ConnectedAccount[], error as Error);
    }
  },

  // Update connected account
  async updateConnectedAccount(
    userId: string, 
    provider: string, 
    connected: boolean
  ): Promise<ApiResponse<ConnectedAccount>> {
    try {
      const { data: existing } = await supabase
        .from('connected_accounts')
        .select('*')
        .eq('user_id', userId)
        .eq('provider', provider)
        .single();

      let result;
      
      if (existing) {
        // Update existing record
        const { data, error } = await supabase
          .from('connected_accounts')
          .update({ 
            connected, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', existing.id)
          .select()
          .single();
          
        if (error) throw error;
        result = data;
      } else {
        // Create new record
        const { data, error } = await supabase
          .from('connected_accounts')
          .insert({
            user_id: userId,
            provider,
            provider_id: '', // Would be populated by OAuth flow
            connected,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
          
        if (error) throw error;
        result = data;
      }

      return createResponse(result);
    } catch (error) {
      return createResponse<ConnectedAccount>(null, error as Error);
    }
  },

  // Get notification settings
  async getNotificationSettings(userId: string): Promise<ApiResponse<NotificationSettings>> {
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // No settings found, create default
        const { data: newSettings, error: createError } = await supabase
          .from('notification_settings')
          .insert({
            user_id: userId,
            newsletter_enabled: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
          
        if (createError) throw createError;
        return createResponse(newSettings);
      }

      if (error) throw error;
      return createResponse(data);
    } catch (error) {
      return createResponse<NotificationSettings>(null, error as Error);
    }
  },

  // Update notification settings
  async updateNotificationSettings(
    userId: string, 
    updates: Partial<NotificationSettings>
  ): Promise<ApiResponse<NotificationSettings>> {
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .update({ 
          ...updates, 
          updated_at: new Date().toISOString() 
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return createResponse(data);
    } catch (error) {
      return createResponse<NotificationSettings>(null, error as Error);
    }
  },

  // Get user activity
  async getUserActivity(userId: string): Promise<ApiResponse<UserActivity>> {
    try {
      const { data, error } = await supabase
        .from('user_activity')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // No activity found, create default
        const { data: newActivity, error: createError } = await supabase
          .from('user_activity')
          .insert({
            user_id: userId,
            prompts_created: 0,
            prompts_used: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
          
        if (createError) throw createError;
        return createResponse(newActivity);
      }

      if (error) throw error;
      return createResponse(data);
    } catch (error) {
      return createResponse<UserActivity>(null, error as Error);
    }
  },

  // Update password
  async updatePassword(newPassword: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      return createResponse(true);
    } catch (error) {
      return createResponse<boolean>(null, error as Error);
    }
  },

  // Delete account
  async deleteAccount(userId: string): Promise<ApiResponse<boolean>> {
    try {
      // Delete user profile (cascade will handle related records)
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      // Sign out user
      await supabase.auth.signOut();
      
      return createResponse(true);
    } catch (error) {
      return createResponse<boolean>(null, error as Error);
    }
  },

  // Fetch all profile data in parallel
  async getAllProfileData(userId: string): Promise<ApiResponse<ProfileData>> {
    try {
      const [
        profileResponse,
        accountsResponse,
        settingsResponse,
        activityResponse
      ] = await Promise.all([
        this.getProfile(userId),
        this.getConnectedAccounts(userId),
        this.getNotificationSettings(userId),
        this.getUserActivity(userId)
      ]);

      // Check for errors
      if (profileResponse.error) throw profileResponse.error;
      if (accountsResponse.error) throw accountsResponse.error;
      if (settingsResponse.error) throw settingsResponse.error;
      if (activityResponse.error) throw activityResponse.error;

      // Check for missing data
      if (!profileResponse.data) throw new Error('Profile data not found');
      if (!settingsResponse.data) throw new Error('Settings data not found');
      if (!activityResponse.data) throw new Error('Activity data not found');

      const profileData: ProfileData = {
        profile: profileResponse.data,
        connectedAccounts: accountsResponse.data || [],
        notificationSettings: settingsResponse.data,
        userActivity: activityResponse.data
      };

      return createResponse(profileData);
    } catch (error) {
      return createResponse<ProfileData>(null, error as Error);
    }
  }
};