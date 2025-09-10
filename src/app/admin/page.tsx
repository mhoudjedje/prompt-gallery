'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import AdminPanel from './AdminPanel'

export default function AdminPage() {
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAuthAndRole()
  }, [router])

  const checkAuthAndRole = async () => {
    try {
      console.log('🔍 Admin page: Starting client-side authentication check...')
      
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      console.log('📊 Admin page: User data:', user)
      console.log('📊 Admin page: User error:', userError)
      
      if (userError) {
        console.error('❌ Admin page: Authentication error:', userError)
        router.push('/login')
        return
      }
      
      if (!user) {
        console.log('❌ Admin page: No user found, redirecting...')
        router.push('/login')
        return
      }

      console.log('✅ Admin page: User found:', { id: user.id, email: user.email })

      // Check user role in user_profiles table
      console.log('🔍 Admin page: Querying user_profiles table for user ID:', user.id)
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('role, email')
        .eq('id', user.id)
        .single()

      console.log('📊 Admin page: Profile data:', profile)
      console.log('📊 Admin page: Profile error:', profileError)

      if (profileError) {
        console.error('❌ Admin page: Error fetching user profile:', profileError)
        router.push('/login')
        return
      }

      if (!profile) {
        console.log('❌ Admin page: Not admin, redirecting... (no profile found)')
        router.push('/login')
        return
      }

      if (profile.role !== 'admin') {
        console.log('❌ Admin page: Not admin, redirecting... (role:', profile.role, ')')
        router.push('/login')
        return
      }

      console.log('✅ Admin page: Authentication and authorization successful!')
      console.log('📊 Admin page: Final user data:', { 
        id: user.id, 
        email: user.email, 
        role: profile.role 
      })

      setIsAdmin(true)
    } catch (error) {
      console.error('💥 Admin page: Unexpected error in admin page:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null // Will redirect to login
  }

  return <AdminPanel />
}