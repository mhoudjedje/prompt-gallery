-- Additional tables for profile functionality
-- Run this in your Supabase SQL editor after the main seed.sql

-- Add full_name and avatar_url columns to user_profiles if they don't exist
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create connected_accounts table
CREATE TABLE IF NOT EXISTS connected_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  connected BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- Create notifications_settings table
CREATE TABLE IF NOT EXISTS notifications_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  newsletter_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create user_activity table
CREATE TABLE IF NOT EXISTS user_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  prompts_created INTEGER DEFAULT 0,
  prompts_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS on new tables
ALTER TABLE connected_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for connected_accounts
DROP POLICY IF EXISTS "Users can view their own connected accounts" ON connected_accounts;
DROP POLICY IF EXISTS "Users can update their own connected accounts" ON connected_accounts;
CREATE POLICY "Users can view their own connected accounts" ON connected_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own connected accounts" ON connected_accounts FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for notifications_settings
DROP POLICY IF EXISTS "Users can view their own notification settings" ON notifications_settings;
DROP POLICY IF EXISTS "Users can update their own notification settings" ON notifications_settings;
CREATE POLICY "Users can view their own notification settings" ON notifications_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notification settings" ON notifications_settings FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for user_activity
DROP POLICY IF EXISTS "Users can view their own activity" ON user_activity;
DROP POLICY IF EXISTS "Users can update their own activity" ON user_activity;
CREATE POLICY "Users can view their own activity" ON user_activity FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own activity" ON user_activity FOR ALL USING (auth.uid() = user_id);

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for avatars
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatars" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatars" ON storage.objects
FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatars" ON storage.objects
FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Function to initialize user profile data
CREATE OR REPLACE FUNCTION public.initialize_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Initialize notification settings
  INSERT INTO public.notifications_settings (user_id, newsletter_enabled)
  VALUES (NEW.id, true)
  ON CONFLICT (user_id) DO NOTHING;

  -- Initialize user activity
  INSERT INTO public.user_activity (user_id, prompts_created, prompts_used)
  VALUES (NEW.id, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to initialize profile data when user is created
DROP TRIGGER IF EXISTS on_user_profile_created ON user_profiles;
CREATE TRIGGER on_user_profile_created
  AFTER INSERT ON user_profiles
  FOR EACH ROW EXECUTE PROCEDURE public.initialize_user_profile();
