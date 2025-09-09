# Prompt Gallery MVP - Setup Guide

## Quick Start

### 1. Environment Variables Setup

Create a `.env.local` file in your project root with your Supabase credentials:

```bash
# Create the environment file
touch .env.local
```

Add the following content to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

**To get your Supabase credentials:**
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings** → **API**
4. Copy the **Project URL** and **anon/public key**
5. Replace the placeholder values in your `.env.local` file

### 2. Database Schema Setup

Run the following SQL script in your Supabase SQL Editor:

```sql
-- Copy and paste the contents of database/seed.sql
-- This will create all necessary tables, RLS policies, and sample data
```

### 3. Install Dependencies and Start Development Server

```bash
npm install
npm run dev
```

### 4. Test the Setup

1. Visit `http://localhost:3000`
2. Try to sign up for a new account
3. Check that you can log in successfully
4. Verify the gallery page loads with sample prompts

### 5. Make Yourself an Admin (Optional)

After signing up, run this SQL in your Supabase SQL Editor to make yourself an admin:

```sql
UPDATE user_profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

### 6. Add Sample Data (Optional)

Run this SQL to populate the gallery with sample prompts:

```sql
SELECT insert_sample_prompts();
```

## Troubleshooting

### Common Issues

**"Supabase is not configured" error:**
- Ensure your `.env.local` file exists and contains valid credentials
- Restart your development server after adding environment variables
- Check that the credentials don't contain placeholder values

**Database connection errors:**
- Verify your Supabase project is active
- Check that the database schema has been applied correctly
- Ensure RLS policies are properly configured

**Authentication issues:**
- Check that email confirmation is disabled in Supabase Auth settings (for development)
- Verify the redirect URLs are configured correctly in Supabase

### File Structure

```
prompt-gallery/
├── .env.local                 # Your environment variables (create this)
├── .env.example              # Template for environment variables
├── database/
│   └── seed.sql              # Database schema and sample data
├── src/
│   ├── app/                  # Next.js App Router pages
│   ├── components/           # React components
│   └── lib/
│       └── supabase.ts       # Supabase client configuration
└── SETUP.md                  # This setup guide
```

## Next Steps

Once everything is working:

1. **Customize the UI** - Modify components in `src/components/`
2. **Add new features** - Create new pages in `src/app/`
3. **Deploy to production** - Use Vercel, Netlify, or your preferred platform
4. **Configure production environment** - Set up environment variables in your hosting platform

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify your Supabase project is active and accessible
3. Ensure all environment variables are set correctly
4. Check that the database schema has been applied

For additional help, refer to the [Supabase Documentation](https://supabase.com/docs) or [Next.js Documentation](https://nextjs.org/docs).
