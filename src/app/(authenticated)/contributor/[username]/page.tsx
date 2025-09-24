import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getServerSupabase } from '@/lib/supabase-helpers';
import ContributorPortfolioClient from './ContributorPortfolioClient';

export const dynamic = 'force-dynamic';

export default async function ContributorPortfolio({ params }: { params: Promise<{ username: string }> }) {
  const supabase = getServerSupabase({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  
  console.log('ContributorPortfolio: Session check', { hasSession: !!session, userId: session?.user?.id });
  
  if (!session) {
    console.log('ContributorPortfolio: No session, redirecting to login');
    redirect('/login');
  }

  const { username } = await params;
  console.log('ContributorPortfolio: Rendering with username', username);
  
  return <ContributorPortfolioClient username={username} />;
}