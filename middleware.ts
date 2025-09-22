import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getMiddlewareSupabase } from '@/lib/supabase-helpers'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = getMiddlewareSupabase({ req, res })

  // Refresh session so client sees latest auth state
  const { data: { session } } = await supabase.auth.getSession()

  // Protect /home and /profile routes
  if (!session && (req.nextUrl.pathname.startsWith('/home') || req.nextUrl.pathname.startsWith('/profile'))) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

