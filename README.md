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

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

4. Update `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

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

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

### Environment Variables

Make sure to set these in your production environment:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key

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