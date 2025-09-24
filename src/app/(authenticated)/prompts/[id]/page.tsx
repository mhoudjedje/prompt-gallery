'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getClientSupabase } from '@/lib/supabase-browser'

interface Prompt {
  id: string
  title: string
  description: string
  hidden_prompt: string
  result_url: string | null
  model_used: string | null
  category_id: string
  is_free?: boolean | null
  categories: {
    id: string
    name: string
  }
  user_id: string
  created_at: string
}

interface ContributorProfile {
  id: string
  email?: string | null
  full_name?: string | null
  avatar_url?: string | null
}

export default function PromptDetailsPage() {
  const [prompt, setPrompt] = useState<Prompt | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [hasAccess, setHasAccess] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [contributor, setContributor] = useState<ContributorProfile | null>(null)
  const params = useParams()

  useEffect(() => {
    if (params.id) {
      fetchAll(params.id as string)
    }
  }, [params.id])

  const fetchAll = async (id: string) => {
    try {
      if (!isSupabaseConfigured()) {
        setError('Supabase is not configured. Please create a .env.local file with your Supabase credentials.')
        setLoading(false)
        return
      }

      // 1) Fetch prompt
      const { data: promptData, error: promptError } = await supabase
        .from('prompts')
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .eq('id', id)
        .single()

      if (promptError) throw promptError
      setPrompt(promptData as Prompt)

      // 2) Get current session (client side)
      const clientSupabase = getClientSupabase()
      const { data: sessionRes } = await clientSupabase.auth.getSession()
      const userId = sessionRes?.session?.user?.id ?? null
      setIsLoggedIn(Boolean(userId))

      // 3) Fetch contributor profile (best effort)
      if (promptData?.user_id) {
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('id, email, full_name, avatar_url')
          .eq('id', promptData.user_id)
          .maybeSingle()
        if (profileData) setContributor(profileData as ContributorProfile)
      }

      // 4) Determine access: free prompt, creator, or unlocked
      let unlocked = false
      if (userId) {
        if (promptData?.user_id === userId) {
          unlocked = true
        } else {
          const { data: unlockRow } = await supabase
            .from('unlocks')
            .select('id')
            .eq('user_id', userId)
            .eq('prompt_id', id)
            .maybeSingle()
          unlocked = Boolean(unlockRow)
        }
      }

      const free = Boolean((promptData as Prompt)?.is_free)
      setHasAccess(free || unlocked)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch prompt')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading prompt...</p>
        </div>
      </div>
    )
  }

  if (error || !prompt) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="text-red-600 text-xl mb-4">⚠️ Error</div>
          <p className="text-gray-600 mb-4">{error || 'Prompt not found'}</p>
          <Link
            href="/gallery"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Gallery
          </Link>
        </div>
      </div>
    )
  }

  const contributorDisplayName = useMemo(() => {
    if (!contributor) return 'Unknown contributor'
    return contributor.full_name || contributor.email || 'Unnamed user'
  }, [contributor])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/gallery"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            ← Back to Gallery
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {/* Image */}
          {prompt.result_url && (
            <div className="aspect-video bg-gray-200">
              <img
                src={prompt.result_url}
                alt={prompt.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="p-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {prompt.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <span className="bg-gray-100 px-3 py-1 rounded-full">
                    {prompt.categories?.name || 'Uncategorized'}
                  </span>
                  {prompt.model_used && (
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                      {prompt.model_used}
                    </span>
                  )}
                  <span>
                    {new Date(prompt.created_at).toLocaleDateString()}
                  </span>
                  {/* Contributor */}
                  <span className="inline-flex items-center gap-2">
                    {contributor?.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={contributor.avatar_url} alt={contributorDisplayName} className="h-6 w-6 rounded-full object-cover" />
                    ) : (
                      <span className="h-6 w-6 rounded-full bg-gray-200 inline-flex items-center justify-center text-xs">👤</span>
                    )}
                    <Link
                      href={`/profile`}
                      className="text-gray-700 hover:text-gray-900 underline-offset-2 hover:underline"
                    >
                      {contributorDisplayName}
                    </Link>
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
              <p className="text-gray-700 leading-relaxed">
                {prompt.description}
              </p>
            </div>

            {/* Hidden Prompt */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900">Prompt Content</h2>
                {hasAccess ? (
                  <button
                    onClick={() => copyToClipboard(prompt.hidden_prompt)}
                    className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                  >
                    {copied ? '✓ Copied!' : '📋 Copy'}
                  </button>
                ) : (
                  <Link
                    href={`/checkout/${prompt.id}`}
                    className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                  >
                    Buy this prompt
                  </Link>
                )}
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border">
                {hasAccess ? (
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed">
                    {prompt.hidden_prompt}
                  </pre>
                ) : (
                  <div className="relative">
                    <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed blur-sm select-none">
                      {prompt.hidden_prompt}
                    </pre>
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-gray-700 font-medium">Purchase to unlock</div>
                        <div className="mt-2">
                          <Link
                            href={`/checkout/${prompt.id}`}
                            className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                          >
                            Buy this prompt
                          </Link>
                        </div>
                        {!isLoggedIn && (
                          <div className="mt-2 text-xs text-gray-500">You are not logged in.</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4">
              {hasAccess ? (
                <button
                  onClick={() => copyToClipboard(prompt.hidden_prompt)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {copied ? '✓ Copied to Clipboard!' : '📋 Copy Prompt'}
                </button>
              ) : (
                <Link
                  href={`/checkout/${prompt.id}`}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Buy this prompt
                </Link>
              )}
              <Link
                href="/gallery"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Gallery
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
