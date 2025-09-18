import ClientProfilePage from './profile_page';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getServerSupabase } from '@/lib/supabase-helpers';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const supabase = getServerSupabase({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');
  return <ClientProfilePage session={session} />;
}
