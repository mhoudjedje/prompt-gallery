# 🚀 Prompt Gallery Deployment Checklist

## Pre-Deployment Setup

### ✅ 1. GitHub Repository
- [ ] Create new repository on GitHub
- [ ] Push code to GitHub
- [ ] Verify all files are committed

### ✅ 2. Supabase Setup
- [ ] Create new Supabase project
- [ ] Run database seed script (`database/seed.sql`)
- [ ] Note down project URL and anon key
- [ ] Test database connection

### ✅ 3. Vercel Deployment
- [ ] Connect GitHub repository to Vercel
- [ ] Add environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Deploy and get live URL

## Post-Deployment Testing

### ✅ 4. Basic Functionality
- [ ] Homepage loads correctly
- [ ] Navigation works (Home, Gallery, Login, Signup)
- [ ] Gallery shows sample prompts
- [ ] Category filtering works
- [ ] Images display properly

### ✅ 5. Authentication
- [ ] Sign up works (email confirmation)
- [ ] Login works (email/password)
- [ ] Google OAuth works (if enabled)
- [ ] Logout works
- [ ] Admin panel is protected

### ✅ 6. Admin Features
- [ ] Can create new prompts
- [ ] Category selection works
- [ ] Image URL validation works
- [ ] Form validation works
- [ ] Success/error messages show

## Quick Commands

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Git Commands
```bash
# Add all changes
git add .

# Commit changes
git commit -m "Your commit message"

# Push to GitHub
git push origin main
```

### Database Commands
```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check sample data
SELECT COUNT(*) FROM categories;
SELECT COUNT(*) FROM prompts;
SELECT COUNT(*) FROM user_profiles;
```

## Environment Variables

### Required for Production
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Optional (for future features)
```
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

## Troubleshooting

### Common Issues

1. **500 Errors on Pages**
   - Check Supabase environment variables
   - Verify database connection
   - Check Vercel function logs

2. **No Prompts Showing**
   - Run database seed script
   - Check RLS policies
   - Verify category data exists

3. **Authentication Not Working**
   - Check Supabase Auth settings
   - Verify redirect URLs
   - Check email templates

4. **Images Not Loading**
   - Check image URLs in database
   - Verify CORS settings
   - Test image URLs directly

### Debug Steps

1. **Check Vercel Logs**
   - Go to Vercel dashboard
   - Click on your project
   - Go to "Functions" tab
   - Check error logs

2. **Check Supabase Logs**
   - Go to Supabase dashboard
   - Check "Logs" section
   - Look for API errors

3. **Test Database Connection**
   - Use Supabase SQL editor
   - Run simple queries
   - Check table structure

## Success Criteria

Your deployment is successful when:
- ✅ All pages load without errors
- ✅ Sample prompts display in gallery
- ✅ Users can sign up and log in
- ✅ Admin can create new prompts
- ✅ Category filtering works
- ✅ Mobile responsive design works
- ✅ No console errors in browser

## Next Steps After Deployment

1. **Set up custom domain** (optional)
2. **Configure email templates** in Supabase
3. **Set up monitoring** and analytics
4. **Plan for Stripe integration** for payments
5. **Add more sample content** to showcase features
