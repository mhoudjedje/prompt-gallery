import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getServerSupabase } from '@/lib/supabase-helpers';
import ContributorPortfolioClient from './ContributorPortfolioClient';

export const dynamic = 'force-dynamic';

export default async function ContributorPortfolio({ params }: { params: Promise<{ username: string }> }) {
  const supabase = getServerSupabase({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/login');
  }

  const { username } = await params;
  return <ContributorPortfolioClient username={username} />;
}