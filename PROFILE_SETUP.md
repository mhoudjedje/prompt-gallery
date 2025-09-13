# Profile Page Setup Guide

This guide will help you set up the profile page with full Supabase integration.

## Database Setup

### 1. Run the Main Database Script
First, run the main database seed script in your Supabase SQL editor:
```sql
-- Run: database/seed.sql
```

### 2. Run the Profile Tables Script
Then, run the additional profile tables script:
```sql
-- Run: database/profile-tables.sql
```

This will create the following additional tables:
- `connected_accounts` - For managing OAuth connections
- `notifications_settings` - For user notification preferences
- `user_activity` - For tracking user statistics
- `avatars` storage bucket - For profile picture storage

### 3. Verify Storage Bucket
Make sure the `avatars` storage bucket is created and has the correct policies:
- Public read access for viewing avatars
- User-specific upload/update/delete permissions

## Features Implemented

### ✅ Profile Management
- **Name editing**: Inline editing with real-time updates
- **Avatar upload**: File upload to Supabase Storage
- **Avatar removal**: Delete from storage and update profile
- **Email display**: Read-only from auth user data

### ✅ Subscription & Status
- **Subscription status**: Shows Free/Pro based on database
- **Role display**: Shows user/admin role
- **Upgrade button**: Stubbed for future implementation

### ✅ Connected Accounts
- **Google integration**: Toggle connection status
- **Database persistence**: Updates stored in `connected_accounts` table
- **Real-time updates**: Optimistic UI updates

### ✅ Security
- **Password change**: Modal with validation using `supabase.auth.updateUser()`
- **2FA toggle**: Stubbed for future implementation
- **Security tips**: Helpful guidance for users

### ✅ Notifications
- **Newsletter toggle**: Controls newsletter subscription
- **Database persistence**: Stored in `notifications_settings` table
- **Real-time updates**: Optimistic UI updates

### ✅ Activity Overview
- **Prompts created**: Fetched from `user_activity` table
- **Prompts used**: Shows how many times user's prompts were copied
- **Loading states**: Skeleton loaders while fetching data

### ✅ Danger Zone
- **Account deletion**: Confirmation modal with database cleanup
- **Cascade deletes**: Removes all user data
- **Sign out**: Automatically signs out after deletion

## API Structure

### Profile API (`src/lib/supabase/profile.ts`)
```typescript
profileApi = {
  getProfile(userId)           // Fetch user profile
  updateProfile(userId, data)  // Update profile fields
  uploadAvatar(userId, file)   // Upload to Supabase Storage
  deleteAvatar(url)           // Remove from storage
  getConnectedAccounts(userId) // Fetch OAuth connections
  updateConnectedAccount(...)  // Toggle connection status
  getNotificationSettings(userId) // Fetch notification prefs
  updateNotificationSettings(...) // Update notification prefs
  getUserActivity(userId)     // Fetch user statistics
  updatePassword(password)    // Change password via auth
  deleteAccount(userId)       // Delete user and all data
}
```

### Toast Notifications (`src/hooks/useToast.ts`)
- Success, error, info, and warning toasts
- Auto-dismiss with configurable duration
- Stacked display with smooth animations

## Error Handling

### Comprehensive Error Management
- **API errors**: Caught and displayed as toast notifications
- **Validation errors**: Form validation with inline error messages
- **Network errors**: Graceful fallbacks and retry suggestions
- **Auth errors**: Proper handling of authentication failures

### Loading States
- **Skeleton loaders**: While fetching initial data
- **Button loading**: During async operations
- **Optimistic updates**: Immediate UI feedback

## Usage

### Accessing the Profile Page
Navigate to `/profile` in your application. The page will:
1. Check authentication status
2. Load all profile data in parallel
3. Display skeleton loaders while loading
4. Show error messages if authentication fails

### Testing the Features
1. **Edit name**: Click "Edit" next to your name
2. **Upload avatar**: Click the "+" button on the avatar
3. **Toggle Google**: Use the toggle in Connected Accounts
4. **Change password**: Click "Change password" in Security
5. **Update notifications**: Toggle newsletter subscription
6. **Delete account**: Use the red button in Danger Zone

## Database Schema

### user_profiles
```sql
- id (UUID, PK, references auth.users)
- email (TEXT)
- subscription_status (TEXT: 'free'|'premium')
- role (TEXT: 'user'|'admin')
- full_name (TEXT, nullable)
- avatar_url (TEXT, nullable)
- created_at (TIMESTAMP)
```

### connected_accounts
```sql
- id (UUID, PK)
- user_id (UUID, FK to auth.users)
- provider (TEXT: 'google', 'github', etc.)
- provider_id (TEXT)
- connected (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### notifications_settings
```sql
- id (UUID, PK)
- user_id (UUID, FK to auth.users)
- newsletter_enabled (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### user_activity
```sql
- id (UUID, PK)
- user_id (UUID, FK to auth.users)
- prompts_created (INTEGER)
- prompts_used (INTEGER)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## Security Features

### Row Level Security (RLS)
- All tables have RLS enabled
- Users can only access their own data
- Proper policies for CRUD operations

### Storage Security
- Avatar uploads restricted to authenticated users
- Users can only modify their own avatars
- Public read access for viewing avatars

### Password Security
- Uses Supabase Auth's built-in password hashing
- Minimum 6 character requirement
- Confirmation validation

## Future Enhancements

### Planned Features
- **2FA Implementation**: TOTP-based two-factor authentication
- **More OAuth Providers**: GitHub, Discord, etc.
- **Advanced Notifications**: Email preferences, push notifications
- **Profile Analytics**: Detailed usage statistics
- **Account Recovery**: Password reset and account recovery flows

### Customization Options
- **Theme Selection**: Dark/light mode preferences
- **Language Settings**: Multi-language support
- **Privacy Controls**: Data sharing preferences
- **Export Data**: GDPR-compliant data export

## Troubleshooting

### Common Issues
1. **Authentication errors**: Check Supabase configuration
2. **Storage errors**: Verify bucket policies and permissions
3. **Database errors**: Ensure RLS policies are correct
4. **Upload failures**: Check file size and type restrictions

### Debug Mode
Enable debug logging by checking browser console for detailed error messages and API responses.

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify Supabase configuration in `.env.local`
3. Ensure all database scripts have been run
4. Check RLS policies in Supabase dashboard
