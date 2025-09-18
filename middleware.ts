import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  const supabase = createServerClient({
    cookies: {
      get(name: string) {
        return req.cookies.get(name)?.value
      },
      set(name: string, value: string, options: Parameters<NextResponse['cookies']['set']>[2]) {
        res.cookies.set(name, value, options)
      },
      remove(name: string, _options: Parameters<NextResponse['cookies']['delete']>[1]) {
        res.cookies.delete(name)
      },
    },
  })

  // Refresh session so client sees latest auth state
  await supabase.auth.getSession()
  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

