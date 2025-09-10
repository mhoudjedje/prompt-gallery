import { createClient } from '@supabase/supabase-js'

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file and ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.'
  )
}

// Check for placeholder values
if (supabaseUrl === 'https://your-project-id.supabase.co' || 
    supabaseAnonKey === 'your-supabase-anon-key' ||
    supabaseUrl === 'https://placeholder.supabase.co' || 
    supabaseAnonKey === 'placeholder-key') {
  throw new Error(
    'Supabase environment variables contain placeholder values. Please update your .env.local file with actual Supabase credentials.'
  )
}

// Debug logging (remove in production)
if (typeof window !== 'undefined') {
  console.log('Supabase URL:', supabaseUrl)
  console.log('Supabase Key length:', supabaseAnonKey?.length)
  console.log('Is configured:', true)
}

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey && 
           supabaseUrl !== 'https://placeholder.supabase.co' && 
           supabaseAnonKey !== 'placeholder-key' &&
           supabaseUrl !== 'https://your-project-id.supabase.co' &&
           supabaseAnonKey !== 'your-supabase-anon-key')
}

// Create Supabase client for client-side usage
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
