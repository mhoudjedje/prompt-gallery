# Authentication Flow Test Plan

## Prerequisites
- Supabase project created and configured
- Environment variables set in `.env.local`
- Development server running (`npm run dev`)

## Test Checklist

### ✅ Test 1: Sign Up Flow
1. Go to `http://localhost:3000`
2. Click "Sign Up" in the navbar
3. Fill in email and password
4. Submit form
5. **Expected**: User created, redirected to home, navbar shows avatar

### ✅ Test 2: Sign In Flow  
1. Go to `http://localhost:3000/login`
2. Enter your credentials
3. Submit form
4. **Expected**: User signed in, navbar shows avatar immediately

### ✅ Test 3: Session Persistence
1. While signed in, refresh the page
2. **Expected**: Navbar still shows avatar (no flicker)

### ✅ Test 4: Profile Access (Authenticated)
1. While signed in, click the avatar in navbar
2. **Expected**: Profile page loads successfully, shows user data

### ✅ Test 5: Profile Access (Unauthenticated)
1. Sign out
2. Go to `http://localhost:3000/profile` directly
3. **Expected**: Redirected to `/login`

### ✅ Test 6: Sign Out Flow
1. While signed in, click "Logout"
2. **Expected**: User signed out, navbar shows "Sign In / Sign Up" immediately

### ✅ Test 7: Redirect After Login
1. While signed out, go to `http://localhost:3000/profile`
2. Get redirected to login
3. Sign in
4. **Expected**: Redirected back to profile page

### ✅ Test 8: Avatar Upload (Profile Page)
1. Go to profile page while signed in
2. Click on avatar to upload new image
3. **Expected**: Avatar updates immediately in navbar and profile

## Debugging Tips

### Check Browser Console
- No authentication errors
- No cookie-related warnings
- No infinite redirect loops

### Check Network Tab
- Session refresh calls working
- Cookie headers present
- No 401 errors on protected routes

### Check Supabase Dashboard
- User appears in Authentication → Users
- User profile created in user_profiles table
- RLS policies working correctly

## Common Issues & Solutions

### Issue: "Navbar doesn't update after login"
- **Check**: `onAuthStateChange` listener in UnifiedNavbar
- **Fix**: Ensure router.refresh() is called after auth state change

### Issue: "Profile page redirects to login even when signed in"
- **Check**: Server-side session reading in profile/page.tsx
- **Fix**: Verify middleware is refreshing sessions correctly

### Issue: "Session lost on page refresh"
- **Check**: Cookie storage and middleware
- **Fix**: Ensure cookies are being set with correct options

### Issue: "Avatar doesn't show immediately"
- **Check**: Database user_profiles table has avatar_url column
- **Fix**: Run profile-tables.sql if missing

## Performance Checks

- Navbar loads quickly without auth flicker
- Profile page loads without unnecessary redirects
- Avatar images load efficiently
- No memory leaks from auth listeners

## Production Testing

After local testing works:

1. Deploy to Vercel
2. Update Supabase Site URL to production domain
3. Test complete flow on production
4. Verify cookies work across domains
5. Test OAuth providers if configured

## Success Criteria

All tests pass with:
- ✅ Immediate UI updates after auth actions
- ✅ No redirect loops
- ✅ Session persistence across refreshes
- ✅ Proper route protection
- ✅ Clean error handling