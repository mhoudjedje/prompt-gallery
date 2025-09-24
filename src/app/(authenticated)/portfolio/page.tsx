import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getServerSupabase } from '@/lib/supabase-helpers';

export const dynamic = 'force-dynamic';

export default async function PortfolioPage() {
  const supabase = getServerSupabase({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  
  console.log('PortfolioPage: Session check', { hasSession: !!session, userId: session?.user?.id });
  
  if (!session) {
    console.log('PortfolioPage: No session, redirecting to login');
    redirect('/login');
  }

  console.log('PortfolioPage: Rendering portfolio page');
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
            ME
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Portfolio
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            @{session.user.email?.split('@')[0] || session.user.id}
          </p>
          <p className="text-gray-700 leading-relaxed max-w-2xl mx-auto mb-6">
            Welcome to your contributor portfolio! This is your space to showcase your creative work and connect with other prompt creators.
          </p>
          <button className="inline-flex items-center px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">
            Create Your First Prompt
          </button>
        </div>
      </div>
      
      {/* Stats Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">0</div>
            <div className="text-sm text-gray-600">Prompts Uploaded</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">0</div>
            <div className="text-sm text-gray-600">Prompts Sold</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">0.0</div>
            <div className="text-sm text-gray-600">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">$0.00</div>
            <div className="text-sm text-gray-600">Total Earnings</div>
          </div>
        </div>
      </div>
      
      {/* Empty State */}
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Prompts Yet</h3>
          <p className="text-gray-500 mb-6">
            You haven&apos;t uploaded any prompts yet. Start by creating your first prompt to build your portfolio!
          </p>
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">
            Upload Your First Prompt
          </button>
        </div>
      </div>
    </div>
  );
}