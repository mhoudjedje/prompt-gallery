# Supabase Setup Guide for Prompt Gallery

## Step 1: Create a New Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - **Name**: `prompt-gallery`
   - **Database Password**: (generate a strong password)
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for project to be ready (~2 minutes)

## Step 2: Get Your Credentials

1. Go to **Settings → API**
2. Copy these values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Project API Key** (anon public): `your-anon-key-here`

## Step 3: Set Up Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Create a new query
3. Copy and paste the contents of `database/seed.sql`
4. Click "Run" to create the basic schema
5. Create another query
6. Copy and paste the contents of `database/profile-tables.sql`  
7. Click "Run" to create the profile-related tables

## Step 4: Configure Authentication

1. Go to **Authentication → Settings**
2. Under **Site URL**, add your development URL:
   - `http://localhost:3000`
3. Under **Redirect URLs**, add:
   - `http://localhost:3000`
   - `http://localhost:3000/auth/callback` (if using OAuth)
4. Enable your desired auth providers:
   - **Email**: Already enabled
   - **Google** (optional): Add OAuth credentials
   - **GitHub** (optional): Add OAuth credentials

## Step 5: Update Environment Variables

Replace the values in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 6: Test the Setup

1. Start the dev server: `npm run dev`
2. Go to `http://localhost:3000`
3. Try signing up with a new account
4. Check if user profile is created in Supabase dashboard

## Step 7: Make Yourself Admin (Optional)

1. Sign up for an account through your app
2. Go to **Table Editor → user_profiles** in Supabase
3. Find your user and change `role` from `user` to `admin`
4. Or run this SQL query:
   ```sql
   UPDATE user_profiles SET role = 'admin' WHERE email = 'your-email@example.com';
   ```

## Step 8: Add Sample Data (Optional)

1. Go to **SQL Editor**
2. Run this query:
   ```sql
   SELECT insert_sample_prompts();
   ```

## Troubleshooting

- **Build errors**: Make sure environment variables are set correctly
- **Auth not working**: Check Site URL and Redirect URLs in Auth settings
- **Database errors**: Verify all SQL scripts ran successfully
- **CORS errors**: Add your domain to the allowed origins in Supabase settings

## Production Deployment

When deploying to Vercel:

1. Add environment variables in Vercel dashboard
2. Update Site URL and Redirect URLs in Supabase to include your production domain
3. Test the auth flow on production

## Database Schema Overview

The app uses these main tables:
- `user_profiles` - User information and settings
- `categories` - Prompt categories
- `prompts` - AI prompts with hidden content
- `unlocks` - User prompt purchases/unlocks
- `connected_accounts` - OAuth connections
- `notifications_settings` - User notification preferences
- `user_activity` - User activity tracking

All tables have proper Row Level Security (RLS) policies for data protection.