import ClientProfilePage from './profile_page';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getServerSupabase } from '@/lib/supabase-helpers';

type ServerProfile = {
  id: string
  email?: string
  full_name?: string
  avatar_url?: string
  subscription_status?: 'free' | 'premium' | string
  role?: string
}

type ServerConnectedAccount = { provider: string; connected: boolean }
type ServerNotificationSettings = { newsletter_enabled?: boolean }
type ServerUserActivity = { prompts_created?: number; prompts_used?: number }

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const supabase = getServerSupabase({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  const userId = session.user.id;

  // Fetch core profile server-side to avoid client skeletons
  let profile: ServerProfile = {
    id: userId,
    email: session.user.email || undefined,
    full_name: session.user.email ? session.user.email.split('@')[0] : undefined,
    subscription_status: 'free',
    role: 'user'
  };
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (!error && data) profile = data as ServerProfile;
  } catch {}

  // Best-effort fetch of optional tables
  let connectedAccounts: ServerConnectedAccount[] = [];
  try {
    const { data } = await supabase
      .from('connected_accounts')
      .select('provider, connected')
      .eq('user_id', userId);
    if (data) connectedAccounts = data as ServerConnectedAccount[];
  } catch {}

  let notificationSettings: ServerNotificationSettings = { newsletter_enabled: true };
  try {
    const { data } = await supabase
      .from('notifications_settings')
      .select('newsletter_enabled')
      .eq('user_id', userId)
      .single();
    if (data) notificationSettings = data as ServerNotificationSettings;
  } catch {}

  let userActivity: ServerUserActivity = { prompts_created: 0, prompts_used: 0 };
  try {
    const { data } = await supabase
      .from('user_activity')
      .select('prompts_created, prompts_used')
      .eq('user_id', userId)
      .single();
    if (data) userActivity = data as ServerUserActivity;
  } catch {}

  return (
    <ClientProfilePage
      session={session}
      initialData={{
        profile,
        connectedAccounts,
        notificationSettings,
        userActivity
      }}
    />
  );
}
