import { createServerComponentClient, createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import type { NextRequest, NextResponse } from 'next/server'

const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const isPlaceholder = (
  envUrl === 'https://your-project-id.supabase.co' ||
  envUrl === 'https://placeholder.supabase.co' ||
  envKey === 'your-supabase-anon-key' ||
  envKey === 'placeholder-key'
)

export const isAuthEnvConfigured = Boolean(envUrl && envKey && !isPlaceholder)

export function getServerSupabase(opts: { cookies: unknown }) {
  const supabaseUrl = envUrl || 'http://localhost'
  const supabaseKey = envKey || 'public-anon-key'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createServerComponentClient({ cookies: opts.cookies as any })
}

export function getMiddlewareSupabase(opts: { req: NextRequest, res: NextResponse }) {
  return createMiddlewareClient({ ...opts })
}

