'use client'

import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface Prompt {
  id: string
  title: string
  description: string
  hidden_prompt: string
  result_url: string | null
  model_used: string | null
  category_id: string
  categories: {
    id: string
    name: string
  }
  user_id: string
  created_at: string
}

export default function PromptDetailsPage() {
  const [prompt, setPrompt] = useState<Prompt | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const params = useParams()
  const router = useRouter()

  useEffect(() => {
    if (params.id) {
      fetchPrompt(params.id as string)
    }
  }, [params.id])

  const fetchPrompt = async (id: string) => {
    try {
      if (!isSupabaseConfigured()) {
        setError('Supabase is not configured. Please create a .env.local file with your Supabase credentials.')
        setLoading(false)
        return
      }

      const { data, error } = await supabase
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

      if (error) throw error
      setPrompt(data)
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
                <div className="flex items-center space-x-4 text-sm text-gray-500">
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
                <button
                  onClick={() => copyToClipboard(prompt.hidden_prompt)}
                  className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                >
                  {copied ? '✓ Copied!' : '📋 Copy'}
                </button>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed">
                  {prompt.hidden_prompt}
                </pre>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => copyToClipboard(prompt.hidden_prompt)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {copied ? '✓ Copied to Clipboard!' : '📋 Copy Prompt'}
              </button>
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
