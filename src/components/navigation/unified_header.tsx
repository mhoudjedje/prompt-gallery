'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getClientSupabase } from '@/lib/supabase-browser'

export default function UnifiedHeader() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = getClientSupabase()

  useEffect(() => {
    let mounted = true;

    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (mounted) {
          setUser(user)
          
          // Load avatar if user exists
          if (user) {
            await loadUserProfile(user.id)
          }
        }
      } catch (error) {
        console.error('Error checking user:', error)
        if (mounted) {
          setUser(null)
          setAvatarUrl(null)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    const loadUserProfile = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('avatar_url')
          .eq('id', userId)
          .single()
        
        if (!error && data?.avatar_url && mounted) {
          setAvatarUrl(data.avatar_url)
        }
      } catch (error) {
        // Silently fail - avatar is not critical
        console.error('Error loading user profile:', error)
      }
    }

    checkUser()
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (mounted) {
        const newUser = session?.user ?? null
        setUser(newUser)
        
        if (newUser) {
          await loadUserProfile(newUser.id)
        } else {
          setAvatarUrl(null)
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  // Show loading state
  if (loading) {
    return (
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-semibold text-gray-900">
              Promptly
            </Link>
            <nav className="hidden md:flex items-center space-x-6 text-sm">
              <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>
      </header>
    )
  }

  // Show authenticated header
  if (user) {
    const isAdmin = user.email === 'houdjedjem@gmail.com'
    
    return (
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-gray-900">
                Prompt Gallery
              </Link>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                Home
              </Link>
              <Link href="/gallery" className="text-gray-600 hover:text-gray-900">
                Gallery
              </Link>
              {isAdmin && (
                <Link href="/admin" className="text-gray-600 hover:text-gray-900">
                  <span className="text-red-600 font-bold">Admin</span>
                </Link>
              )}
            </nav>

            <div className="flex items-center space-x-4">
              <Link
                href="/profile"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <div className="w-8 h-8 rounded-full border-2 border-gray-300 overflow-hidden">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-indigo-600">
                        {user.email?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                </div>
                <span className="text-sm text-gray-600 hidden sm:block">
                  {user.email || 'Unknown'}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900 text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>
    )
  }

  // Show landing header for non-authenticated users
  return (
    <header className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/" className="text-xl font-semibold text-gray-900">
            Promptly
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm">
            <Link href="/gallery" className="text-gray-600 hover:text-gray-900">Browse</Link>
            <Link href="#" className="text-gray-600 hover:text-gray-900">Categories</Link>
            <Link href="#" className="text-gray-600 hover:text-gray-900">Creators</Link>
            <Link href="#" className="text-gray-600 hover:text-gray-900">Pricing</Link>
          </nav>
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <Link href="/login" className="text-gray-600 hover:text-gray-900">Sign In</Link>
          <Link href="/signup" className="bg-gray-900 text-white px-3 py-2 rounded-md hover:bg-black">Get Started</Link>
        </div>
      </div>
    </header>
  )
}