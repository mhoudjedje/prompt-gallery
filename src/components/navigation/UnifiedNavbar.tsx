import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';

const UnifiedNavbar: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    let mounted = true;
    const getUser = async () => {
      setLoading(true);
      const { data } = await supabase.auth.getUser();
      if (mounted) {
        setUser(data.user);
        setLoading(false);
      }
    };
    getUser();
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      getUser();
    });
    return () => {
      mounted = false;
      listener?.subscription.unsubscribe();
    };
  }, [supabase]);

  if (loading) {
    return (
      <nav className="w-full h-16 flex items-center justify-between px-6 bg-white border-b animate-pulse">
        <div className="h-8 w-32 bg-gray-200 rounded" />
        <div className="h-8 w-24 bg-gray-200 rounded" />
      </nav>
    );
  }

  return (
    <nav className="w-full h-16 flex items-center justify-between px-6 bg-white border-b">
      <Link href="/" className="text-xl font-bold text-gray-900">Prompt Gallery</Link>
      {user ? (
        <div className="flex items-center gap-4">
          <Link href="/profile">
            <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold hover:ring-2 ring-blue-500">
              {user.email?.[0]?.toUpperCase() || 'U'}
            </div>
          </Link>
          <button
            className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm text-gray-700 border"
            onClick={async () => {
              await supabase.auth.signOut();
              router.push('/');
            }}
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-gray-700 hover:text-blue-600">Sign In</Link>
          <Link href="/signup" className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700">Sign Up</Link>
        </div>
      )}
    </nav>
  );
};

export default UnifiedNavbar;
