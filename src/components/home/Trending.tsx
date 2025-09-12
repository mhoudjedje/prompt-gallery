"use client"
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getTrendingPrompts, searchPrompts, type Prompt } from '@/lib/queries'

export type GalleryCardProps = {
  title: string
  description: string
}

function GalleryCard({ title, description }: GalleryCardProps) {
  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <div className="h-28 rounded-md bg-gray-300" />
      <h4 className="mt-3 font-medium text-gray-900 text-sm">{title}</h4>
      <p className="mt-1 text-xs text-gray-600">{description}</p>
      <button className="mt-3 text-xs bg-gray-900 text-white px-3 py-2 rounded-md hover:bg-black">Copy Prompt</button>
    </div>
  )
}

export default function Trending() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    getTrendingPrompts(8).then((rows) => setPrompts(rows))
  }, [])

  async function handleSearch(value: string) {
    setQuery(value)
    if (!value.trim()) {
      const rows = await getTrendingPrompts(8)
      setPrompts(rows)
      return
    }
    const rows = await searchPrompts(value)
    setPrompts(rows)
  }

  const placeholder: GalleryCardProps[] = new Array(8).fill(null).map((_, i) => ({
    title: i % 2 === 0 ? 'Minimalist Logo Prompt' : 'Portrait Photography',
    description: i % 2 === 0
      ? 'Generate unique, modern logo designs with clean aesthetics.'
      : 'Create stunning portrait concepts with professional lighting.'
  }))

  const cards: GalleryCardProps[] = prompts.length > 0
    ? prompts.map((p: Prompt) => ({ title: p.title, description: p.description || '' }))
    : placeholder

  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Trending Prompts</h3>
          <Link href="#" className="text-sm text-gray-600 hover:text-gray-900">View All</Link>
        </div>
        <div className="mt-4 max-w-md">
          <input
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            type="text"
            placeholder="Search prompts, categories, or creators..."
            className="w-full border rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((c, idx) => (
            <GalleryCard key={idx} {...c} />
          ))}
        </div>
        {prompts.length === 0 && query.trim() && (
          <div className="mt-4 text-sm text-gray-500">No prompts found.</div>
        )}
      </div>
    </section>
  )
}


