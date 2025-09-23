"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getClientSupabase } from '@/lib/supabase-browser';
import { User } from '@supabase/supabase-js';
import { getLogoClickDestination } from '@/lib/redirect-utils';

interface LogoButtonProps {
  className?: string;
  children: React.ReactNode;
}

export default function LogoButton({ className = "", children }: LogoButtonProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = getClientSupabase();

  useEffect(() => {
    let mounted = true;

    const getUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user ?? null;
        if (mounted) {
          setUser(user);
        }
      } catch (error) {
        console.error('Error loading user:', error);
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (mounted) {
        const newUser = session?.user ?? null;
        setUser(newUser);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogoClick = () => {
    if (loading) {
      // If still loading, default to landing page
      router.push('/');
      return;
    }

    const destination = getLogoClickDestination(!!user);
    router.push(destination);
  };

  return (
    <button
      onClick={handleLogoClick}
      className={`${className} hover:text-blue-600 transition-colors cursor-pointer`}
    >
      {children}
    </button>
  );
}