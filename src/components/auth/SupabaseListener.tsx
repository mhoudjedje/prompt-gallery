'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getClientSupabase } from '@/lib/supabase-browser'

export default function SupabaseListener() {
  const router = useRouter()
  const supabase = getClientSupabase()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      // Ensure server components pick up updated auth cookies immediately
      router.refresh()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase])

  return null
}

