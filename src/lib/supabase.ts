import { createClient } from '@supabase/supabase-js'

// Read env without throwing at module load to allow builds without local env
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const isPlaceholder = (
  supabaseUrl === 'https://your-project-id.supabase.co' ||
  supabaseUrl === 'https://placeholder.supabase.co' ||
  supabaseAnonKey === 'your-supabase-anon-key' ||
  supabaseAnonKey === 'placeholder-key'
)

const configured = Boolean(supabaseUrl && supabaseAnonKey && !isPlaceholder)

// Helper to check configuration in runtime code before using the client
export const isSupabaseConfigured = () => configured

// Create a client regardless to keep importers simple; Avoid using it unless configured
// Using fallback strings is safe since callers guard with isSupabaseConfigured
export const supabase = createClient(
  supabaseUrl || 'http://localhost',
  supabaseAnonKey || 'public-anon-key'
)
