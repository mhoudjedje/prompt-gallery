import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getMiddlewareSupabase } from '@/lib/supabase-helpers'
import { requiresAuthentication, REDIRECT_PATHS } from '@/lib/redirect-utils'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = getMiddlewareSupabase({ req, res })

  // Refresh session so client sees latest auth state
  const { data: { session } } = await supabase.auth.getSession()
  const isAuthenticated = !!session
  const currentPath = req.nextUrl.pathname

  // Protect routes that require authentication
  if (!isAuthenticated && requiresAuthentication(currentPath)) {
    return NextResponse.redirect(new URL(REDIRECT_PATHS.LOGIN, req.url))
  }

  // Optional: Redirect authenticated users away from login page to home
  if (isAuthenticated && currentPath === REDIRECT_PATHS.LOGIN) {
    return NextResponse.redirect(new URL(REDIRECT_PATHS.HOME, req.url))
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

