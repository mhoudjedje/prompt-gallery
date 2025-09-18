// Quick test script to check profile functionality
// This script simulates the profile loading flow to identify issues

const { createClient } = require('@supabase/supabase-js');

// Mock environment variables (replace with actual values when testing)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project-id.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

async function testProfileFlow() {
  console.log('🧪 Testing Profile Flow');
  console.log('=======================');
  
  // Check environment configuration
  if (supabaseUrl.includes('your-project-id') || supabaseKey.includes('your-anon-key')) {
    console.log('❌ Supabase environment variables not configured');
    console.log('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Test 1: Check if we can connect to Supabase
    console.log('🔍 Testing Supabase connection...');
    const { data, error } = await supabase.from('categories').select('count').limit(1);
    if (error) {
      console.log('❌ Connection failed:', error.message);
      return;
    }
    console.log('✅ Supabase connection successful');

    // Test 2: Check if profile tables exist
    console.log('🔍 Checking profile tables...');
    const tables = ['user_profiles', 'connected_accounts', 'notifications_settings', 'user_activity'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('count').limit(1);
        if (error) {
          console.log(`❌ Table '${table}' error:`, error.message);
        } else {
          console.log(`✅ Table '${table}' exists`);
        }
      } catch (err) {
        console.log(`❌ Table '${table}' not accessible:`, err.message);
      }
    }

    // Test 3: Check current session (will be null in Node.js context)
    console.log('🔍 Checking auth session...');
    const { data: { session } } = await supabase.auth.getSession();
    console.log('ℹ️ Session state:', session ? 'Active' : 'No session (expected in Node.js)');

    console.log('\n✅ Profile flow test completed');
    console.log('\nNext steps:');
    console.log('1. Start the development server: npm run dev');
    console.log('2. Sign up/login to create a user');
    console.log('3. Navigate to /profile to test the loading');
    
  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

testProfileFlow();