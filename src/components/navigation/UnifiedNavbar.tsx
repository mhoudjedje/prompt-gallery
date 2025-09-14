"use client";

import Link from 'next/link';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function UnifiedNavbar() {
  const session = useSession();
  const router = useRouter();
  const supabase = useSupabaseClient();

  useEffect(() => {
    if (session) {
      // Redirect to profile page after login
      router.push('/profile');
    }
  }, [session, router]);

  async function signOut() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <nav className="flex items-center space-x-4">
      <Link href="/" className="text-gray-700 hover:text-gray-900">
        Home
      </Link>
      <Link href="/gallery" className="text-gray-700 hover:text-gray-900">
        Gallery
      </Link>
      {session ? (
        <>
          <Link href="/profile" className="text-gray-700 hover:text-gray-900">
            Profile
          </Link>
          <button onClick={signOut} className="text-gray-700 hover:text-gray-900">
            Sign Out
          </button>
        </>
      ) : (
        <>
          <Link href="/login" className="text-gray-700 hover:text-gray-900">
            Log In
          </Link>
          <Link href="/signup" className="text-gray-700 hover:text-gray-900">
            Sign Up
          </Link>
        </>
      )}
      <Link href="/admin" className="text-gray-700 hover:text-gray-900">
        Admin
      </Link>
    </nav>
  );
}
