# Profile Page Debug Guide

This guide helps troubleshoot the profile page loading issues and provides step-by-step instructions for testing.

## Changes Made

### 1. Enhanced Logging in `profile_api.ts`
- Added comprehensive console logging for all API calls
- Session validation in `getAllProfileData()`
- Detailed error reporting with emojis for easy identification

### 2. Improved Error Handling in `profile_page.tsx`
- Client-side session validation
- Proper error states instead of infinite skeleton loading
- Clear error messages with retry options
- Redirect to login if session is invalid

### 3. Database Setup
- Created `database-setup.sql` with complete table structure
- Proper RLS policies for all profile tables
- Storage bucket configuration for avatars

## Testing Steps

### Step 1: Verify Database Setup
1. Run the profile tables SQL in your Supabase SQL editor:
   ```sql
   -- Run database/profile-tables.sql first
   -- Then run database-setup.sql for additional policies
   ```

### Step 2: Start Development Server
```bash
npm run dev
```

### Step 3: Test Profile Flow
1. **Login/Signup**: Go to `/login` and create/login to an account
2. **Check Console**: Open browser DevTools → Console tab
3. **Navigate to Profile**: Click avatar in navbar or go to `/profile`
4. **Monitor Logs**: Look for these log patterns:

#### Expected Success Flow:
```
🚀 [ProfilePage] Starting profile data load
🔐 [ProfilePage] Server session user ID: [user-id]
🔐 [ProfilePage] Client session state: Active
🚀 [ProfileAPI] Starting getAllProfileData for user ID: [user-id]
🔐 [ProfileAPI] Current session state: Active
🔍 [ProfileAPI] Getting profile for user ID: [user-id]
✅ [ProfileAPI] Profile data received: Found
🔍 [ProfileAPI] Getting connected accounts for user ID: [user-id]
✅ [ProfileAPI] Connected accounts received: 0 accounts
🔍 [ProfileAPI] Getting notification settings for user ID: [user-id]
ℹ️ [ProfileAPI] No notification settings found, creating defaults
✅ [ProfileAPI] Created default notification settings
🔍 [ProfileAPI] Getting user activity for user ID: [user-id]
ℹ️ [ProfileAPI] No user activity found, creating defaults
✅ [ProfileAPI] Created default user activity
📊 [ProfileAPI] Response summary: { profile: 'Success', accounts: '0 accounts', settings: 'Success', activity: 'Success' }
✅ [ProfileAPI] Successfully compiled all profile data
✅ [ProfilePage] Profile data loaded successfully
```

#### Common Error Patterns:

**No Session:**
```
❌ [ProfilePage] No client session found, redirecting to login
```

**Session Mismatch:**
```
❌ [ProfilePage] Session mismatch, redirecting to login
```

**Database Access Issues:**
```
❌ [ProfileAPI] Error fetching profile: [error details]
❌ [ProfileAPI] Exception in getAllProfileData: [error details]
```

**Missing Tables:**
```
❌ [ProfileAPI] Error fetching profile: relation "user_profiles" does not exist
```

## Common Issues & Solutions

### Issue 1: Infinite Skeleton Loading
**Symptoms:** Profile page shows skeleton forever, no error message
**Solution:** Check console logs for specific errors, likely database or session issues

### Issue 2: "Unable to Load Profile" Error
**Symptoms:** Red error screen with retry button
**Causes:**
- Missing database tables → Run database setup scripts
- RLS policies blocking access → Check user authentication
- Network/connection issues → Check Supabase configuration

### Issue 3: Session Issues
**Symptoms:** Redirects to login immediately
**Causes:**
- Server/client session mismatch → Check auth configuration
- Expired session → Login again
- Auth helpers misconfiguration → Verify Supabase auth setup

### Issue 4: Missing Profile Data
**Symptoms:** Profile loads but shows default/empty values
**Causes:**
- User profile not created → Check trigger function
- RLS policies too restrictive → Verify policies allow user access
- Missing columns in user_profiles table → Run profile-tables.sql

## Database Verification Queries

Run these in Supabase SQL Editor to verify setup:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_profiles', 'connected_accounts', 'notifications_settings', 'user_activity');

-- Check user_profiles structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND table_schema = 'public';

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN ('user_profiles', 'connected_accounts', 'notifications_settings', 'user_activity');

-- Check if your user profile exists (replace with your user ID)
SELECT * FROM user_profiles WHERE id = 'your-user-id';
```

## Manual Profile Creation

If profile doesn't auto-create, run this (replace with actual user ID):

```sql
-- Insert user profile manually
INSERT INTO user_profiles (id, email, full_name)
VALUES ('your-user-id', 'your-email@example.com', 'Your Name')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name;

-- Create notification settings
INSERT INTO notifications_settings (user_id, newsletter_enabled)
VALUES ('your-user-id', true)
ON CONFLICT (user_id) DO NOTHING;

-- Create user activity
INSERT INTO user_activity (user_id, prompts_created, prompts_used)
VALUES ('your-user-id', 0, 0)
ON CONFLICT (user_id) DO NOTHING;
```

## Environment Variables Check

Ensure these are set in your `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Support

If issues persist:
1. Check all console logs for specific error messages
2. Verify database setup with the queries above
3. Test with a fresh user account
4. Check network tab for failed API requests
5. Ensure Supabase project is active and configured correctly

The enhanced logging should provide clear indicators of where the issue occurs in the profile loading flow.