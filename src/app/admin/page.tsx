'use client'

import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface Category {
  id: string
  name: string
}

export default function AdminPage() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    hidden_prompt: '',
    result_url: '',
    model_used: '',
    category_id: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    try {
      if (isSupabaseConfigured()) {
        checkUser()
        fetchCategories()
      } else {
        setError('Supabase is not configured. Please create a .env.local file with your Supabase credentials.')
        setLoading(false)
      }
    } catch (error) {
      console.error('Supabase configuration error:', error)
      setError('Supabase is not configured. Please create a .env.local file with your Supabase credentials.')
      setLoading(false)
    }
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)
    } catch (err) {
      console.error('Error checking user:', err)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (error) throw error
      setCategories(data || [])
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      // Get the current user to ensure they're still logged in
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        throw new Error(`Authentication error: ${userError.message}`)
      }
      
      if (!currentUser) {
        throw new Error('You must be logged in to create a prompt')
      }

      // Insert the prompt with the current user's ID
      const { error } = await supabase
        .from('prompts')
        .insert([{
          title: formData.title,
          description: formData.description,
          hidden_prompt: formData.hidden_prompt,
          result_url: formData.result_url || null,
          model_used: formData.model_used || null,
          category_id: formData.category_id,
          user_id: currentUser.id
        }])

      if (error) {
        // Handle specific Supabase errors
        if (error.code === 'PGRST301') {
          throw new Error('You do not have permission to create prompts. Please contact an administrator.')
        } else if (error.code === '23503') {
          throw new Error('Invalid category selected. Please choose a valid category.')
        } else if (error.code === '23505') {
          throw new Error('A prompt with this title already exists. Please choose a different title.')
        } else {
          throw new Error(`Database error: ${error.message}`)
        }
      }

      setSuccess(true)
      setFormData({
        title: '',
        description: '',
        hidden_prompt: '',
        result_url: '',
        model_used: '',
        category_id: ''
      })
    } catch (err) {
      console.error('Error creating prompt:', err)
      setError(err instanceof Error ? err.message : 'Failed to create prompt')
    } finally {
      setSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600">Add new prompts to the gallery</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
              ✅ Prompt created successfully!
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Prompt Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter a descriptive title for your prompt"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe what this prompt does and how to use it"
              />
            </div>

            <div>
              <label htmlFor="result_url" className="block text-sm font-medium text-gray-700 mb-2">
                Result Image URL
              </label>
              <input
                type="url"
                id="result_url"
                name="result_url"
                value={formData.result_url}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/result-image.jpg"
              />
            </div>

            <div>
              <label htmlFor="model_used" className="block text-sm font-medium text-gray-700 mb-2">
                AI Model Used
              </label>
              <input
                type="text"
                id="model_used"
                name="model_used"
                value={formData.model_used}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., DALL-E 3, GPT-4, Midjourney"
              />
            </div>

            <div>
              <label htmlFor="hidden_prompt" className="block text-sm font-medium text-gray-700 mb-2">
                Hidden Prompt Content *
              </label>
              <textarea
                id="hidden_prompt"
                name="hidden_prompt"
                required
                rows={8}
                value={formData.hidden_prompt}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                placeholder="Enter the actual prompt text here..."
              />
            </div>

            <div>
              <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                id="category_id"
                name="category_id"
                required
                value={formData.category_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>


            <div className="flex justify-end space-x-4">
              <Link
                href="/gallery"
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Creating...' : 'Create Prompt'}
              </button>
            </div>
          </form>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-2xl font-bold text-gray-900">0</div>
            <div className="text-sm text-gray-600">Total Prompts</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-2xl font-bold text-gray-900">0</div>
            <div className="text-sm text-gray-600">Free Prompts</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-2xl font-bold text-gray-900">0</div>
            <div className="text-sm text-gray-600">Premium Prompts</div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
