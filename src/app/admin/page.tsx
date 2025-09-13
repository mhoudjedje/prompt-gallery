import UnifiedNavbar from '@/components/navigation/UnifiedNavbar';
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import AdminPanel from './AdminPanel'

interface UserProfile {
  id: string
  email: string
  role: string
}

export default function AdminPage() {
  // ...existing code...
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string>('')
  const router = useRouter()

  useEffect(() => {
    checkAuthAndRole()
  }, [router])

  const checkAuthAndRole = async () => {
    try {
      console.log('🔍 Admin page: Starting client-side authentication check...')
      setStatus('Checking authentication...')
      
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      console.log('📊 Admin page: User data:', user)
      console.log('📊 Admin page: User error:', userError)
      
      if (userError) {
        console.error('❌ Admin page: Authentication error:', userError)
        setError(`Authentication error: ${userError.message}`)
        router.push('/login')
        return
      }
      
      if (!user) {
        console.log('❌ Admin page: No user found, redirecting...')
        setStatus('No user found, redirecting to login...')
        router.push('/login')
        return
      }

      console.log('✅ Admin page: User found:', { id: user.id, email: user.email })
      setUser(user)
      setStatus('User found, checking profile...')

      // Check user role in user_profiles table
      console.log('🔍 Admin page: Querying user_profiles table for user ID:', user.id)
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, email, role')
        .eq('id', user.id)
        .single()

      console.log('📊 Admin page: Profile data:', profile)
      console.log('📊 Admin page: Profile error:', profileError)

      // If no profile exists, try to create one automatically
      if (profileError && profileError.code === 'PGRST116') {
        console.log('🆕 Admin page: Profile missing, attempting to create new profile...')
        setStatus('Profile missing, creating new profile...')
        
        try {
          const { data: newProfile, error: insertError } = await supabase
            .from('user_profiles')
            .insert([{
              id: user.id,
              email: user.email,
              role: 'user'
            }])
            .select('id, email, role')
            .single()

          if (insertError) {
            console.error('❌ Admin page: Error creating user profile:', insertError)
            console.error('❌ Admin page: Insert error details:', {
              code: insertError.code,
              message: insertError.message,
              details: insertError.details,
              hint: insertError.hint
            })
            
            // Check if it's an RLS policy error
            if (insertError.code === '42501' || insertError.message?.includes('permission denied')) {
              setError(`Permission denied: Unable to create user profile. This is likely due to missing Row Level Security INSERT policy. Please run this SQL in your Supabase SQL editor:

CREATE POLICY "Users can create their own profile" ON user_profiles 
FOR INSERT WITH CHECK (auth.uid() = id);`)
            } else {
              setError(`Failed to create profile: ${insertError.message || 'Unknown error'}`)
            }
            return
          }

          console.log('✅ Admin page: Profile created:', newProfile)
          setProfile(newProfile)
          setStatus('Profile created successfully')
          
          // After creating profile, check role
          if (newProfile.role !== 'admin') {
            console.log('❌ Admin page: Role mismatch - user role:', newProfile.role)
            setStatus('Access denied - admin role required')
            return
          }
        } catch (error) {
          console.error('❌ Admin page: Unexpected error during profile creation:', error)
          setError(`Unexpected error during profile creation: ${error instanceof Error ? error.message : 'Unknown error'}`)
          return
        }
      } else if (profileError) {
        // Handle other profile errors
        console.error('❌ Admin page: Error fetching user profile:', profileError)
        setError(`Database error: ${profileError.message}`)
        router.push('/login')
        return
      } else if (profile) {
        console.log('✅ Admin page: Profile found:', profile)
        setProfile(profile)
        
        if (profile.role !== 'admin') {
          console.log('❌ Admin page: Role mismatch - user role:', profile.role)
          setStatus('Access denied - admin role required')
          return
        }
      }

      // If we reach here, user has admin role
      console.log('✅ Admin page: Authentication and authorization successful!')
      console.log('📊 Admin page: Final user data:', { 
        id: user.id, 
        email: user.email, 
        role: profile?.role 
      })
      setStatus('Admin access granted')

    } catch (error) {
      console.error('💥 Admin page: Unexpected error in admin page:', error)
      setError(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
          <p className="mt-4 text-gray-600">{status || 'Loading...'}</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm border p-6">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Authentication Error</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => router.push('/login')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Show access denied for non-admin users
  if (user && profile && profile.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm border p-6">
          <div className="text-center">
            <div className="text-yellow-500 text-4xl mb-4">🔒</div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Admin Access Required</h1>
            <p className="text-gray-600 mb-4">
              You are logged in as <strong>{user.email}</strong>, but your role is <strong>&apos;{profile.role}&apos;</strong>.
            </p>
            <p className="text-gray-600 mb-6">
              Admin access is required to view this page.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => router.push('/')}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Go to Gallery
              </button>
              <button
                onClick={() => router.push('/login')}
                className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
              >
                Switch Account
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show admin panel for admin users
  if (user && profile && profile.role === 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <UnifiedNavbar />
        <AdminPanel />
      </div>
    );
  }

  // Fallback loading state
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <UnifiedNavbar />
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Finalizing access...</p>
      </div>
    </div>
  )
}