import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file and ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.'
  )
}

// Create Supabase client for server-side usage
export const createServerClient = async () => {
  const cookieStore = await cookies()

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: {
        getItem: (key: string) => cookieStore.get(key)?.value ?? null,
        setItem: (_key: string, _value: string) => {
          // Server-side doesn't need to set cookies
        },
        removeItem: (_key: string) => {
          // Server-side doesn't need to remove cookies
        },
      },
      persistSession: true,
      autoRefreshToken: true,
    },
  })
}
