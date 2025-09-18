# Prompt Gallery

A marketplace for AI prompts - like Freepik but for AI prompts. Built with Next.js 15, Supabase, and Tailwind CSS.

## Features

- 🎨 **Browse Gallery**: Discover AI prompts across different categories
- 🔐 **Authentication**: Secure login/signup with Supabase Auth
- 💰 **Monetization**: Premium prompts with payment integration (Stripe)
- ⚡ **Admin Panel**: Easy prompt management and upload
- 📱 **Responsive**: Beautiful UI that works on all devices

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Auth, Database, Storage)
- **Payment**: Stripe (coming soon)
- **Deployment**: Vercel

## Getting Started

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd prompt-gallery
npm install
```

### 2. Set up Environment Variables

1. Create a `.env.local` file in your project root:

```bash
touch .env.local
```

2. Add your Supabase credentials to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

**To get your Supabase credentials:**
1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Replace the placeholder values in your `.env.local` file

### 3. Set up Database

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `database/seed.sql` into the editor
4. Click "Run" to execute the script

This will create:
- All required tables (users, categories, prompts, unlocks)
- Row Level Security policies
- Sample data (6 categories and 12 example prompts)
- Database indexes for performance
- Automatic user profile creation trigger

The seed script includes:
- **6 Categories**: Images, Text, Video, Code, Business, Education
- **12 Sample Prompts**: Mix of free and premium prompts with example images
- **Proper Relationships**: Foreign keys and constraints
- **Security**: Row Level Security policies for data protection

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── gallery/          # Browse prompts
│   ├── login/            # User login
│   ├── signup/           # User registration
│   ├── admin/            # Admin panel for prompt management
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Homepage
├── lib/
│   └── supabase.ts       # Supabase client configuration
└── ...
```

## Available Routes

- `/` - Homepage with hero section and features
- `/gallery` - Browse prompts with category filtering and image display
- `/prompts/[id]` - Individual prompt details page with copy functionality
- `/login` - User authentication (email/password + Google OAuth)
- `/signup` - User registration with email confirmation
- `/admin` - Admin panel for creating and managing prompts (auth-protected)

## Features

### 🎨 **Gallery Page**
- **Category Filtering**: Filter prompts by category (Images, Text, Video, etc.)
- **Image Display**: Show prompt preview images
- **Premium Indicators**: Clear pricing for premium prompts
- **Responsive Grid**: Beautiful card layout that works on all devices

### 🔐 **Authentication**
- **Email/Password**: Traditional signup and login
- **Google OAuth**: One-click authentication
- **Protected Routes**: Admin panel requires authentication
- **Auto-redirect**: Seamless navigation after login/signup

### ⚡ **Admin Panel**
- **Create Prompts**: Full form with image URL, category selection, pricing
- **Category Management**: Select from existing categories
- **Premium Pricing**: Set custom prices for premium prompts
- **Real-time Validation**: Form validation and error handling

### 🎯 **UI/UX**
- **Shared Components**: Consistent header and footer across all pages
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Loading States**: Smooth loading indicators and error handling
- **Modern Design**: Clean, professional interface

## 🚀 Deployment Guide

### Step 1: Deploy to GitHub

1. **Create a new repository on GitHub**:
   - Go to [github.com](https://github.com) and click "New repository"
   - Name it `prompt-gallery` (or your preferred name)
   - Make it public or private (your choice)
   - Don't initialize with README (we already have one)

2. **Push your code to GitHub**:
   ```bash
   # Add your GitHub repository as remote origin
   git remote add origin https://github.com/YOUR_USERNAME/prompt-gallery.git
   
   # Rename branch to main (recommended)
   git branch -M main
   
   # Push to GitHub
   git push -u origin main
   ```

### Step 2: Deploy to Vercel

1. **Go to Vercel**:
   - Visit [vercel.com](https://vercel.com)
   - Sign up/login with your GitHub account

2. **Import your project**:
   - Click "New Project"
   - Import your `prompt-gallery` repository
   - Vercel will auto-detect it's a Next.js project

3. **Configure environment variables**:
   - In the "Environment Variables" section, add:
     - `NEXT_PUBLIC_SUPABASE_URL` = Your Supabase project URL
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Your Supabase anon key

4. **Deploy**:
   - Click "Deploy"
   - Vercel will build and deploy your app
   - You'll get a live URL like `https://prompt-gallery-abc123.vercel.app`

### Step 3: Set up Supabase

1. **Create Supabase project**:
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Run the database seed**:
   - Go to SQL Editor in your Supabase dashboard
   - Copy and paste the contents of `database/seed.sql`
   - Click "Run" to execute

3. **Update Vercel environment variables**:
   - Go back to Vercel dashboard
   - Update the environment variables with your actual Supabase credentials
   - Redeploy if needed

### Step 4: Test your deployment

1. **Visit your live URL**
2. **Test all features**:
   - Homepage loads correctly
   - Gallery shows sample prompts
   - Login/signup works
   - Admin panel is protected
   - Category filtering works

### Environment Variables

Make sure to set these in your Vercel dashboard:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key

### Troubleshooting

**If you get 500 errors**:
- Check that your Supabase environment variables are correct
- Verify the database seed script ran successfully
- Check Vercel function logs for specific errors

**If prompts don't show**:
- Make sure you ran the database seed script
- Check that categories were created
- Verify RLS policies are set up correctly

## Features Roadmap

- [ ] Stripe payment integration for premium prompts
- [ ] User profiles and prompt collections
- [ ] Search and filtering
- [ ] Prompt ratings and reviews
- [ ] API for third-party integrations
- [ ] Mobile app (React Native)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details.


<!-- chore: trigger deployment -->