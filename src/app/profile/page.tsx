import ClientProfilePage from './profile_page';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const supabase = createClientComponentClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');
  return <ClientProfilePage />;
}
