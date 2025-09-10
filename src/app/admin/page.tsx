import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase-server'
import AdminPanel from './AdminPanel'

export default async function AdminPage() {
  const supabase = await createServerClient()

  try {
    // Get the current user session
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error('Authentication error:', userError)
      redirect('/login')
    }
    
    if (!user) {
      redirect('/login')
    }

    // Check user role in user_profiles table
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching user profile:', profileError)
      redirect('/login')
    }

    if (!profile || profile.role !== 'admin') {
      redirect('/login')
    }

    // User is authenticated and has admin role
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold">✅ Welcome Admin</h1>
        <AdminPanel />
      </div>
    )

  } catch (error) {
    console.error('Unexpected error in admin page:', error)
    redirect('/login')
  }
}