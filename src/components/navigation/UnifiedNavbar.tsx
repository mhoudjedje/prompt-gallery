"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { User, type AuthChangeEvent, type Session } from '@supabase/supabase-js';

export default function UnifiedNavbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarLoading, setAvatarLoading] = useState<boolean>(false);
  const router = useRouter();
  const supabase = useMemo(() => (
    createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  ), []);

  useEffect(() => {
    let mounted = true;

    const getUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user ?? null;
        if (mounted) {
          setUser(user);
          if (user) {
            // Load avatar in background to avoid delaying navbar render
            void loadUserAvatar(user.id);
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
        if (mounted) {
          setUser(null);
          setAvatarUrl(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    const loadUserAvatar = async (userId: string) => {
      try {
        if (mounted) setAvatarLoading(true);
        const { data, error } = await supabase
          .from('user_profiles')
          .select('avatar_url')
          .eq('id', userId)
          .single();

        if (!error && data?.avatar_url && mounted) {
          setAvatarUrl(data.avatar_url);
        }
      } catch (error) {
        console.error('Error loading avatar:', error);
      } finally {
        if (mounted) setAvatarLoading(false);
      }
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      if (mounted) {
        const newUser = session?.user ?? null;
        setUser(newUser);
        if (newUser) {
          // Load avatar without blocking UI updates
          void loadUserAvatar(newUser.id);
        } else {
          setAvatarUrl(null);
        }
        
        // Only refresh router on significant auth changes
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          router.refresh();
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.refresh();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <nav className="w-full h-16 flex items-center justify-between px-6 bg-white border-b">
        <Link href="/" className="text-xl font-bold text-gray-900">
          Prompt Gallery
        </Link>
        <div className="flex items-center gap-4">
          <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
        </div>
      </nav>
    );
  }

  return (
    <nav className="w-full h-16 flex items-center justify-between px-6 bg-white border-b">
      <Link href="/" className="text-xl font-bold text-gray-900">
        Prompt Gallery
      </Link>

      {user ? (
        <div className="flex items-center gap-4">
          <Link href="/profile" className="flex items-center gap-2 hover:opacity-80">
            <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold hover:ring-2 ring-blue-500 overflow-hidden">
              {avatarLoading ? (
                <div className="w-full h-full bg-gray-300 animate-pulse" />
              ) : avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{user.email?.[0]?.toUpperCase() || 'U'}</span>
              )}
            </div>
          </Link>
          <button
            className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm text-gray-700 border"
            onClick={handleSignOut}
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-gray-700 hover:text-blue-600">
            Sign In
          </Link>
          <Link href="/signup" className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700">
            Sign Up
          </Link>
        </div>
      )}
    </nav>
  );
}
